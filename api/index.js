// api/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";

import cloudinary from "../utils/cloudinary.js";
import authRouter from "../routes/auth.route.js";
import userRouter from "../routes/user.route.js";
import listingRouter from "../routes/listing.route.js";

dotenv.config();

const app = express();

// --- CORS ---
app.use(
  cors({
    origin: "https://meek-paprenjak-1afbbf.netlify.app", // your frontend Netlify URL
    credentials: true,
  })
);

// --- Core middleware ---
app.use(express.json());
app.use(cookieParser());

// --- DB connection (optimized for serverless) ---
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO);
  isConnected = true;
  console.log("✅ MongoDB connected");
}

// Middleware to ensure DB connection before any route
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// --- Routes (no `/api` prefix here!) ---
app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/listing", listingRouter);

// --- Error handler ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

// Export as serverless function for Vercel
export default serverless(app);
