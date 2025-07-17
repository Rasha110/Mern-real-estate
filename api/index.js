import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cloudinary from "./utils/cloudinary.js";
import authRouter from './routes/auth.route.js'
dotenv.config();
import userRouter from './routes/user.route.js'
import cors from 'cors'

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Mongo Db Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true               // ✅ Allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);

app.use((err,req,res,next)=>{
  const statusCode=err.statusCode || 500;
  const message=err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success:false,
    statusCode,
    message,
  })
})