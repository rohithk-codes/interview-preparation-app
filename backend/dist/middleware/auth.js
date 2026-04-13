"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = __importDefault(require("../repositories/user.repository"));
const protect = async (req, res, next) => {
    try {
        let token;
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET || "access_secret");
        // Route through the repository — never talk to the Mongoose model directly
        const user = await user_repository_1.default.findByIdSafe(decoded.id);
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
    }
    catch (error) {
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
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
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
exports.authorize = authorize;
