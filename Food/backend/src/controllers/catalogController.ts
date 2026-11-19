import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import { AuthedRequest } from '../middleware/auth';
import * as catalog from '../services/catalogService';
import { Favorite } from '../models/Favorite';
import { uploadMedia } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

/* -------------------------------- Exercises ------------------------------- */

export const listExercises = asyncHandler(async (req, res: Response) => {
  const result = await catalog.listExercises(req.query as never);
  ok(res, result.items, result.meta);
});

export const getExercise = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.getExercise(req.params.id));
});

export const createExercise = asyncHandler(async (req: AuthedRequest, res: Response) => {
  created(res, await catalog.createExercise(req.body));
});

export const updateExercise = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.updateExercise(req.params.id, req.body));
});

export const deleteExercise = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.deleteExercise(req.params.id));
});

export const uploadExerciseMedia = asyncHandler(async (req, res: Response) => {
  const file = req.file;
  if (!file) throw ApiError.badRequest('No file provided');
  const isVideo = file.mimetype?.startsWith('video') ?? false;
  const result = await uploadMedia(file.buffer, 'exercises', {
    resourceType: isVideo ? 'video' : 'image',
    filename: file.originalname,
  });
  created(res, result);
});

/* -------------------------------- Programs -------------------------------- */

export const listPrograms = asyncHandler(async (req, res: Response) => {
  const result = await catalog.listPrograms(req.query as never);
  ok(res, result.items, result.meta);
});

export const getProgram = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = req.user?.sub;
  const program = await catalog.getProgram(req.params.id);
  let favoriteId: string | null = null;
  if (userId) {
    const fav = await Favorite.findOne({ userId, itemType: 'program', itemId: req.params.id });
    favoriteId = fav ? String(fav._id) : null;
  }
  ok(res, { ...program, favoriteId });
});

export const createProgram = asyncHandler(async (req: AuthedRequest, res: Response) => {
  created(res, await catalog.createProgram(req.body, req.user?.sub));
});

export const updateProgram = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.updateProgram(req.params.id, req.body));
});

export const deleteProgram = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.deleteProgram(req.params.id));
});
