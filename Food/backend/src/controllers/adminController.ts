import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import * as admin from '../services/adminService';
import * as catalog from '../services/catalogService';
import { uploadMedia } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { AuthedRequest } from '../middleware/auth';

export const dashboard = asyncHandler(async (_req, res: Response) => {
  ok(res, await admin.dashboardStats());
});

export const users = asyncHandler(async (req, res: Response) => {
  const result = await admin.listUsers({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    search: typeof req.query.search === 'string' ? req.query.search : undefined,
  });
  ok(res, result.items, result.meta);
});

export const setUserDisabled = asyncHandler(async (req, res: Response) => {
  const disabled = req.body.disabled === true;
  ok(res, await admin.setUserDisabled(req.params.id, disabled));
});

export const createExercise = asyncHandler(async (req, res: Response) => {
  created(res, await catalog.createExercise(req.body));
});

export const updateExercise = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.updateExercise(req.params.id, req.body));
});

export const deleteExercise = asyncHandler(async (req, res: Response) => {
  ok(res, await catalog.deleteExercise(req.params.id));
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

export const uploadContent = asyncHandler(async (req, res: Response) => {
  const file = req.file;
  if (!file) throw ApiError.badRequest('No file provided');
  const isVideo = file.mimetype?.startsWith('video') ?? false;
  const result = await uploadMedia(file.buffer, 'content', {
    resourceType: isVideo ? 'video' : 'image',
    filename: file.originalname,
  });
  created(res, result);
});
