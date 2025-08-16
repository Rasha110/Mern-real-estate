// api/index.js
import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "../routes/auth.route.js";
import userRouter from "../routes/user.route.js";
import listingRouter from "../routes/listing.route.js";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Mongo connection
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO);
  isConnected = true;
  console.log("✅ MongoDB connected");
}

// Attach DB before routes
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Express + Vercel works ✅" });
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);

export default serverless(app);
