import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";


import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";

dotenv.config();

const app = express();

// DB Connection
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => console.error(" DB Connection Error:", err));

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running " });
});
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(` Server running at port ${PORT}`));

export default app;
