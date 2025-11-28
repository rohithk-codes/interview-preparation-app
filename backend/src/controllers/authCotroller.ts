import { Request, Response } from "express";
import authService from "../services/auth.service";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
      return;
    }

    // Call service
    const result = await authService.signup({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    // Handle known errors
    if (error.message === "User already exists with this email") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
      return;
    }

    // Call service
    const result = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.message === "Invalid credentials") {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

export const profile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const user = await authService.getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    console.error("Get me error:", error);

    if (error.message === "User not found") {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
