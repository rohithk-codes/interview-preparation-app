import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { IUser } from "../models/User";
import userRepository from "../repositories/user.repository";
import emailService from "../utils/emailService";

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  private generateAccessToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.ACCESS_TOKEN_SECRET || "access_secret",
      { expiresIn: "15m" }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.REFRESH_TOKEN_SECRET || "refresh_secret",
      { expiresIn: "7d" }
    );
  }

  private formatUser(user: IUser): AuthResponse["user"] {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified || false,
    };
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async createSession(user: IUser): Promise<AuthResponse> {
    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = this.generateRefreshToken(user._id.toString());

    await userRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async signup(data: SignupDTO): Promise<{ message: string }> {
    const exists = await userRepository.emailExists(data.email);
    if (exists) {
      throw new Error("User already exists with this email");
    }

    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
      otp,
      otpExpires,
      isVerified: false,
    } as IUser);

    try {
      await emailService.sendOTP(data.email, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
    }

    return { message: "OTP sent to your email. Please verify." };
  }

  async verifyOTP(email: string, otp: string): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.otp !== otp || !user.otpExpires || user.otpExpires < new Date()) {
      throw new Error("Invalid or expired OTP");
    }

    const verifiedUser = await userRepository.verifyUser(email);
    if (!verifiedUser) {
      throw new Error("Failed to verify user");
    }

    return this.createSession(verifiedUser);
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User is already verified");
    }

    const otp = this.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await userRepository.updateOTP(email, otp, otpExpires);
    await emailService.sendOTP(email, otp);

    return { message: "OTP resent successfully" };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await userRepository.findByEmailWithPassword(data.email);
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

  async refresh(token: string): Promise<AuthResponse> {
    let decoded: { id: string };

    try {
      decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || "refresh_secret"
      ) as { id: string };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await userRepository.findByRefreshToken(token);
    if (!user || user._id.toString() !== decoded.id) {
      throw new Error("Invalid or expired refresh token");
    }

    return this.createSession(user);
  }

  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(userId, null);
  }

  async logoutByRefreshToken(token?: string): Promise<void> {
    if (!token) {
      return;
    }

    const user = await userRepository.findByRefreshToken(token);
    if (user) {
      await this.logout(user._id.toString());
    }
  }

  async googleLogin(credential: string): Promise<AuthResponse> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      throw new Error("Invalid Google token");
    }

    const { email, name, sub: googleId } = payload;

    let user = await userRepository.findByEmail(email);

    if (user) {
      if (!user.googleId) {
        user = await userRepository.linkGoogleId(user._id.toString(), googleId);
      }
    } else {
      const randomPassword = crypto.randomBytes(32).toString("hex");

      user = await userRepository.create({
        name: name || "Google User",
        email,
        password: randomPassword,
        role: "user",
        googleId,
        isVerified: true,
      } as IUser);
    }

    if (!user) {
      throw new Error("Google login failed");
    }

    return this.createSession(user);
  }

  async getUserById(userId: string): Promise<AuthResponse["user"]> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.formatUser(user);
  }
}

export default new AuthService();
