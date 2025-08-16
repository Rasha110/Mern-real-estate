import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";   // ✅ added

import cloudinary from "./utils/cloudinary.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";

dotenv.config();

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || "https://meek-paprenjak-1afbbf.netlify.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// MongoDB connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// ✅ Root route (so / doesn’t give "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);

// Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// ✅ Export handler for Vercel
export const handler = serverless(app);
