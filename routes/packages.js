import express from "express";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /services/:slug
 * Fetch a service by slug with all its items
 */
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        items: {
          select: {
            id: true, // primary key of ServiceItem
            serviceId: true, // foreign key reference
          },
          orderBy: {
            sortOrder: "asc", // ensures consistent first item
          },
        },
      },
    });

    if (!service || service.items.length === 0) {
      return res.status(404).json({ error: "Service or items not found" });
    }

    const firstItem = service.items[0];

    res.json({
      id: firstItem.id,
      serviceId: firstItem.serviceId,
    });
  } catch (error) {
    console.error("[ERROR] Fetching service:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
