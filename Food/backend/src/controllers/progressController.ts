import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import { AuthedRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import * as progress from '../services/progressService';

function userId(req: AuthedRequest): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}

const daysOf = (v: unknown, fallback: number) => {
  const n = Number(v);
  if (!n || Number.isNaN(n)) return fallback;
  return Math.min(365, Math.max(1, n));
};

export const overview = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await progress.overview(userId(req), daysOf(req.query.days, 30)));
});

export const weightHistory = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await progress.weightHistory(userId(req), daysOf(req.query.days, 30)));
});

export const addWeight = asyncHandler(async (req: AuthedRequest, res: Response) => {
  created(res, await progress.recordWeight(userId(req), req.body));
});

export const getMeasurements = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const label = typeof req.query.label === 'string' ? req.query.label : undefined;
  ok(res, await progress.measurements(userId(req), daysOf(req.query.days, 365), label));
});

export const addMeasurement = asyncHandler(async (req: AuthedRequest, res: Response) => {
  created(res, await progress.recordMeasurement(userId(req), req.body));
});

export const records = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await progress.records(userId(req)));
});

export const activitySeries = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await progress.activitySeries(userId(req), daysOf(req.query.days, 30)));
});
