import { BaseRepository } from "./base.repository";
import User, { IUser } from "../models/User";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  // Find user by email (password field excluded by default via schema select:false)
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Find user by email and explicitly include the password field for login verification
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select("+password");
  }

  // Find user by ID and exclude password from result
  async findByIdSafe(id: string): Promise<IUser | null> {
    return await User.findById(id).select("-password");
  }

  // Check if an email is already registered
  async emailExists(email: string): Promise<boolean> {
    const user = await User.findOne({ email }).select("_id").lean();
    return user !== null;
  }

  // Find user by their Google OAuth sub ID
  async findByGoogleId(googleId: string): Promise<IUser | null> {
    return await User.findOne({ googleId });
  }

  // Link a Google OAuth ID to an existing user account
  async linkGoogleId(userId: string, googleId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { googleId } },
      { new: true }
    );
  }

  // Get users by role
  async findByRole(role: string): Promise<IUser[]> {
    return await User.find({ role });
  }

  // Update profile fields
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
}

export default new UserRepository();
