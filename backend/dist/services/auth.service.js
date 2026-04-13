"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const emailService_1 = __importDefault(require("../utils/emailService"));
class AuthService {
    constructor() {
        this.googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    generateAccessToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET || "access_secret", { expiresIn: "15m" });
    }
    generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET || "refresh_secret", { expiresIn: "7d" });
    }
    formatUser(user) {
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified || false,
        };
    }
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async createSession(user) {
        const accessToken = this.generateAccessToken(user._id.toString());
        const refreshToken = this.generateRefreshToken(user._id.toString());
        await user_repository_1.default.updateRefreshToken(user._id.toString(), refreshToken);
        return {
            user: this.formatUser(user),
            accessToken,
            refreshToken,
        };
    }
    async signup(data) {
        const exists = await user_repository_1.default.emailExists(data.email);
        if (exists) {
            throw new Error("User already exists with this email");
        }
        const otp = this.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user_repository_1.default.create({
            name: data.name,
            email: data.email,
            password: data.password,
            otp,
            otpExpires,
            isVerified: false,
        });
        try {
            await emailService_1.default.sendOTP(data.email, otp);
        }
        catch (error) {
            console.error("Failed to send OTP email:", error);
        }
        return { message: "OTP sent to your email. Please verify." };
    }
    async verifyOTP(email, otp) {
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
            throw new Error("Invalid or expired OTP");
        }
        const verifiedUser = await user_repository_1.default.verifyUser(email);
        if (!verifiedUser) {
            throw new Error("Failed to verify user");
        }
        return this.createSession(verifiedUser);
    }
    async resendOTP(email) {
        const user = await user_repository_1.default.findByEmail(email);
        if (!user) {
            throw new Error("User not found");
        }
        if (user.isVerified) {
            throw new Error("User is already verified");
        }
        const otp = this.generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user_repository_1.default.updateOTP(email, otp, otpExpires);
        await emailService_1.default.sendOTP(email, otp);
        return { message: "OTP resent successfully" };
    }
    async login(data) {
        const user = await user_repository_1.default.findByEmailWithPassword(data.email);
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await user.comparePassword(data.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        if (!user.isVerified) {
            throw new Error("Please verify your email first");
        }
        return this.createSession(user);
    }
    async refresh(token) {
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET || "refresh_secret");
        }
        catch {
            throw new Error("Invalid or expired refresh token");
        }
        const user = await user_repository_1.default.findByRefreshToken(token);
        if (!user || user._id.toString() !== decoded.id) {
            throw new Error("Invalid or expired refresh token");
        }
        return this.createSession(user);
    }
    async logout(userId) {
        await user_repository_1.default.updateRefreshToken(userId, null);
    }
    async logoutByRefreshToken(token) {
        if (!token) {
            return;
        }
        const user = await user_repository_1.default.findByRefreshToken(token);
        if (user) {
            await this.logout(user._id.toString());
        }
    }
    async googleLogin(credential) {
        const ticket = await this.googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            throw new Error("Invalid Google token");
        }
        const { email, name, sub: googleId } = payload;
        let user = await user_repository_1.default.findByEmail(email);
        if (user) {
            if (!user.googleId) {
                user = await user_repository_1.default.linkGoogleId(user._id.toString(), googleId);
            }
        }
        else {
            const randomPassword = crypto_1.default.randomBytes(32).toString("hex");
            user = await user_repository_1.default.create({
                name: name || "Google User",
                email,
                password: randomPassword,
                role: "user",
                googleId,
                isVerified: true,
            });
        }
        if (!user) {
            throw new Error("Google login failed");
        }
        return this.createSession(user);
    }
    async getUserById(userId) {
        const user = await user_repository_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        return this.formatUser(user);
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
