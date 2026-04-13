"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../services/auth.service"));
const cookies_1 = require("../utils/cookies");
const sendAuthResponse = (res, statusCode, message, result) => {
    (0, cookies_1.setRefreshTokenCookie)(res, result.refreshToken);
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
    constructor() {
        this.signup = async (req, res) => {
            try {
                const { name, email, password } = req.body;
                if (!name || !email || !password) {
                    res.status(400).json({
                        success: false,
                        message: "Please provide name, email, and password",
                    });
                    return;
                }
                const result = await auth_service_1.default.signup({ name, email, password });
                res.status(201).json({
                    success: true,
                    message: result.message,
                });
            }
            catch (error) {
                console.error("Signup error:", error);
                res
                    .status(error.message === "User already exists with this email" ? 400 : 500)
                    .json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.verifyOTP = async (req, res) => {
            try {
                const { email, otp } = req.body;
                if (!email || !otp) {
                    res
                        .status(400)
                        .json({ success: false, message: "Email and OTP are required" });
                    return;
                }
                const result = await auth_service_1.default.verifyOTP(email, otp);
                sendAuthResponse(res, 200, "Email verified successfully", result);
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        };
        this.resendOTP = async (req, res) => {
            try {
                const { email } = req.body;
                if (!email) {
                    res.status(400).json({ success: false, message: "Email is required" });
                    return;
                }
                const result = await auth_service_1.default.resendOTP(email);
                res.status(200).json({ success: true, message: result.message });
            }
            catch (error) {
                res.status(400).json({ success: false, message: error.message });
            }
        };
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    res.status(400).json({
                        success: false,
                        message: "Please provide email and password",
                    });
                    return;
                }
                const result = await auth_service_1.default.login({ email, password });
                sendAuthResponse(res, 200, "Login successful", result);
            }
            catch (error) {
                console.error("Login error:", error);
                const status = error.message === "Invalid credentials"
                    ? 401
                    : error.message === "Please verify your email first"
                        ? 403
                        : 500;
                res.status(status).json({ success: false, message: error.message });
            }
        };
        this.refresh = async (req, res) => {
            try {
                const token = req.cookies.refreshToken;
                if (!token) {
                    res
                        .status(401)
                        .json({ success: false, message: "Refresh token not found" });
                    return;
                }
                const result = await auth_service_1.default.refresh(token);
                sendAuthResponse(res, 200, "Session refreshed", result);
            }
            catch (error) {
                res.status(401).json({ success: false, message: error.message });
            }
        };
        this.googleLogin = async (req, res) => {
            try {
                const { credential } = req.body;
                if (!credential) {
                    res.status(400).json({
                        success: false,
                        message: "Google credential is required",
                    });
                    return;
                }
                const result = await auth_service_1.default.googleLogin(credential);
                sendAuthResponse(res, 200, "Google login successful", result);
            }
            catch (error) {
                console.error("Google login controller error:", error);
                res.status(error.message === "Invalid Google token" ? 401 : 500).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.profile = async (req, res) => {
            try {
                if (!req.user?.id) {
                    res.status(401).json({ success: false, message: "Not authenticated" });
                    return;
                }
                const user = await auth_service_1.default.getUserById(req.user.id);
                res.status(200).json({
                    success: true,
                    data: { user },
                });
            }
            catch (error) {
                console.error("Profile error:", error);
                res.status(error.message === "User not found" ? 404 : 500).json({
                    success: false,
                    message: error.message,
                });
            }
        };
        this.logout = async (req, res) => {
            try {
                await auth_service_1.default.logoutByRefreshToken(req.cookies.refreshToken);
                (0, cookies_1.clearAuthCookies)(res);
                res.status(200).json({
                    success: true,
                    message: "Logged out successfully",
                });
            }
            catch (error) {
                console.error("Logout error:", error);
                res.status(500).json({ success: false, message: "Logout failed" });
            }
        };
    }
}
exports.default = new AuthController();
