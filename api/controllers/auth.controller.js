import User from "../models/user.model.js"
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
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