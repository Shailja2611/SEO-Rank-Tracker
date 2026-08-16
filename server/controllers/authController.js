import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//genrate token
const generateToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:"30d"})
}

//register user
    export const register=async(req,res)=>{
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        //check if user already exists
        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({ success: false, message: "User already exists" });
        
        //hash password
        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        //create user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        const token = generateToken(user._id);

        res.status(201).json({ success: true, message: "User registered successfully" ,token ,user});
    } catch (error) {
        console.error("Error in register controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    }
//login user
export const login=async(req,res)=>{
    try {
        const {email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        //find user 
        const user = await User.findOne({ email });
        if(!user) return res.status(400).json({ success: false, message: "User not found" });
        
        // check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken(user._id);
        await user.save();
        res.status(201).json({ success: true, token, user });
        
    } catch (error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

//get current user
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        console.log("Current user:", user);
        if(!user){
            return res.status(400).json({success:false,message:"User not found"})
        }
        res.json({success:true,user})
        
    } catch (error) {
        console.error("Error in register controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
    }