import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/user.repository";

interface JwtPayload {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized, no token provided",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || "access_secret"
    ) as JwtPayload;

    // Route through the repository — never talk to the Mongoose model directly
    const user = await userRepository.findByIdSafe(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Not authorized, user not found",
      });
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error: any) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
      return;
    }

    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Not authorized, token expired",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`,
      });
      return;
    }
    next();
  };
};
