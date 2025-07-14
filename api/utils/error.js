export const errorHandler=(statusCode,message)=>{//custom error handling
const error=new Error(); //js constructor for error hadnling
error.statusCode=statusCode;
error.message=message;
return error;
}