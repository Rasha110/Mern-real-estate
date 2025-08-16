import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Import routes
import authRouter from "../routes/auth.route.js";
import userRouter from "../routes/user.route.js";
import listingRouter from "../routes/listing.route.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB connection (with caching so Vercel doesn’t reconnect on every request)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO);
  isConnected = true;
  console.log("✅ MongoDB Connected");
}

// Middleware to ensure DB is connected before handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Express + Vercel works ✅" });
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Export for Vercel
export default serverless(app);
