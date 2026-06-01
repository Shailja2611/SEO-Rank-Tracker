import jwt from "jsonwebtoken";

const auth =async(req,res,next)=>{
    try{
        const autheader =req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).json({success:false, message:"Not authorized , not token"})
        }
        const token =authHeader.split(" ")[1];
        const decoded=jwt.verify(tokrn,process.env.JWT_SECRET);

        req.userID==decoded.id;
        next();
    }catch(error){
        console.error("auth middleware error:",error.message);
        return res.status(401).json({success:false, message:"Not authorized , token failed"})
    }
}
export default auth;