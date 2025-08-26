const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const { PrismaClient } = require("@prisma/client")

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL ,
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/orders", require("./routes/orders"))
app.use("/api/customers", require("./routes/customers"))
app.use("/api/tracking", require("./routes/tracking"))
app.use("/api/services", require("./routes/services"))
app.use("/api", require("./routes/auth"))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Laundry Service API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Start server
const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("✅ Database connected successfully")

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📍 API URL: http://localhost:${PORT}/api`)
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`)
    })
  } catch (error) {
    console.error("❌ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...")
  await prisma.$disconnect()
  process.exit(0)
})
