import express from "express";
import { prisma } from "../lib/prisma.js"; // Use the shared Prisma instance

const router = express.Router();

// GET /api/customers/:email/orders - Get customer orders by email
router.get("/:email/orders", async (req, res) => {
  try {
    const { email } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { email },
      include: {
        orders: {
          include: {
            items: true,
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
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: {
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        orders: customer.orders,
      },
    });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
    });
  }
});

// GET /api/customers - Get all customers (admin)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
});

export default router;