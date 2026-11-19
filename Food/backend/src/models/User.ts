import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | null;
  experienceLevel?: ExperienceLevel;
  avatarUrl?: string;
  isDisabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', null], default: null },
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    avatarUrl: { type: String },
    isDisabled: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', userSchema);
