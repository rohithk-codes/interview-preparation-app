import { Request, Response } from "express";
import authService, { AuthResponse } from "../services/auth.service";
import { clearAuthCookies, setRefreshTokenCookie } from "../utils/cookies";

const sendAuthResponse = (
  res: Response,
  statusCode: number,
  message: string,
  result: AuthResponse
) => {
  setRefreshTokenCookie(res, result.refreshToken);

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

class AuthController {
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

      res.status(201).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res
        .status(error.message === "User already exists with this email" ? 400 : 500)
        .json({
          success: false,
          message: error.message,
        });
    }
  };

  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        res
          .status(400)
          .json({ success: false, message: "Email and OTP are required" });
        return;
      }

      const result = await authService.verifyOTP(email, otp);
      sendAuthResponse(res, 200, "Email verified successfully", result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }

      const result = await authService.resendOTP(email);
      res.status(200).json({ success: true, message: result.message });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
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
      sendAuthResponse(res, 200, "Login successful", result);
    } catch (error: any) {
      console.error("Login error:", error);

      const status =
        error.message === "Invalid credentials"
          ? 401
          : error.message === "Please verify your email first"
            ? 403
            : 500;

      res.status(status).json({ success: false, message: error.message });
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.cookies.refreshToken;

      if (!token) {
        res
          .status(401)
          .json({ success: false, message: "Refresh token not found" });
        return;
      }

      const result = await authService.refresh(token);
      sendAuthResponse(res, 200, "Session refreshed", result);
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
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
      sendAuthResponse(res, 200, "Google login successful", result);
    } catch (error: any) {
      console.error("Google login controller error:", error);
      res.status(error.message === "Invalid Google token" ? 401 : 500).json({
        success: false,
        message: error.message,
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

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      console.error("Profile error:", error);
      res.status(error.message === "User not found" ? 404 : 500).json({
        success: false,
        message: error.message,
      });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await authService.logoutByRefreshToken(req.cookies.refreshToken);
      clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  };
}

export default new AuthController();
