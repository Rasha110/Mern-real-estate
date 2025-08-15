import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';

// ✅ Memory storage for Vercel serverless (no disk usage)
export const upload = multer({ storage: multer.memoryStorage() });

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (err) {
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found!'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong Credentials!'));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);
    const { password: pass, ...rest } = validUser._doc;

    res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
  } catch (err) {
    next(err);
  }
};

export const uploadImage = async (req, res) => {
  try {
    console.log('Incoming file:', req.file);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Upload buffer directly to Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'user_avatars' },
      (error, result) => {
        if (error) return res.status(500).json({ success: false, message: error.message });
        return res.status(200).json({
          success: true,
          imageUrl: result.secure_url,
        });
      }
    );

    stream.end(req.file.buffer);

  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
      res.cookie('access_token', token, { httpOnly: true }).status(200).json(rest);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo
      });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: false, // set to true in production
        sameSite: 'Lax',
      }).status(200).json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const signout = (req, res, next) => {
  try {
    res.clearCookie('access_token');
    res.status(200).json('User has been logged out!');
  } catch (err) {
    next(err);
  }
};
