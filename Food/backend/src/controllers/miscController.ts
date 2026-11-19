import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import { AuthedRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';
import * as favorites from '../services/favoriteService';
import * as notifications from '../services/notificationService';

function userId(req: AuthedRequest): string {
  if (!req.user) throw ApiError.unauthorized();
  return req.user.sub;
}

/* ------------------------------- Favorites -------------------------------- */

export const listFavorites = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await favorites.listFavorites(userId(req)));
});

export const addFavorite = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const result = await favorites.addFavorite(userId(req), req.body.itemType, req.body.itemId);
  if (result.alreadyFavorite) return ok(res, result);
  created(res, result);
});

export const removeFavorite = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await favorites.removeFavorite(userId(req), req.params.id));
});

/* ------------------------------ Notifications ----------------------------- */

export const listNotifications = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await notifications.listNotifications(userId(req), page, limit);
  ok(res, result.items, result.meta);
});

export const markNotificationRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  const notif = await notifications.markRead(userId(req), req.params.id);
  if (!notif) throw ApiError.notFound('Notification not found');
  ok(res, notif);
});

export const markAllRead = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await notifications.markAllRead(userId(req)));
});

export const registerDevice = asyncHandler(async (req: AuthedRequest, res: Response) => {
  created(res, await notifications.registerDeviceToken(userId(req), req.body.token, req.body.platform ?? 'android'));
});

export const unregisterDevice = asyncHandler(async (req: AuthedRequest, res: Response) => {
  ok(res, await notifications.removeDeviceToken(req.body.token));
});
