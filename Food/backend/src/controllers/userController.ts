import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import { AuthedRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User';
import { FitnessProfile } from '../models/FitnessProfile';
import { WorkoutSession } from '../models/WorkoutSession';
import { Favorite } from '../models/Favorite';
import { Notification } from '../models/Notification';
import { ProgressRecord } from '../models/ProgressRecord';
import { FitnessGoal } from '../models/FitnessGoal';
import { PersonalRecord } from '../models/PersonalRecord';
import { toPublicUser } from '../services/authService';
import * as profileService from '../services/profileService';
import * as progressService from '../services/progressService';

function requireUser(req: AuthedRequest): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}

/* ---------------------------------- Users --------------------------------- */

export const getMe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const user = await User.findById(requireUser(req)).select('-passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  const profile = await FitnessProfile.findOne({ userId: user._id });
  ok(res, { user: toPublicUser(user), profile });
});

export const updateMe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = requireUser(req);
  const user = await User.findByIdAndUpdate(userId, { $set: req.body }, { new: true, runValidators: true }).select(
    '-passwordHash'
  );
  if (!user) throw ApiError.notFound('User not found');
  ok(res, { user: toPublicUser(user) });
});

export const deleteMe = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const userId = requireUser(req);
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  await Promise.all([
    FitnessProfile.deleteMany({ userId }),
    WorkoutSession.deleteMany({ userId }),
    Favorite.deleteMany({ userId }),
    Notification.deleteMany({ userId }),
    ProgressRecord.deleteMany({ userId }),
    FitnessGoal.deleteMany({ userId }),
    PersonalRecord.deleteMany({ userId }),
    user.deleteOne(),
  ]);
  ok(res, { deleted: true });
});

/* --------------------------------- Profile -------------------------------- */

export const getProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await profileService.getProfile(requireUser(req)));
});

export const saveOnboarding = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const profile = await profileService.saveOnboarding(requireUser(req), req.body);
  ok(res, profile);
});

export const updateProfile = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const profile = await profileService.updateProfile(requireUser(req), req.body);
  ok(res, profile);
});

/* ---------------------------------- Goals --------------------------------- */

export const listGoals = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const status = (req.query.status as string) || undefined;
  ok(res, await progressService.listGoals(requireUser(req), status));
});

export const createGoal = asyncHandler(async (req: AuthedRequest, res: Response) => {
  created(res, await progressService.createGoal(requireUser(req), req.body));
});

export const updateGoal = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await progressService.updateGoal(requireUser(req), req.params.id, req.body));
});

export const deleteGoal = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await progressService.deleteGoal(requireUser(req), req.params.id));
});
