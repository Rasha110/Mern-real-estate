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

// CORS setup — allow your Netlify domain
app.use(cors({
  origin: process.env.CLIENT_URL || "https://meek-paprenjak-1afbbf.netlify.app",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// MongoDB connection — only connect once
mongoose.connect(process.env.MONGO)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

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
    message
  });
});

// ✅ Export the app for Vercel
export default app;
