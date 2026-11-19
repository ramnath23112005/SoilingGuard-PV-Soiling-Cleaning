import rateLimit from 'express-rate-limit';
import { env, isTest } from '../config/env';

function limiter(windowMs: number, max: number, message: string) {
  return rateLimit({
    windowMs,
    max: isTest ? 100000 : max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { code: 'RATE_LIMITED', message } },
  });
}

export const apiLimiter = limiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX, 'Too many requests, please try again later.');
export const authLimiter = limiter(15 * 60 * 1000, env.AUTH_RATE_LIMIT_MAX, 'Too many authentication attempts. Try again in 15 minutes.');
