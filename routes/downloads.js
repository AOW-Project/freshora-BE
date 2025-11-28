import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        // items: true,
      },
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("EXPORT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export orders",
    });
  }
});

// single order
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

export default router;
