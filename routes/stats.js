import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

/**
 * GET /stats?range=10d|30d|lifetime
 * returns:
 * {
 *  pendingOrders: number,
 *  pendingPickup: number,
 *  pendingDeliveries: number,
 *  pendingCollection: number, // currency number
 *  totalRevenue: number,
 *  totalUnitsByServiceType: [{ serviceType, units }],
 *  totalGrowthPercent: number | null,
 *  meta: { startDate, endDate }
 * }
 */

function parseRange(range) {
  const now = new Date();
  if (range === "10d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 10);
    return { start, end: now };
  }
  if (range === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { start, end: now };
  }
  // lifetime -> no start (return null for start)
  return { start: null, end: now };
}

function prevRange(start, end) {
  // returns previous period of same length: [prevStart, prevEnd)
  const dur = end.getTime() - (start ? start.getTime() : 0);
  const prevEnd = new Date(start);
  const prevStart = new Date(prevEnd.getTime() - dur);
  return { prevStart, prevEnd };
}

router.get("/", async (req, res) => {
  try {
    const range = req.query.range || "10d";
    const { start, end } = parseRange(range);

    // Build where for date-limited queries
    const dateFilter = start ? { createdAt: { gte: start, lte: end } } : {};

    // pending orders (count) — status PENDING
    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
        ...(start ? { createdAt: { gte: start, lte: end } } : {}),
      },
    });

    // pending pickup — status PENDING AND pickupDate within range
    const pendingPickup = await prisma.order.count({
      where: {
        status: "PENDING",
        pickupDate: start ? { gte: start, lte: end } : undefined,
      },
    });

    // pending deliveries (count) — OUT_FOR_DELIVERY
    const pendingDeliveries = await prisma.order.count({
      where: {
        status: "OUT_FOR_DELIVERY",
        ...(start ? { createdAt: { gte: start, lte: end } } : {}),
      },
    });

    // pending collection (sum) — assume DELIVERED orders -> amount not yet collected
    const pendingCollectionAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "DELIVERED",
        ...(start ? { createdAt: { gte: start, lte: end } } : {}),
      },
    });
    const pendingCollection = pendingCollectionAgg._sum.totalAmount || 0;

    // total revenue (sum of totalAmount for DELIVERED orders in range)
    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: "DELIVERED",
        ...(start ? { createdAt: { gte: start, lte: end } } : {}),
      },
    });
    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    // total units by service type: groupBy orderItems.serviceType summing quantity
    // We filter by order.createdAt using relation filter
    const unitsByService = await prisma.orderItem.groupBy({
      by: ["serviceType"],
      _sum: { quantity: true },
      where: start ? { order: { createdAt: { gte: start, lte: end } } } : {},
      orderBy: { _sum: { quantity: "desc" } },
    });

    const totalUnitsByServiceType = unitsByService.map((r) => ({
      serviceType: r.serviceType,
      units: r._sum.quantity || 0,
    }));

    // total growth: compare revenue for current range vs previous equivalent range
    let totalGrowthPercent = null;
    if (start) {
      const durationMs = end.getTime() - start.getTime();
      const prevStart = new Date(start.getTime() - durationMs);
      const prevEnd = new Date(start.getTime());

      const prevAgg = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: {
          status: "DELIVERED",
          createdAt: { gte: prevStart, lte: prevEnd },
        },
      });
      const prevRevenue = prevAgg._sum.totalAmount || 0;
      const curRevenue = totalRevenue;

      if (prevRevenue === 0 && curRevenue === 0) {
        totalGrowthPercent = 0;
      } else if (prevRevenue === 0 && curRevenue > 0) {
        totalGrowthPercent = 100; // or null / Infinity — choose 100
      } else {
        totalGrowthPercent = ((curRevenue - prevRevenue) / prevRevenue) * 100;
      }
    }

    return res.json({
      pendingOrders,
      pendingPickup,
      pendingDeliveries,
      pendingCollection,
      totalRevenue,
      totalUnitsByServiceType,
      totalGrowthPercent:
        totalGrowthPercent === null
          ? null
          : Number(totalGrowthPercent.toFixed(2)),
      meta: {
        startDate: start ? start.toISOString() : null,
        endDate: end.toISOString(),
      },
    });
  } catch (err) {
    console.error("GET /stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    // do not disconnect Prisma client in server apps; let process handle it
  }
});

router.get("/ongoing", async (req, res) => {
  try {
    // Get pagination params
    const page = parseInt(req.query.page) || 1; // default 1
    const limit = parseInt(req.query.limit) || 10; // default 10
    const skip = (page - 1) * limit;

    // Count total ongoing orders
    const totalOrders = await prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "PICKED_UP", "IN_PROGRESS", "OUT_FOR_DELIVERY"],
        },
      },
    });

    // Fetch paginated orders
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PICKED_UP", "IN_PROGRESS", "OUT_FOR_DELIVERY"],
        },
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Format output
    const formatted = orders.map((o) => {
      const totalUnits = o.items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        orderId: o.orderNumber,
        customerName: o.customer?.name || "Unknown",
        service: o.service,
        units: totalUnits,
        amount: o.totalAmount,
        status: o.status,
        createdAt: o.createdAt,
      };
    });

    return res.json({
      orders: formatted,
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    });
  } catch (err) {
    console.error("ONGOING ORDERS ERROR:", err);
    res.status(500).json({ error: "Failed to load ongoing orders" });
  }
});

export default router;
