"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dns_1 = __importDefault(require("dns"));
dns_1.default.setDefaultResultOrder("ipv4first");
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = process.env.MONGODB_URI_DIRECT;
    if (!primaryUri && !fallbackUri) {
        throw new Error("MONGODB_URI is not set");
    }
    try {
        if (primaryUri) {
            await mongoose_1.default.connect(primaryUri);
            console.log("Mongodb connected");
            return;
        }
        await mongoose_1.default.connect(fallbackUri);
        console.log("Mongodb connected");
    }
    catch (error) {
        const isSrvLookupError = error instanceof Error &&
            ("code" in error) &&
            (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") &&
            primaryUri?.startsWith("mongodb+srv://") &&
            Boolean(fallbackUri);
        if (isSrvLookupError) {
            console.warn("Primary MongoDB SRV connection failed, retrying with MONGODB_URI_DIRECT");
            await mongoose_1.default.connect(fallbackUri);
            console.log("Mongodb connected");
            return;
        }
        console.error("MongoDB connection error", error);
        throw error;
    }
};
exports.default = connectDB;
