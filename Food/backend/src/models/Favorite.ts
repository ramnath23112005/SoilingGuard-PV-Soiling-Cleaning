import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  itemType: 'program' | 'exercise';
  itemId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: { type: String, enum: ['program', 'exercise'], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

favoriteSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>('Favorite', favoriteSchema);
