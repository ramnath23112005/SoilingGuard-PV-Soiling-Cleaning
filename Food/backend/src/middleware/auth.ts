import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { verifyAccessToken, AccessPayload } from '../utils/tokens';
import { User } from '../models/User';

export interface AuthedRequest extends Request {
  user?: AccessPayload;
}

export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing bearer token'));
  }
  try {
    const payload = verifyAccessToken(header.slice(7));
    req.user = payload;
    next();
  } catch {
    next(ApiError.unauthorized('Invalid or expired access token'));
  }
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = verifyAccessToken(header.slice(7));
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  next();
}

export async function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw ApiError.unauthorized();
    const user = await User.findById(req.user.sub).select('role isDisabled');
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    if (user.role !== 'admin') throw ApiError.forbidden('Administrator access required');
    next();
  } catch (err) {
    next(err);
  }
}

/** Ensures the authenticated account is still active (not disabled). */
export async function ensureActive(req: AuthedRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) return next();
    const user = await User.findById(req.user.sub).select('isDisabled');
    if (!user) throw ApiError.unauthorized('Account no longer exists');
    if (user.isDisabled) throw ApiError.forbidden('Account disabled. Contact support.');
    next();
  } catch (err) {
    next(err);
  }
}
