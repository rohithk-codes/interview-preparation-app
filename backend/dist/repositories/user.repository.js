"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const User_1 = __importDefault(require("../models/User"));
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_1.default);
    }
    async findByEmail(email) {
        return await User_1.default.findOne({ email });
    }
    async findByEmailWithPassword(email) {
        return await User_1.default.findOne({ email }).select("+password");
    }
    async findByIdSafe(id) {
        return await User_1.default.findById(id).select("-password");
    }
    async emailExists(email) {
        const user = await User_1.default.findOne({ email }).select("_id").lean();
        return user !== null;
    }
    async findByGoogleId(googleId) {
        return await User_1.default.findOne({ googleId });
    }
    async linkGoogleId(userId, googleId) {
        return await User_1.default.findByIdAndUpdate(userId, { $set: { googleId } }, { new: true });
    }
    async findByRole(role) {
        return await User_1.default.find({ role });
    }
    async updateProfile(userId, data) {
        return await User_1.default.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true });
    }
    async updateOTP(email, otp, otpExpires) {
        return await User_1.default.findOneAndUpdate({ email }, { $set: { otp, otpExpires } }, { new: true });
    }
    async verifyUser(email) {
        return await User_1.default.findOneAndUpdate({ email }, { $set: { isVerified: true }, $unset: { otp: 1, otpExpires: 1 } }, { new: true });
    }
    async updateRefreshToken(userId, refreshToken) {
        await User_1.default.findByIdAndUpdate(userId, { $set: { refreshToken } });
    }
    async findByRefreshToken(refreshToken) {
        return await User_1.default.findOne({ refreshToken });
    }
}
exports.UserRepository = UserRepository;
exports.default = new UserRepository();
