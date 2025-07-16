import User from "../models/user.model.js"
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken'
export const signup=async(req,res,next)=>{
    const {username,email,password}=req.body;
    //after body we are going to hash the password
    const hashedPassword=await bcryptjs.hashSync(password,10);
    //now to save this in database
    const newUser= new User({username,email,password:hashedPassword});
    //we set email unique but it sends error in terminal not to user to resoove this, use try-catch:
    try{
//now  save this user in database  as it takes time based on internet speedd so use await here
    await newUser.save();
    res.status(201).json("User created successfully!"); //201=>created!
    }catch(err){
       next(err);
    }
    
}
export const signin=async(req,res,next)=>{
    const {email,password}=req.body;
    try{
//now we'll check if the email is valid
const validUser=await User.findOne({email});
if(!validUser) return next(errorHandler (404,'User not found!'));
const validPassword=bcryptjs.compareSync(password,validUser.password);
if(!validPassword)  return next(errorHandler (401,'Wrong Credentials!')); 
const token=jwt.sign({id:validUser._id},process.env.JWT_SECRET) 
//we dont want password shows in console/insomnia when we send request
const {password:pass,...rest}=validUser._doc;
//making cookie
res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest);
    }
    catch(err){
next(err);
    }
}

import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

export const uploadImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    
    // Delete file from local after uploading
    fs.unlinkSync(req.file.path);

    return res.status(200).json({
      success: true,
      imageUrl: result.secure_url,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const google=async(req,res,next)=>{
    try{
const user=await User.findOne({email:req.body.email})
if(user){
    const token=jwt.sign({id:user._id},process.env.JWT_SECRET) 
//we dont want password shows in console/insomnia when we send request
const {password:pass,...rest}=user._doc;
//making cookie
res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest);
}else{
    const generatedPassword=Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8);
    const hashedPassword=bcryptjs.hashSync(generatedPassword,10);
    const newUser=new User({username:req.body.name.split(" ").join("").toLowerCase()+Math.random().toString(36).slice(-8),email:req.body.email,password:hashedPassword,avatar:req.body.photo})
    await newUser.save();
    const token=jwt.sign({id: newUser._id },process.env.JWT_SECRET) 
//we dont want password shows in console/insomnia when we send request
const {password:pass,...rest}=newUser._doc;
res.cookie('access_token',token,{httpOnly:true}).status(200).json(rest);

}
    }catch(error){
        next(error);
    }
}