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

 
  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }

  // Get users by role
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
}

export default new UserRepository();
