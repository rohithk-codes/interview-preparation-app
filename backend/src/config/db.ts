
import mongoose from "mongoose";


const connectDB = async():Promise <void> =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI as string)
        console.log("Mongodb connected")
    }catch(error){
        console.error("MongoDB connection error",error)
        process.exit(1)
    }
}

export default connectDB