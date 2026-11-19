import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import { AuthedRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import * as workout from '../services/workoutService';
import { FitnessProfile } from '../models/FitnessProfile';

function userId(req: AuthedRequest): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}

async function userWeight(uid: string): Promise<number | undefined> {
  const profile = await FitnessProfile.findOne({ userId: uid }).select('weightKg');
  return profile?.weightKg ?? undefined;
}

export const startWorkout = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const result = await workout.startWorkout(userId(req), req.body);
  if (result.resumed) return ok(res, result);
  created(res, result);
});

export const getActive = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await workout.getActiveWorkout(userId(req)));
});

export const getSession = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await workout.getSession(userId(req), req.params.id));
});

export const addSet = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const result = await workout.addSet(userId(req), req.params.id, { ...req.body, exerciseId: req.body.exerciseId });
  ok(res, { session: result.session, set: result.set }, undefined, 201);
});

export const updateSet = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const result = await workout.updateSet(
    userId(req),
    req.params.id,
    req.params.exerciseId,
    Number(req.params.setNumber),
    req.body
  );
  ok(res, { session: result.session, set: result.set });
});

export const deleteSet = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const session = await workout.removeSet(
    userId(req),
    req.params.id,
    req.params.exerciseId,
    Number(req.params.setNumber)
  );
  ok(res, session);
});

export const updateExerciseEntry = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const session = await workout.updateSessionExercise(userId(req), req.params.id, req.params.exerciseId, req.body);
  ok(res, session);
});

export const completeWorkout = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const uid = userId(req);
  const weight = await userWeight(uid);
  const result = await workout.completeWorkout(uid, req.params.id, req.body.durationSeconds, weight);
  ok(res, { session: result.session, summary: result.summary, personalRecords: result.newRecords });
});

export const abandonWorkout = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await workout.abandonWorkout(userId(req), req.params.id));
});

export const history = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const result = await workout.history(userId(req), req.query as never);
  ok(res, result.items, result.meta);
});
