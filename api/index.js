// api/index.js
import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "https://meek-paprenjak-1afbbf.netlify.app",
    credentials: true,
  })
);
app.use(cookieParser());

// --- MongoDB connection (cached for Vercel serverless) ---
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Ensure DB connection before handling any request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// --- Root route ---
app.get("/", (req, res) => {
  res.send("✅ Backend is live!");
});

// --- API routes ---
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/listing", listingRouter);

// --- Health check route ---
app.get("/api/health", (req, res) => res.json({ ok: true }));

// --- Error handler ---
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err); // log for debugging
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

// --- Wrap for serverless ---
export default serverless(app);
