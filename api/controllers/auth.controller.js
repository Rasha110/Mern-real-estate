import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import multer from "multer";
import streamifier from "streamifier";

// ✅ Memory storage instead of disk storage
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// ------------------ SIGNUP ------------------
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (err) {
    next(err);
  }
};

// ------------------ SIGNIN ------------------
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, "User not found!"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong Credentials!"));

    const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

    const { password: pass, ...rest } = validUser._doc;

    res.cookie("access_token", token, { httpOnly: true, secure: true,       
  sameSite: "None",    
  path: "/",   }).status(200).json(rest);
  } catch (err) {
    next(err);
  }
};

// ------------------ UPLOAD IMAGE ------------------
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file uploaded" });
    }

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "user_avatars" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);
console.log("Cloudinary result:", result);

    return res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------ GOOGLE LOGIN ------------------
export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = user._doc;
     res.cookie("access_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
})

        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: pass, ...rest } = newUser._doc;

      res
        .cookie("access_token", token, {
          httpOnly: true,
          secure: true, 
          sameSite: "None",
          path:"/",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

// ------------------ SIGNOUT ------------------
export const signout = (req, res, next) => {
  try {
 

   res.clearCookie("access_token", {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
});

    res.status(200).json("User has been logged out!");
  } catch (err) {
    next(err);
  }
};
