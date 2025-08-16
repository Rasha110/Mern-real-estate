import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";

dotenv.config();

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

// ✅ MongoDB connection with caching
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Routes
app.get("/", async (req, res) => {
  await connectDB();
  res.send("Backend is running 🚀");
});

app.use("/api/auth", async (req, res, next) => {
  await connectDB();
  next();
}, authRouter);

app.use("/api/user", async (req, res, next) => {
  await connectDB();
  next();
}, userRouter);

app.use("/api/listing", async (req, res, next) => {
  await connectDB();
  next();
}, listingRouter);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ Correct export for Vercel
export default serverless(app);
