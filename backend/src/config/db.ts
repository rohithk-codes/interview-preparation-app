
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import mongoose from "mongoose";


const connectDB = async():Promise <void> =>{
    if (!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not set");
    }

    try{
        await mongoose.connect(process.env.MONGODB_URI)

        console.log("Mongodb connected")
    }catch(error){
        console.error("MongoDB connection error",error)
        throw error
    }
}




 export default connectDB
