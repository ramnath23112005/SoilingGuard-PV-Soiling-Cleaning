import mongoose, { Schema, Document, Types } from 'mongoose';
import { PR_TYPES } from '../utils/constants';

export interface IPersonalRecord extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  exerciseId?: Types.ObjectId;
  exerciseNameSnapshot: string;
  recordType: string;
  value: number;
  previousValue?: number | null;
  unit: string;
  confirmed: boolean;
  achievedAt: Date;
  sessionId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const personalRecordSchema = new Schema<IPersonalRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    exerciseId: { type: Schema.Types.ObjectId, ref: 'Exercise' },
    exerciseNameSnapshot: { type: String, required: true },
    recordType: { type: String, required: true, enum: PR_TYPES },
    value: { type: Number, required: true },
    previousValue: { type: Number, default: null },
    unit: { type: String, default: 'kg' },
    confirmed: { type: Boolean, default: true },
    achievedAt: { type: Date, default: Date.now },
    sessionId: { type: Schema.Types.ObjectId, ref: 'WorkoutSession' },
  },
  { timestamps: true }
);

personalRecordSchema.index(
  { userId: 1, exerciseId: 1, recordType: 1 },
  { unique: true, partialFilterExpression: { exerciseId: { $type: 'objectId' } } }
);
personalRecordSchema.index({ userId: 1, recordType: 1, achievedAt: -1 });

export const PersonalRecord = mongoose.model<IPersonalRecord>('PersonalRecord', personalRecordSchema);
