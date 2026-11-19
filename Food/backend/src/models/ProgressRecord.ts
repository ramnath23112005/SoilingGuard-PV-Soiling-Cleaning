import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProgressRecord extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: 'weight' | 'measurement';
  value: number;
  unit: string;
  label?: string;
  measuredAt: Date;
  notes?: string;
  source: 'manual' | 'derived';
  createdAt: Date;
  updatedAt: Date;
}

const progressRecordSchema = new Schema<IProgressRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['weight', 'measurement'], required: true, index: true },
    value: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    label: { type: String, maxlength: 40 },
    measuredAt: { type: Date, default: Date.now, index: true },
    notes: { type: String, maxlength: 300 },
    source: { type: String, enum: ['manual', 'derived'], default: 'manual' },
  },
  { timestamps: true }
);

progressRecordSchema.index({ userId: 1, type: 1, measuredAt: -1 });

export const ProgressRecord = mongoose.model<IProgressRecord>('ProgressRecord', progressRecordSchema);
