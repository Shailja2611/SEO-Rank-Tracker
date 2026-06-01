import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected" , ()=> {
        console.log("MongoDB connected");
        console.log("DB Name:", mongoose.connection.name);
    });
    await mongoose.connect(process.env.MONGODB_URL)
}

export default connectDB;