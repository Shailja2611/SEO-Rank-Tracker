import "dotenv/config";
import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const connectDB = async () => {
    mongoose.connection.on("connected" , ()=> {
        console.log("MongoDB connected");
        console.log("DB Name:", mongoose.connection.name);
    });

    await mongoose.connect(process.env.MONGODB_URL)
}

export default connectDB;