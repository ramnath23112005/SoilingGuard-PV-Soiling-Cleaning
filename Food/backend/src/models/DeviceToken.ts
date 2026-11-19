import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IDeviceToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  platform: 'ios' | 'android' | 'web';
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['ios', 'android', 'web'], default: 'android' },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);
