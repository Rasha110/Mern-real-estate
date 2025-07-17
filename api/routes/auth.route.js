import express from "express"
import multer from 'multer';
import { uploadImage,upload } from '../controllers/auth.controller.js';
const router = express.Router();
import { signup,signin } from "../controllers/auth.controller.js";
import { google } from "../controllers/auth.controller.js";
router.patch('/upload', upload.single('image'), uploadImage);


router.post("/signup",signup);
router.post("/signin",signin);
router.post("/google", google)
export default router;