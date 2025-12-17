import express from "express";
import { body, param, validationResult } from "express-validator";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

const PRIORITY_CATEGORIES = ["men", "women", "children", "household"];

// Helper function to transform service data to group items by category
const transformService = (service) => {
  if (!service) return null;

  // Step 1: Group items by category
  const grouped = service.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];

    acc[item.category].push({
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description || "",
      unit: item.unit || "Per Item",
      image: item.image,
      sortOrder: item.sortOrder ?? 0,
    });

    return acc;
  }, {});

  // Step 2: Build ordered result
  const orderedItems = {};

  // 2a: Add priority categories first
  PRIORITY_CATEGORIES.forEach((category) => {
    if (grouped[category]) {
      orderedItems[category] = grouped[category].sort(
        (a, b) => a.sortOrder - b.sortOrder
      );
      delete grouped[category]; // important
    }
  });

  // 2b: Append remaining categories dynamically
  Object.keys(grouped).forEach((category) => {
    orderedItems[category] = grouped[category].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
  });

  return {
    ...service,
    items: orderedItems,
  };
};

// Middleware to handle validation errors cleanly
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/services - Get all services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { items: true },
    });
    const transformedServices = services.map(transformService);
    res.json({ success: true, data: transformedServices });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, error: "Failed to fetch services" });
  }
});

// GET /api/services/:slug - Get a single service by its slug
router.get(
  "/:slug",
  [param("slug").notEmpty().withMessage("Slug is required")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const service = await prisma.service.findUnique({
        where: { slug },
        include: { items: true },
      });

      if (!service) {
        return res
          .status(404)
          .json({ success: false, error: "Service not found" });
      }
      const transformedService = transformService(service);
      res.json({ success: true, data: transformedService });
    } catch (error) {
      console.error("Error fetching service:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch service" });
    }
  }
);

// POST /api/services - Create a new service
router.post(
  "/",
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("slug").notEmpty().withMessage("Slug is required"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug, title, description } = req.body;
      const existingService = await prisma.service.findUnique({
        where: { slug },
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          error: "A service with this slug already exists",
        });
      }

      const newService = await prisma.service.create({
        data: {
          slug,
          title,
          description,
          fullDescription: req.body.fullDescription || description,
        },
      });
      res.status(201).json({
        success: true,
        data: newService,
        message: "Service created successfully",
      });
    } catch (error) {
      console.error("Error creating service:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to create service" });
    }
  }
);

// PUT /api/services/:slug - Update an existing service
router.put(
  "/:slug",
  [param("slug").notEmpty().withMessage("Slug is required")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const updatedService = await prisma.service.update({
        where: { slug },
        data: req.body,
      });
      res.json({
        success: true,
        data: updatedService,
        message: "Service updated successfully",
      });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ success: false, error: "Service not found" });
      }
      console.error("Error updating service:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to update service" });
    }
  }
);

// DELETE /api/services/:slug - Delete a service
router.delete(
  "/:slug",
  [param("slug").notEmpty().withMessage("Slug is required")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      await prisma.service.delete({ where: { slug } });
      res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ success: false, error: "Service not found" });
      }
      console.error("Error deleting service:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to delete service" });
    }
  }
);

// POST /api/services/:slug/items - Add an item to a service
router.post(
  "/:slug/items",
  [
    param("slug").notEmpty().withMessage("Slug is required"),
    body("name").notEmpty().withMessage("Item name is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("price").isNumeric().withMessage("Price must be a number").toFloat(),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { slug } = req.params;
      const service = await prisma.service.findUnique({ where: { slug } });

      if (!service) {
        return res
          .status(404)
          .json({ success: false, error: "Service not found" });
      }

      const { name, category, price, description, unit, image } = req.body;
      const newItem = await prisma.serviceItem.create({
        data: {
          serviceId: service.id,
          name,
          category,
          price,
          description,
          unit,
          image,
        },
      });
      res.status(201).json({
        success: true,
        data: newItem,
        message: "Item added successfully",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      res.status(500).json({ success: false, error: "Failed to add item" });
    }
  }
);

export default router;
