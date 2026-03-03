import { Request, Response } from "express";
import authService from "../services/auth.service";
import { setAuthCookie, clearAuthCookie } from "../utils/cookies";

class AuthController {
  // ─── Handlers ─────────────────────────────────────────────────────────────

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({
          success: false,
          message: "Please provide name, email, and password",
        });
        return;
      }

      const result = await authService.signup({ name, email, password });
      setAuthCookie(res, result.token);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: { user: result.user },
      });
    } catch (error: any) {
      console.error("Signup error:", error);

      // Handle custom business errors
      if (error.message === "User already exists with this email") {
        res.status(400).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Server error during registration",
        error: error.message,
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Please provide email and password",
        });
        return;
      }

      const result = await authService.login({ email, password });
      setAuthCookie(res, result.token);

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: { user: result.user },
      });
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.message === "Invalid credentials") {
        res.status(401).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Server error during login",
        error: error.message,
      });
    }
  };

  googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { credential } = req.body;

      if (!credential) {
        res.status(400).json({
          success: false,
          message: "Google credential is required",
        });
        return;
      }

      const result = await authService.googleLogin(credential);
      setAuthCookie(res, result.token);

      res.status(200).json({
        success: true,
        message: "Google login successful",
        data: { user: result.user },
      });
    } catch (error: any) {
      console.error("Google login controller error:", error);

      // If it's a token validation error, it should be 401, not 500
      if (error.message === "Invalid Google token" || error.message === "Google authentication failed") {
        res.status(401).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Google login failed",
        error: error.message,
      });
    }
  };

  profile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user?.id) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const user = await authService.getUserById(req.user.id);

      res.status(200).json({ success: true, data: { user } });
    } catch (error: any) {
      console.error("Get me error:", error);

      if (error.message === "User not found") {
        res.status(404).json({ success: false, message: error.message });
        return;
      }

      res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      clearAuthCookie(res);

      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  };
}

export default new AuthController();

