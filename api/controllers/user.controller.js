import User from "../models/user.model.js"
import { errorHandler } from "../utils/error.js"
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