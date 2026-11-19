import { Favorite } from '../models/Favorite';
import { WorkoutProgram } from '../models/WorkoutProgram';
import { Exercise } from '../models/Exercise';
import { ApiError } from '../utils/ApiError';

export async function listFavorites(userId: string) {
  const favs = await Favorite.find({ userId }).sort({ createdAt: -1 }).lean();
  const programIds = favs.filter((f) => f.itemType === 'program').map((f) => f.itemId);
  const exerciseIds = favs.filter((f) => f.itemType === 'exercise').map((f) => f.itemId);
  const [programs, exercises] = await Promise.all([
    WorkoutProgram.find({ _id: { $in: programIds }, isPublished: true }).lean(),
    Exercise.find({ _id: { $in: exerciseIds }, isPublished: true }).lean(),
  ]);
  return {
    favorites: favs.map((f) => ({ id: String(f._id), itemType: f.itemType, itemId: String(f.itemId), createdAt: f.createdAt })),
    programs,
    exercises,
  };
}

export async function addFavorite(userId: string, itemType: 'program' | 'exercise', itemId: string) {
  const Model = itemType === 'program' ? WorkoutProgram : Exercise;
  const exists = await Model.exists({ _id: itemId });
  if (!exists) throw ApiError.notFound(`${itemType === 'program' ? 'Program' : 'Exercise'} not found`);

  const existing = await Favorite.findOne({ userId, itemType, itemId });
  if (existing) return { favorite: existing, alreadyFavorite: true };

  const favorite = await Favorite.create({ userId, itemType, itemId });
  if (itemType === 'program') {
    await WorkoutProgram.updateOne({ _id: itemId }, { $inc: { favoritesCount: 1 } });
  }
  return { favorite, alreadyFavorite: false };
}

export async function removeFavorite(userId: string, id: string) {
  const fav = await Favorite.findOneAndDelete({ _id: id, userId });
  if (!fav) throw ApiError.notFound('Favorite not found');
  if (fav.itemType === 'program') {
    await WorkoutProgram.updateOne({ _id: fav.itemId }, { $inc: { favoritesCount: -1 } });
  }
  return { id, deleted: true };
}
