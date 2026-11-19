import mongoose, { Schema, Document, Types } from 'mongoose';
import { GOAL_TYPES } from '../utils/constants';

export interface IFitnessGoal extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate?: Date;
  status: 'active' | 'completed' | 'failed';
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fitnessGoalSchema = new Schema<IFitnessGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, maxlength: 500 },
    goalType: { type: String, required: true, enum: GOAL_TYPES },
    targetValue: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'workouts', maxlength: 24 },
    startDate: { type: Date, default: Date.now },
    targetDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'failed'], default: 'active', index: true },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

fitnessGoalSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const FitnessGoal = mongoose.model<IFitnessGoal>('FitnessGoal', fitnessGoalSchema);
