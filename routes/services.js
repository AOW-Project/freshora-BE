const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Get all services (grouped items, sorted by sortOrder)
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        serviceItems: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" }, // Changed back to sortOrder
        },
      },
      orderBy: { title: "asc" },
    });

    const formattedServices = services.map((service) => {
      const groupedItems = service.serviceItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push({
          id: item.itemId,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          unit: item.unit,
          image: item.image,
          sortOrder: item.sortOrder, // Added sortOrder back to the response
        });
        return acc;
      }, {});

      return {
        id: service.id,
        slug: service.slug,
        title: service.title,
        description: service.description,
        fullDescription: service.fullDescription,
        rating: service.rating,
        reviews: service.reviews,
        duration: service.duration,
        items: groupedItems,
      };
    });

    return res.json({ success: true, data: formattedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    });
  }
});

// Get service by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
      include: {
        serviceItems: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" }, // Changed back to sortOrder
        },
      },
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const groupedItems = service.serviceItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push({
        id: item.itemId,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        unit: item.unit,
        image: item.image,
        sortOrder: item.sortOrder, // Added sortOrder back to the response
      });
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        id: service.id,
        slug: service.slug,
        title: service.title,
        description: service.description,
        fullDescription: service.fullDescription,
        rating: service.rating,
        reviews: service.reviews,
        duration: service.duration,
        items: groupedItems,
      },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    });
  }
});

// Get items by slug + category (sorted by sortOrder)
router.get("/:slug/items/:category", async (req, res) => {
  try {
    const { slug, category } = req.params;

    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
    });

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const items = await prisma.serviceItem.findMany({
      where: { serviceId: service.id, category, isActive: true },
      orderBy: { sortOrder: "asc" }, // Changed back to sortOrder
    });

    const formattedItems = items.map((item) => ({
      id: item.itemId,
      name: item.name,
      description: item.description,
      price: Number(item.price),
      unit: item.unit,
      image: item.image,
      sortOrder: item.sortOrder, // Added sortOrder back to the response
    }));

    return res.json({ success: true, data: formattedItems });
  } catch (error) {
    console.error("Error fetching service items:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch service items",
      error: error.message,
    });
  }
});

module.exports = router;