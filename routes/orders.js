const express = require("express")
const { PrismaClient } = require("@prisma/client")
const { v4: uuidv4 } = require("uuid")
const Joi = require("joi")
const emailService = require("../services/emailService")

const router = express.Router()
const prisma = new PrismaClient()

// Validation schema for order creation
const createOrderSchema = Joi.object({
  // Customer details
  name: Joi.string().required().min(2).max(100),
customerInfo: Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().optional().allow(""),
  address: Joi.string().required().min(5),
  city: Joi.string().required().min(2),
  zipCode: Joi.string().optional().allow("").min(3),
}).required(),


  // Pickup information
  pickupInfo: Joi.object({
    date: Joi.date().iso().required(),
    time: Joi.string().required(),
    address: Joi.string().required().min(5),
    instructions: Joi.string().optional().allow(""),
  }).required(),

  // Delivery information
  deliveryInfo: Joi.object({
    date: Joi.date().iso().optional(),
    time: Joi.string().optional().allow(""),
    address: Joi.string().optional().allow(""),
  }).optional(),

  // Cart items
  cartItems: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        category: Joi.string().required(),
        serviceSlug: Joi.string().required(),
      }),
    )
    .min(1)
    .required(),

  // Payment and total
  totalAmount: Joi.number().positive().required(),
  paymentMethod: Joi.string().optional().allow(""),
})

// Generate unique order number
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `FL${timestamp}${random}`
}

// POST /api/orders - Create new order
router.post("/", async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createOrderSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => detail.message),
      })
    }

    const { name, customerInfo, pickupInfo, deliveryInfo, cartItems, totalAmount, paymentMethod } = value

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order with customer and items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or find customer
      let customer = await tx.customer.findUnique({
        where: { email: customerInfo.email },
      })

      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name,
            email: customerInfo.email,
            phone: customerInfo.phone || null,
            address: customerInfo.address,
            city: customerInfo.city,
            zipCode: customerInfo.zipCode || null,
          },
        })
      } else {
        // Update customer info if provided
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: {
            name,
            phone: customerInfo.phone || customer.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            zipCode: customerInfo.zipCode,
          },
        })
      }

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          pickupDate: new Date(pickupInfo.date),
          deliveryDate: deliveryInfo?.date ? new Date(deliveryInfo.date) : null,
          service: cartItems[0]?.serviceSlug || "laundry-services",
          specialInstructions: pickupInfo.instructions || null,
          totalAmount,
          status: "PENDING",
        },
      })

      // Create order items
      const orderItems = await Promise.all(
        cartItems.map((item) =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              itemId: item.id,
              itemName: item.name,
              category: item.category,
              serviceType: item.serviceSlug,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.price * item.quantity,
            },
          }),
        ),
      )

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "PENDING",
          notes: "Order created and awaiting confirmation",
        },
      })

      return { order, customer, orderItems }
    }, {
      timeout: 15000, // <-- THE FIX: Increase timeout to 15 seconds
    })

    // Send confirmation email
    try {
      await emailService.sendOrderConfirmation({
        customerEmail: customerInfo.email,
        customerName: name,
        orderNumber,
        orderDetails: {
          service: cartItems[0]?.serviceSlug || "laundry-services",
          pickupDate: pickupInfo.date,
          deliveryDate: deliveryInfo?.date,
          totalAmount,
          items: cartItems,
          specialInstructions: pickupInfo.instructions,
          customerInfo: {
            email: customerInfo.email,
            phone: customerInfo.phone,
            address: customerInfo.address,
            city: customerInfo.city,
            zipCode: customerInfo.zipCode,
          },
        },
      })
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError)
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        estimatedDelivery: result.order.deliveryDate,
      },
    })
  } catch (error) {
    console.error("Error creating order:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
})

// GET /api/orders/:orderNumber - Get order by order number
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            zipCode: true,
          },
        },
        orderItems: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    res.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    })
  }
})

// PUT /api/orders/:orderNumber/status - Update order status
router.put("/:orderNumber/status", async (req, res) => {
  try {
    const { orderNumber } = req.params
    const { status, notes } = req.body

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PICKED_UP",
      "IN_PROGRESS",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update order status
      const order = await tx.order.update({
        where: { orderNumber },
        data: {
          status,
          updatedAt: new Date(),
        },
        include: {
          customer: true,
        },
      })

      // Add status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status,
          notes: notes || null,
        },
      })

      return order
    })

    // Send status update email
    try {
      await emailService.sendStatusUpdate({
        customerEmail: result.customer.email,
        customerName: result.customer.name,
        orderNumber,
        newStatus: status,
        notes,
      })
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError)
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: {
        orderNumber: result.orderNumber,
        status: result.status,
        updatedAt: result.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    })
  }
})

// GET /api/orders - Get all orders (admin)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query
    const skip = (page - 1) * limit

    const where = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { email: { contains: search } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          orderItems: true,
        },
        orderBy: { createdAt: "desc" },
        skip: Number.parseInt(skip),
        take: Number.parseInt(limit),
      }),
      prisma.order.count({ where }),
    ])

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    })
  }
})

module.exports = router