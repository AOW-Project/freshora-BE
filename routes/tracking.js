import express from "express";
import { prisma } from "../lib/prisma.js"; // Use the shared Prisma instance

const router = express.Router();

// GET /api/tracking/:orderNumber - Track order by order number
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

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
        items: { // Corrected relation name
          select: {
            itemName: true,
            category: true,
            quantity: true,
            price: true,
            subtotal: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check your order number.",
      });
    }

    const statusProgress = {
      PENDING: 10,
      CONFIRMED: 20,
      PICKED_UP: 40,
      IN_PROGRESS: 60,
      READY: 80,
      OUT_FOR_DELIVERY: 90,
      DELIVERED: 100,
      CANCELLED: 0,
    };

    const trackingInfo = {
      orderNumber: order.orderNumber,
      status: order.status,
      progress: statusProgress[order.status] || 0,
      createdAt: order.createdAt,
      pickupDate: order.pickupDate,
      deliveryDate: order.deliveryDate,
      service: order.service,
      totalAmount: order.totalAmount,
      specialInstructions: order.specialInstructions,
      customer: order.customer,
      items: order.items,
      statusHistory: order.statusHistory.map((history) => ({
        status: history.status,
        notes: history.notes,
        timestamp: history.createdAt,
      })),
    };

    res.json({
      success: true,
      data: trackingInfo,
    });
  } catch (error) {
    console.error("Error tracking order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track order",
    });
  }
});

// GET /api/tracking - Track multiple orders by email
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required",
      });
    }

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        orders: {
          include: {
            items: { // Corrected relation name
              select: {
                itemName: true,
                quantity: true,
                subtotal: true,
              },
            },
            statusHistory: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this email address",
      });
    }

    const ordersWithProgress = customer.orders.map((order) => {
      const statusProgress = {
        PENDING: 10,
        CONFIRMED: 20,
        PICKED_UP: 40,
        IN_PROGRESS: 60,
        READY: 80,
        OUT_FOR_DELIVERY: 90,
        DELIVERED: 100,
        CANCELLED: 0,
      };

      return {
        orderNumber: order.orderNumber,
        status: order.status,
        progress: statusProgress[order.status] || 0,
        createdAt: order.createdAt,
        pickupDate: order.pickupDate,
        deliveryDate: order.deliveryDate,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        latestUpdate: order.statusHistory[0]?.createdAt || order.createdAt,
      };
    });

    res.json({
      success: true,
      data: {
        customer: {
          name: customer.name,
          email: customer.email,
        },
        orders: ordersWithProgress,
      },
    });
  } catch (error) {
    console.error("Error tracking orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track orders",
    });
  }
});

export default router;