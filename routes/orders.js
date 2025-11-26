import express from "express";
import Joi from "joi";
import { prisma } from "../lib/prisma.js";
import emailService from "../services/emailService.js";

import multer from "multer";
import { uploadToS3, deleteFromS3 } from "../lib/s3.js";

const upload = multer({
  storage: multer.memoryStorage(),
});

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
    date: Joi.string().isoDate().required(), // Changed to accept ISO date strings
    time: Joi.string().required(),
    address: Joi.string().required().min(5),
    instructions: Joi.string().optional().allow(""),
  }).required(),
  deliveryInfo: Joi.object({
    date: Joi.string().isoDate().optional(), // Changed to accept ISO date strings
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
  source: Joi.string().valid("ONLINE", "OFFLINE").optional(),
  isCustom: Joi.boolean().optional(),
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
    console.log(
      "[DEBUG] Received order request:",
      JSON.stringify(req.body, null, 2)
    );

    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      console.error("[VALIDATION ERROR]:", error.details);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((d) => d.message),
      });
    }

    const {
      name,
      customerInfo,
      pickupInfo,
      deliveryInfo,
      cartItems,
      totalAmount,
      source,
    } = value;
    const orderNumber = generateOrderNumber();

    console.log("[DEBUG] Validation passed, creating order...");
    console.log("[DEBUG] Customer info:", customerInfo);
    console.log("[DEBUG] Cart items:", cartItems);

    const result = await prisma.$transaction(async (tx) => {
      console.log("[DEBUG] Starting transaction...");

      // Create or update customer
      const customer = await tx.customer.upsert({
        where: { email: customerInfo.email },
        update: {
          name,
          phone: customerInfo.phone || "",
          address: customerInfo.address,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode || "",
        },
        create: {
          name,
          email: customerInfo.email,
          phone: customerInfo.phone || "",
          address: customerInfo.address,
          city: customerInfo.city,
          zipCode: customerInfo.zipCode || "",
        },
      });

      console.log("[DEBUG] Customer created/updated:", customer.id);

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          pickupDate: new Date(pickupInfo.date),
          deliveryDate: deliveryInfo?.date ? new Date(deliveryInfo.date) : null,
          service: cartItems[0]?.serviceSlug || "laundry-services",
          specialInstructions: pickupInfo.instructions || "",
          totalAmount,
          status: "PENDING",
          source: source || "ONLINE",
        },
      });

      console.log("[DEBUG] Order created:", order.id);

      // Create order items with better error handling
      const orderItemsData = await Promise.all(
        cartItems.map(async (item) => {
          let serviceId = null;
          let serviceItemId = null;
          let isCustom = false;
          let customServiceId = null;
          let customItemId = null;

          const parts = item.id.split("-");

          // check if DB item exists
          const dbItem = await prisma.serviceItem.findUnique({
            where: { id: parts[1] },
          });

          if (dbItem) {
            serviceId = parts[0];
            serviceItemId = parts[1];
          } else {
            // custom item
            isCustom = true;
            customServiceId = parts[0];
            customItemId = parts[1];
          }

          return {
            orderId: order.id,
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            serviceType: item.serviceSlug,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,

            // DB items
            serviceId,
            serviceItemId,

            // custom items
            isCustom,
            customServiceId,
            customItemId,
          };
        })
      );

      console.log("[DEBUG] Order items data:", orderItemsData);

      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      console.log("[DEBUG] Order items created");

      // Create status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "PENDING",
          notes: "Order placed and awaiting confirmation.",
        },
      });

      console.log("[DEBUG] Status history created");

      return { order, customer };
    });

    console.log("[DEBUG] Transaction completed successfully");

    // Send confirmation email (don't let email failures break the order)
    try {
      await emailService.sendOrderConfirmation({
        customerEmail: result.customer.email,
        customerName: result.customer.name,
        orderNumber,
        orderDetails: { ...value, customerInfo: result.customer },
      });
      console.log("[DEBUG] Confirmation email sent");
    } catch (emailError) {
      console.error(
        "[EMAIL ERROR] Failed to send confirmation email:",
        emailError
      );
      // Don't throw - order was successful even if email failed
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
    console.error("[CRITICAL ERROR] Error creating order:", error);
    console.error("[ERROR STACK]:", error.stack);

    // Provide more detailed error info in development
    const isDevelopment = process.env.NODE_ENV === "development";

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred while creating the order.",
      ...(isDevelopment && {
        error: error.message,
        stack: error.stack,
        details: {
          name: error.name,
          code: error.code,
        },
      }),
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: true,
        items: { include: { orderItemRemark: true } },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order." });
  }
});

// PUT /api/orders/:orderNumber - Update full order details
router.put("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const {
      status,
      pickupDate,
      notes,
      specialInstructions,
      totalAmount,
      source,
    } = req.body;

    // Valid statuses
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PICKED_UP",
      "IN_PROGRESS",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Fetch existing order
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: { customer: true },
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Prepare update data (only update provided fields)
    const updateData = {};
    if (status) updateData.status = status;
    if (pickupDate) updateData.pickupDate = new Date(pickupDate);
    if (notes !== undefined) updateData.notes = notes;
    if (specialInstructions !== undefined)
      updateData.specialInstructions = specialInstructions;
    if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
    if (source !== undefined) updateData.source = source;

    // Build transaction array
    const txTasks = [
      prisma.order.update({
        where: { orderNumber },
        data: updateData,
      }),
    ];

    let statusChanged = false;

    if (status && status !== existingOrder.status) {
      statusChanged = true;

      txTasks.push(
        prisma.orderStatusHistory.create({
          data: {
            orderId: existingOrder.id,
            status,
            notes: notes || `Status updated to ${status}`,
          },
        })
      );
    }

    // Run transaction (MYSQL SAFE)
    const [updatedOrder] = await prisma.$transaction(txTasks);

    // Send email OUTSIDE DB transaction
    // if (statusChanged) {
    //   emailService
    //     .sendStatusUpdate({
    //       customerEmail: existingOrder.customer.email,
    //       customerName: existingOrder.customer.name,
    //       orderNumber,
    //       newStatus: status,
    //       notes,
    //     })
    //     .catch((err) =>
    //       console.error("Failed to send email:", err)
    //     );
    // }

    res.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Order update error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order",
    });
  }
});

// GET /api/orders - Get all orders (for admin dashboard)
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      startDate,
      endDate,
      source, // "online" | "offline"
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // -----------------------------
    // BUILD WHERE FILTER
    // -----------------------------
    const where = {};

    // Filter by status
    if (status) where.status = status;

    // Filter by order source
    if (source) where.source = source; // assuming field "source" exists

    // Filter by date range
    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // end of day fix → include entire day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        where.createdAt.lte = end;
      }
    }

    // Search functionality (orderNumber, customer name, email, phone)
    if (search) {
      where.OR = [
        // Search by order number
        {
          orderNumber: {
            contains: search,
          },
        },

        // Search by customer name
        {
          customer: {
            is: {
              name: {
                contains: search,
              },
            },
          },
        },

        // Search by customer email
        {
          customer: {
            is: {
              email: {
                contains: search,
              },
            },
          },
        },

        // Search by customer phone
        {
          customer: {
            is: {
              phone: {
                contains: search,
              },
            },
          },
        },
      ];
    }

    // -----------------------------
    // FETCH DATA
    // -----------------------------
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

    // -----------------------------
    // RESPONSE
    // -----------------------------
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
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders.",
    });
  }
});

// Update remark image
router.post(
  "/:orderId/items/:itemId/remark/image",
  upload.single("image"),
  async (req, res) => {
    try {
      const { itemId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Image file is required",
        });
      }

      // Upload to S3
      const imageUrl = await uploadToS3(
        req.file.buffer,
        req.file.originalname,
        "order-item-remarks"
      );

      // If remark exists, delete previous image from S3
      const existing = await prisma.orderItemRemark.findUnique({
        where: { orderItemId: itemId },
      });

      if (existing?.imageUrl) {
        await deleteFromS3(existing.imageUrl);
      }

      // Upsert remark with new image
      const remark = await prisma.orderItemRemark.upsert({
        where: { orderItemId: itemId },
        create: {
          orderItemId: itemId,
          imageUrl,
        },
        update: {
          imageUrl,
        },
      });

      return res.json({
        success: true,
        message: "Remark image uploaded successfully",
        remark,
      });
    } catch (error) {
      console.error("[REMARK IMAGE ERROR]:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload remark image",
        error: error.message,
      });
    }
  }
);

// Update Text Remark API
router.post("/:orderId/items/:itemId/remark", async (req, res) => {
  try {
    const { itemId } = req.params;
    const { remarks } = req.body;

    const remark = await prisma.orderItemRemark.upsert({
      where: { orderItemId: itemId },
      create: { orderItemId: itemId, remarks },
      update: { remarks },
    });

    res.json({
      success: true,
      message: "Remark updated",
      remark,
    });
  } catch (error) {
    console.error("[REMARK TEXT ERROR]:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update remark",
    });
  }
});

// DELETE /api/orders/:orderNumber
router.delete("/:orderNumber", async (req, res) => {
  const { orderNumber } = req.params;

  try {
    // Find the order
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    //  Delete related data manually (since some relations are optional)

    // Delete remarks linked to orderItems
    await prisma.orderItemRemark.deleteMany({
      where: {
        orderItemId: {
          in: order.items.map((i) => i.id),
        },
      },
    });

    // Delete order items
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id },
    });

    // Delete status history
    await prisma.orderStatusHistory.deleteMany({
      where: { orderId: order.id },
    });

    // Finally delete the order
    await prisma.order.delete({
      where: { id: order.id },
    });

    return res.json({
      success: true,
      message: "Order and all related data deleted successfully",
    });
  } catch (error) {
    console.error("[ORDER DELETE ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
});

export default router;
