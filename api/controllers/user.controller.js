import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
import Listing from '../models/listing.model.js'
import bcryptjs from "bcryptjs"
export const test=(req,res)=>{
    res.json({
    message: 'HEllo WOrld!,Rasha'
})
}
export const updateUser=async(req,res,next)=>{
if(req.user.id!=req.params.id) return next(errorHandler(403,'You can only update your own account'));
//if the user is correct
try{
//if the user ir trying to change the password
if(req.body.password){
    req.body.password=bcryptjs.hashSync(req.body.password,10); 

}
const updatedUser=await User.findByIdAndUpdate(req.params.id,{
    $set:{
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        avatar:req.body.avatar,
    }

},{new:true})
const {password,...rest}=updatedUser._doc;
res.status(200).json(rest)
}catch(error){
next(error)
}
}
export const deleteUser=async(req,res,next)=>{
if(req.user.id != req.params.id) return next(errorHandler(401,'you can only delete your account'))
    try{
await User.findByIdAndDelete(req.params.id)
res.clearCookie('access_token')
res.status(200).json('User has been deleted!')
} catch(error){
next(error);
}
}
export const getUserListings=async(req,res,next)=>{
    //if person is authneticated he must get his own listing not others
    if(req.user.id ===req.params.id){
     try{
const listings=await Listing.find({userRef:req.params.id})
res.status(200).json(listings);
    }catch(error){
next(error)
    }    
    }
    else{
        return next(errorHandler(401,"You can only view your own listings!"))
    }
    
}
export const getUser=async(req,res,next)=>{
   try{
     const user=await User.findById(req.params.id);
    if(!user) return next(errorhandler(404,'User not found!'))
        const {password:pass ,...rest}=user._doc;
    res.status(200).json(rest)
   }catch(error){
    next(error)
   }
}