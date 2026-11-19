import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFitnessProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferences: string[];
  daysPerWeek?: number;
  sessionMinutes?: number;
  targetMuscleGroups: string[];
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const fitnessProfileSchema = new Schema<IFitnessProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    age: { type: Number, min: 10, max: 100 },
    heightCm: { type: Number, min: 80, max: 260 },
    weightKg: { type: Number, min: 25, max: 400 },
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    goals: [{ type: String }],
    preferences: [{ type: String }],
    daysPerWeek: { type: Number, min: 2, max: 7 },
    sessionMinutes: { type: Number, enum: [15, 30, 45, 60] },
    targetMuscleGroups: [{ type: String }],
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FitnessProfile = mongoose.model<IFitnessProfile>('FitnessProfile', fitnessProfileSchema);
