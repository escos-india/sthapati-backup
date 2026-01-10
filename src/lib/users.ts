import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import type { IUser } from '@/types/user';
import type { UserCategory, UserStatus } from '@/types/user';

export async function getUserByEmail(email: string) {
  await connectDB();
  return UserModel.findOne({ email: email.toLowerCase() }).lean<IUser | null>();
}

export async function getUserByGoogleId(googleId: string) {
  await connectDB();
  return UserModel.findOne({ googleId }).lean<IUser | null>();
}

export async function createUserFromOAuth(params: {
  name: string;
  email: string;
  googleId: string;
  image?: string | null;
  category: UserCategory;
  coa_number?: string;
}) {
  const { name, email, googleId, image, category, coa_number } = params;
  await connectDB();

  const status: UserStatus = category === 'Architect' ? 'pending' : 'active';

  return UserModel.create({
    name,
    email: email.toLowerCase(),
    googleId,
    image,
    category,
    coa_number,
    auth_provider: 'google',
    status,
  });
}

export async function getAllUsers() {
  await connectDB();
  return UserModel.find().sort({ createdAt: -1 }).lean<IUser[]>();
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  await connectDB();
  return UserModel.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).lean<IUser | null>();
}

export async function deleteUser(userId: string) {
  await connectDB();
  return UserModel.findByIdAndDelete(userId);
}

