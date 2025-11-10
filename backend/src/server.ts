import express,{Application,Request,Response} from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db"

import authRoutes from "./routes/auth"
import questionRoutes from './routes/question';

dotenv.config()

const app:Application=express()

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth',authRoutes)
app.use('/api/questions', questionRoutes);

app.get("/",(req:Request,res:Response)=>{
    res.json({message:"Interview prepration app is running"})
})


app.use((req:Request,res:Response)=>{
    res.status(404).json({
        success:false,
        message:"Route not found"
    })
})

const PORT = process.env.PORT || ""

app.listen(PORT,()=>{
    console.log(`server runnig on port ${PORT}`)
})
