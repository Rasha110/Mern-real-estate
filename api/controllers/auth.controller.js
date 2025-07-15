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