import mongoose, { Schema, Document, Types } from 'mongoose';
import { PROGRAM_CATEGORIES, DIFFICULTIES, MUSCLE_GROUPS, EQUIPMENT } from '../utils/constants';

export interface ProgramExercise {
  exerciseId: Types.ObjectId;
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface IWorkoutProgram extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  categories: string[];
  difficulty: string;
  durationMinutes: number;
  weeklyFrequency: number;
  targetMuscleGroups: string[];
  equipment: string[];
  coverImage?: string;
  exercises: ProgramExercise[];
  estimatedCalories: number;
  isPublished: boolean;
  favoritesCount: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const programExerciseSchema = new Schema<ProgramExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    order: { type: Number, required: true },
    sets: { type: Number, default: 3, min: 1, max: 10 },
    reps: { type: Number, default: 10, min: 1, max: 100 },
    restSeconds: { type: Number, default: 60, min: 10, max: 300 },
  },
  { _id: false }
);

const workoutProgramSchema = new Schema<IWorkoutProgram>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 2000 },
    categories: [{ type: String, enum: PROGRAM_CATEGORIES, index: true }],
    difficulty: { type: String, required: true, enum: DIFFICULTIES, index: true },
    durationMinutes: { type: Number, required: true, min: 5, max: 180 },
    weeklyFrequency: { type: Number, default: 3, min: 1, max: 7 },
    targetMuscleGroups: [{ type: String, enum: MUSCLE_GROUPS }],
    equipment: [{ type: String, enum: EQUIPMENT }],
    coverImage: { type: String },
    exercises: { type: [programExerciseSchema], default: [] },
    estimatedCalories: { type: Number, default: 250 },
    isPublished: { type: Boolean, default: true, index: true },
    favoritesCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

workoutProgramSchema.index({ name: 'text', description: 'text' });

export const WorkoutProgram = mongoose.model<IWorkoutProgram>('WorkoutProgram', workoutProgramSchema);
