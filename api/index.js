// api/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import cloudinary from "../utils/cloudinary.js";
import authRouter from "../routes/auth.route.js";
import userRouter from "../routes/user.route.js";
import listingRouter from "../routes/listing.route.js";

dotenv.config();

const app = express();

// --- CORS ---
app.use(express.json());
app.use(
  cors({
    origin: "https://meek-paprenjak-1afbbf.netlify.app", // Your Netlify frontend
    credentials: true
  })
);
app.use(cookieParser());

// --- DB Connection (cached for serverless) ---
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO);
  isConnected = true;
  console.log("✅ MongoDB connected");
}

// Ensure DB before handling routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

// --- Routes ---
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// --- Error handler ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

export default app; // ✅ Required for Vercel
