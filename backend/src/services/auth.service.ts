import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository";
import { IUser } from "../models/User";

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
  };
  token: string;
}

export class AuthService {
  // Generate JWT token
  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
  }

  // Format user response
  private formatUserResponse(user: IUser): AuthResponse["user"] {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  // Signup new user
  async signup(data: SignupDTO): Promise<AuthResponse> {
    const existingUser = await userRepository.emailExists(data.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    } as any);

    const token = this.generateToken(user.id.toString());

    return {
      user: this.formatUserResponse(user),
      token,
    };
  }

  // Login user
  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await userRepository.findByEmailWithPassword(data.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id.toString());

    return {
      user: this.formatUserResponse(user),
      token,
    };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<AuthResponse["user"]> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this.formatUserResponse(user);
  }

  // Verify token
  verifyToken(token: string): { id: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}

// Export instance
export default new AuthService();
