import { BaseRepository } from "./base.repository";
import User, { IUser } from "../models/User";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  async findByIdSafe(id: string): Promise<IUser | null> {
    return await User.findById(id).select("-password");
  }

  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email }).select("_id").lean();
    return user !== null;
  }

  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await User.findOne({ googleId });
  }

  async linkGoogleId(userId: string, googleId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { googleId } },
      { new: true }
    );
  }

  async findByRole(role: string): Promise<IUser[]> {
    return await User.find({ role });
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async updateOTP(email: string, otp: string, otpExpires: Date): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { email },
      { $set: { otp, otpExpires } },
      { new: true }
    );
  }

  async verifyUser(email: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { email },
      { $set: { isVerified: true }, $unset: { otp: 1, otpExpires: 1 } },
      { new: true }
    );
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await User.findByIdAndUpdate(userId, { $set: { refreshToken } });
  }

  async findByRefreshToken(refreshToken: string): Promise<IUser | null> {
    return await User.findOne({ refreshToken });
  }
}

export default new UserRepository();
