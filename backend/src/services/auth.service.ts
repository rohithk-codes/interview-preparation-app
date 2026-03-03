import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
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
  private readonly googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private generateToken(userId: string): string {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });
  }

  private formatUserResponse(user: IUser): AuthResponse["user"] {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  // ─── Public Methods ────────────────────────────────────────────────────────

  async signup(data: SignupDTO): Promise<AuthResponse> {
    const exists = await userRepository.emailExists(data.email);
    if (exists) {
      throw new Error("User already exists with this email");
    }

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: data.password,
    });

    const token = this.generateToken(user.id.toString());

    return { user: this.formatUserResponse(user), token };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    // Must use findByEmailWithPassword to get the hashed password for comparison
    const user = await userRepository.findByEmailWithPassword(data.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user.id.toString());

    return { user: this.formatUserResponse(user), token };
  }

  async googleLogin(credential: string): Promise<AuthResponse> {
    // Verify the Google token — this is business logic, belongs in the service
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    const { email, name, sub: googleId } = payload;

    let user = await userRepository.findByEmail(email);

    if (user) {
      // Existing user — link their Google ID if not already linked
      // Use the repository's linkGoogleId instead of calling user.save() directly
      if (!user.googleId) {
        user = (await userRepository.linkGoogleId(
          user.id.toString(),
          googleId!
        )) as IUser;
      }
    } else {
      // New user via Google — generate a cryptographically secure random password
      // (required by schema; they'll authenticate via Google, never this password)
      const randomPassword = crypto.randomBytes(32).toString("hex");

      user = await userRepository.create({
        name: name || "Google User",
        email,
        password: randomPassword,
        role: "user",
        googleId,
      } as any);
    }

    const token = this.generateToken(user!.id.toString());

    return { user: this.formatUserResponse(user!), token };
  }

  async getUserById(userId: string): Promise<AuthResponse["user"]> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return this.formatUserResponse(user);
  }

  verifyToken(token: string): { id: string } {
    try {
      return jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };
    } catch {
      throw new Error("Invalid or expired token");
    }
  }
}

export default new AuthService();
