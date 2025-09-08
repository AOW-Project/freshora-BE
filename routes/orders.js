import express from "express";
import Joi from "joi";
import { prisma } from "../lib/prisma.js";
import * as emailService from "../services/emailService.js";

const router = express.Router();

// Validation schema for incoming order data
const createOrderSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  customerInfo: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().optional().allow(""),
    address: Joi.string().required().min(5),
    city: Joi.string().required().min(2),
    zipCode: Joi.string().optional().allow("").min(3),
  }).required(),
  pickupInfo: Joi.object({
    date: Joi.date().iso().required(),
    time: Joi.string().required(),
    address: Joi.string().required().min(5),
    instructions: Joi.string().optional().allow(""),
  }).required(),
  deliveryInfo: Joi.object({
    date: Joi.date().iso().optional(),
    time: Joi.string().optional().allow(""),
    address: Joi.string().optional().allow(""),
  }).optional(),
  cartItems: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        category: Joi.string().required(),
        serviceSlug: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  totalAmount: Joi.number().positive().required(),
  paymentMethod: Joi.string().optional().allow(""),
});

// Helper function to generate a unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `LS${timestamp}${random}`;
}

// POST /api/orders - Create a new order
router.post("/", async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const { name, customerInfo, pickupInfo, deliveryInfo, cartItems, totalAmount } = value;
    const orderNumber = generateOrderNumber();

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: customerInfo.email },
        update: { name, phone: customerInfo.phone, address: customerInfo.address, city: customerInfo.city, zipCode: customerInfo.zipCode },
        create: { name, email: customerInfo.email, phone: customerInfo.phone, address: customerInfo.address, city: customerInfo.city, zipCode: customerInfo.zipCode },
      });

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          pickupDate: new Date(pickupInfo.date),
          deliveryDate: deliveryInfo?.date ? new Date(deliveryInfo.date) : null,
          service: cartItems[0]?.serviceSlug || "laundry-services",
          specialInstructions: pickupInfo.instructions,
          totalAmount,
          status: "PENDING",
        },
      });

      // ✅ CORRECTED LOGIC FOR ORDER ITEMS
      const orderItemsData = cartItems.map(item => {
        // The item ID from the frontend is composite, e.g., "serviceId-serviceItemId"
        const [serviceId, serviceItemId] = item.id.split('-');
        
        return {
          orderId: order.id,
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          serviceType: item.serviceSlug,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
          serviceId: serviceId, // <-- ADDED THIS
          serviceItemId: serviceItemId, // <-- ADDED THIS
        };
      });

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "PENDING",
          notes: "Order placed and awaiting confirmation.",
        },
      });

      return { order, customer };
    });

    try {
      await emailService.sendOrderConfirmation({
        customerEmail: result.customer.email,
        customerName: result.customer.name,
        orderNumber,
        orderDetails: { ...value, customerInfo: result.customer },
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully!",
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the order.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ... (GET, PUT, and other routes remain the same)
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true, // Include the full related customer object
        items: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
});

// PUT /api/orders/:orderNumber/status - Update an order's status
router.put("/:orderNumber/status", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["PENDING", "CONFIRMED", "PICKED_UP", "IN_PROGRESS", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status provided." });
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { orderNumber },
        data: { status },
        include: { customer: true },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status,
          notes,
        },
      });

      return order;
    });

    try {
      await emailService.sendStatusUpdate({
        customerEmail: updatedOrder.customer.email,
        customerName: updatedOrder.customer.name,
        orderNumber,
        newStatus: status,
        notes,
      });
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }

    res.json({ success: true, message: "Order status updated successfully.", data: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Failed to update order status." });
  }
});

// GET /api/orders - Get all orders (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: { name: true, email: true, phone: true },
          },
          items: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
});
export default router;