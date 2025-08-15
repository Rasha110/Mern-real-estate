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

// DB Connection (cached for serverless)
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO);
  isConnected = true;
  console.log("✅ MongoDB connected");
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    next(e);
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("✅ Backend is live!");
});

// Routes
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/listing", listingRouter);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal Server Error",
  });
});

// Export serverless function
export default serverless(app);
