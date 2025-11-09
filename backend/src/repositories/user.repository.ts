import { BaseRepository } from './base.repository';
import User, { IUser } from '../models/User';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  // Find user by email
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  // Find user by email with password field (for login)
  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return await User.findOne({ email }).select('+password');
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const count = await User.countDocuments({ email });
    return count > 0;
  }

  // Get users by role
  async findByRole(role: string): Promise<IUser[]> {
    return await User.find({ role });
  }

  // Update user profile
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

// Export singleton instance
export default new UserRepository();