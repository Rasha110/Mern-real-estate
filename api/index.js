import express from "express";
import serverless from "serverless-http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";
import { connectDB } from "./utils/db.js";

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

// DB Connection for serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Health & root route
app.get("/", (req, res) => res.send("✅ Backend is live!"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
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

// Export for Vercel
export default serverless(app);
