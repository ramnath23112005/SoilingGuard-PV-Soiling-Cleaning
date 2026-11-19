import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, created } from '../utils/response';
import * as authService from '../services/authService';
import { changePassword } from '../services/authService';
import { AuthedRequest } from '../middleware/auth';
import { ApiError } from '../utils/ApiError';

const ua = (req: Request) => (req.headers['user-agent'] as string) ?? 'unknown';
const refreshOf = (req: Request) => {
  const body = req.body as { refreshToken?: string };
  const header = req.headers['x-refresh-token'];
  return body?.refreshToken ?? (typeof header === 'string' ? header : undefined);
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body, ua(req));
  created(res, result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, ua(req));
  ok(res, result);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refresh(refreshOf(req) ?? '', ua(req));
  ok(res, result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.logout(refreshOf(req));
  ok(res, result);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body.email);
  ok(res, result);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  ok(res, result);
});

export const changeMyPassword = asyncHandler(async (req: AuthedRequest, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { currentPassword, newPassword } = req.body;
  const result = await changePassword(req.user.sub, currentPassword, newPassword);
  ok(res, result);
});
