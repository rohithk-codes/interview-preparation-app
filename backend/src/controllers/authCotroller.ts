import {Request,Response} from 'express'
import jwt from 'jsonwebtoken'
import {IUser} from "../models/user/user.interface" 
import User from '../models/schema/user'
import bcrypt from "bcryptjs"


const generateToken = (userId:string):string=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET as string,{expiresIn:'7d'})
}


export const signup = async (req:Request,res:Response):Promise<void>=>{
    try {

        const{name,email,password} = req.body
        if(!name || !email || !password){
            res.status(400).json({
                success:false,
                message:"Please provide name,email,password"
            })
            return
        }

        const existingUser = await User.findOne({email})
        if(existingUser){
            res.status(400).json({
                success:false,
                message:"User already exists with this email"
            })
            return
        }

     const hashedPassword =  await bcrypt.hash(password,10)
        const user = await User.create({
            name,email,password:hashedPassword
        })

        const token = generateToken(user.id.toString())

        res.status(201).json({
            success:true,
            message:"User registered successfully",
            data:{
                user:{
                    id:user._id,
                    name:user.name,
                    email:user.email,
                    role:user.role
                },
                token
            }
        })
        
    } catch (error:any) {
        console.log("signUp error:",error);
        res.status(500).json({
            success:false,
            message:"Server error during registration",
             error: error.message
        })
    }
}

export const login = async (req:Request,res:Response):Promise<void>=>{
    try {
        const {email,password} = req.body;
      
        if(!email || !password){
            res.status(400).json({
                success:false,
                message:"Please provide email and password"
            })
            return
        }
    const user = await User.findOne({email})

    if(!user){
        res.status(401).json({
            success:false,
            message:"Invalid credentials"
        })
        return
    }

    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid){
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return; 
    }

    const token = generateToken(user.id.toString())
    res.status(200).json({
        success:true,
        message:"Login successful",
        data:{
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role
            },
            token
        }
    })

    } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
}


// export const profile = async (req: Request, res: Response): Promise<void> => {
//   try {
   
//     const user = await User.findById(req.user.id);
  
//     if (!user) {
//       res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         user: {
//           id: user._id,
//           name: user.name,
//           email: user.email,
//           role: user.role
//         }
//       }
//     });
//   } catch (error: any) {
//     console.error('Get me error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error',
//     });
//   }
// };


export const profile = async (req: Request, res: Response): Promise<void> => {
  try {
    // User info is already in req.user from middleware
    // But let's fetch fresh data to be safe
    const user = await User.findById(req.user!.id).select('-password');
   
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};