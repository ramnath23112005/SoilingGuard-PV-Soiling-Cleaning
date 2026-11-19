import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  completedAt?: Date;
  isWarmup?: boolean;
  isPR?: boolean;
}

export interface ISessionExercise {
  exerciseId: Types.ObjectId;
  order: number;
  nameSnapshot: string;
  targetMuscle?: string;
  equipment?: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  sets: IExerciseSet[];
  notes?: string;
  skipped?: boolean;
  previousBest?: { weightKg: number; reps: number } | null;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface IWorkoutSession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  programId?: Types.ObjectId;
  title: string;
  status: SessionStatus;
  startedAt: Date;
  completedAt?: Date;
  durationSeconds: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  caloriesBurned: number;
  caloriesEstimated: true;
  personalRecords: Types.ObjectId[];
  exercises: ISessionExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSetSchema = new Schema<IExerciseSet>(
  {
    setNumber: { type: Number, required: true },
    weightKg: { type: Number, default: 0, min: 0, max: 1500 },
    reps: { type: Number, default: 0, min: 0, max: 500 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    isWarmup: { type: Boolean, default: false },
    isPR: { type: Boolean, default: false },
  },
  { _id: false }
);

const sessionExerciseSchema = new Schema<ISessionExercise>(
  {
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
    order: { type: Number, required: true },
    nameSnapshot: { type: String, required: true },
    targetMuscle: { type: String },
    equipment: { type: String },
    targetSets: { type: Number, default: 3 },
    targetReps: { type: Number, default: 10 },
    restSeconds: { type: Number, default: 60 },
    sets: { type: [exerciseSetSchema], default: [] },
    notes: { type: String, maxlength: 500 },
    skipped: { type: Boolean, default: false },
    previousBest: {
      weightKg: { type: Number },
      reps: { type: Number },
      _id: false,
    },
  },
  { _id: false }
);

const workoutSessionSchema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    programId: { type: Schema.Types.ObjectId, ref: 'WorkoutProgram' },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    status: { type: String, enum: ['active', 'completed', 'abandoned'], default: 'active', index: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    totalVolumeKg: { type: Number, default: 0 },
    totalSets: { type: Number, default: 0 },
    totalReps: { type: Number, default: 0 },
    caloriesBurned: { type: Number, default: 0 },
    caloriesEstimated: { type: Boolean, default: true },
    personalRecords: [{ type: Schema.Types.ObjectId, ref: 'PersonalRecord' }],
    exercises: { type: [sessionExerciseSchema], default: [] },
  },
  { timestamps: true }
);

workoutSessionSchema.index({ userId: 1, startedAt: -1 });
workoutSessionSchema.index({ userId: 1, status: 1 });

export const WorkoutSession = mongoose.model<IWorkoutSession>('WorkoutSession', workoutSessionSchema);
