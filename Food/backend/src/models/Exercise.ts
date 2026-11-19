import mongoose, { Schema, Document, Types } from 'mongoose';
import { MUSCLE_GROUPS, EQUIPMENT, DIFFICULTIES } from '../utils/constants';

export interface IExercise extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  imageUrls: string[];
  videoUrl?: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  commonMistakes: string[];
  safetyTips: string[];
  defaultSets: number;
  defaultReps: number;
  caloriesPerMinute: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema<IExercise>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, maxlength: 1000 },
    imageUrls: [{ type: String }],
    videoUrl: { type: String },
    targetMuscle: { type: String, required: true, enum: MUSCLE_GROUPS, index: true },
    secondaryMuscles: [{ type: String, enum: MUSCLE_GROUPS }],
    equipment: { type: String, required: true, enum: EQUIPMENT, index: true },
    difficulty: { type: String, required: true, enum: DIFFICULTIES, index: true },
    instructions: [{ type: String }],
    commonMistakes: [{ type: String }],
    safetyTips: [{ type: String }],
    defaultSets: { type: Number, default: 3, min: 1, max: 10 },
    defaultReps: { type: Number, default: 10, min: 1, max: 100 },
    caloriesPerMinute: { type: Number, default: 6, min: 1, max: 20 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

exerciseSchema.index({ name: 'text', description: 'text' });

export const Exercise = mongoose.model<IExercise>('Exercise', exerciseSchema);
