// Load environment variables FIRST
import './config.js';

import express from "express";
import cors from "cors";
import mongoose from "mongoose";

// Routes
import authRoutes from "./routes/auth.js";
import symptomRoutes from "./routes/symptoms.js";
import consentRoutes from "./routes/consent.js";
import uploadRoutes from "./routes/upload.js";
import notificationRoutes from "./routes/notifications.js";
import scheduledNotificationRoutes from "./routes/scheduledNotifications.js";
import { initCronJobs } from "./services/cronService.js";
import analyticsRoutes from "./routes/analytics.js";
import reportRoutes from "./routes/reports.js";
import doctorRoutes from "./routes/doctors.js";
import chatRoutes from "./routes/chat.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB at", process.env.MONGODB_URI);
    initCronJobs(); // Start scheduler
  })
  .catch((err) => console.log(err));

// ===============================
// Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/symptoms", symptomRoutes);
app.use("/api/consent", consentRoutes);
app.use("/api/files", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/scheduled-notifications", scheduledNotificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/chat", chatRoutes);

// ===============================
// Health Check
// ===============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Apna Doctor API is running!",
  });
});

// ===============================
// Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong",
    message:
      process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});
