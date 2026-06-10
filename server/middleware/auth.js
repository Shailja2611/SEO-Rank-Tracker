import jwt from "jsonwebtoken";

console.log("new auth middleware")
const auth =async(req,res,next)=>{
    try{
        const authHeader =req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({success:false, message:"Not authorized , not token"})
        }
        const token =authHeader.split(" ")[1];
        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        // Check if the token payload has ._id or .id
        req.user = { _id: decoded._id || decoded.id }; 
        next();
    }catch (error) {
    console.error("FULL ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(401).json({
        success: false,
        message: error.message
    });
}
}
export default auth;