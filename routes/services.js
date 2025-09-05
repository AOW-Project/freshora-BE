const express = require("express")
const { PrismaClient } = require("@prisma/client")

const router = express.Router()
const prisma = new PrismaClient()

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        serviceItems: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { title: "asc" },
    })

    res.json({ success: true, data: services })
  } catch (error) {
    console.error("Error fetching services:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: error.message,
    })
  }
})

// Get service by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params

    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
      include: {
        serviceItems: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    // Group service items by category
    const groupedItems = service.serviceItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push({
        id: item.itemId,
        name: item.name,
        description: item.description,
        price: Number.parseFloat(item.price),
        unit: item.unit,
        image: item.image,
      })
      return acc
    }, {})

    const response = {
      id: service.id,
      slug: service.slug,
      title: service.title,
      description: service.description,
      fullDescription: service.fullDescription,
      rating: service.rating,
      reviews: service.reviews,
      duration: service.duration,
      items: groupedItems,
    }

    res.json({ success: true, data: response })
  } catch (error) {
    console.error("Error fetching service:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
      error: error.message,
    })
  }
})

// Get service items by service slug and category
router.get("/:slug/items/:category", async (req, res) => {
  try {
    const { slug, category } = req.params

    const service = await prisma.service.findFirst({
      where: { slug, isActive: true },
    })

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      })
    }

    const items = await prisma.serviceItem.findMany({
      where: {
        serviceId: service.id,
        category,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
    })

    const formattedItems = items.map((item) => ({
      id: item.itemId,
      name: item.name,
      description: item.description,
      price: Number.parseFloat(item.price),
      unit: item.unit,
      image: item.image,
    }))

    res.json({ success: true, data: formattedItems })
  } catch (error) {
    console.error("Error fetching service items:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch service items",
      error: error.message,
    })
  }
})

module.exports = router
