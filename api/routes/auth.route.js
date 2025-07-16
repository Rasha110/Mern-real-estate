import express from "express"
import multer from 'multer';
import { uploadImage } from '../controllers/auth.controller.js';
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
import { signup,signin } from "../controllers/auth.controller.js";
import { google } from "../controllers/auth.controller.js";
router.post('/upload', upload.single('image'), uploadImage);


router.post("/signup",signup);
router.post("/signin",signin);
router.post("/google", google)
export default router;