import express from "express";
import cors from "cors";
import "dotenv/config"; // Loads .env file into process.env
import { PrismaClient } from "@prisma/client";

// Import your route handlers
import ordersRoutes from "./routes/orders.js";
import customersRoutes from "./routes/customers.js";
import trackingRoutes from "./routes/tracking.js";
import servicesRoutes from "./routes/services.js";
import authRoutes from "./routes/auth.js";

// Initialize Express app and Prisma Client
const app = express();
const prisma = new PrismaClient();

// --- CORS CONFIGURATION ---
// This configuration allows you to specify allowed frontend URLs in your .env file
// Example: FRONTEND_URL=http://localhost:3000,https://your-production-site.com

// for dev env
const allowedOrigins = ["https://freshoralaundry.com", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: ["https://freshoralaundry.com"], // allow your frontend domain
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps, curl, Postman)
//       if (!origin) return callback(null, true);

//       if (allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// --- MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---
app.use("/api/orders", ordersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Laundry Service API is running",
    timestamp: new Date().toISOString(),
  });
});

// --- ERROR HANDLING ---
// 404 handler for routes not found
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!",
    // Only show detailed error message in development mode
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- SERVER INITIALIZATION ---
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // Test the database connection on startup
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1); // Exit the process with an error code
  }
}

startServer();

// --- GRACEFUL SHUTDOWN ---
// Ensures the database connection is closed when the app is terminated
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});
