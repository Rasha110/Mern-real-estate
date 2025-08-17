import { errorHandler } from "./error.js";
import  jwt  from "jsonwebtoken";
export const verifyToken=(req,res,next)=>{
    //now we want to get data from cookie
    const token=req.cookies.access_token;
    //if not token avaialabe, then:
    if(!token) return next(errorHandler(401,'Unauthorized'));
    //But, if there is token:
jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
    if(err) return next(errorHandler(403,'Forbidden'));
    req.user=user; //this user is getting from cookie
    next(); //then we go to the next which is updateUser in user.route.js=>router.post('/update/:id',updateUser)
    
})
}