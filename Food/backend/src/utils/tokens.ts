import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
    issuer: 'fittrack',
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'fittrack' }) as jwt.JwtPayload;
  return decoded as unknown as AccessPayload;
}

export function signRefreshToken(payload: AccessPayload & { jti: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.JWT_REFRESH_EXPIRES_DAYS}d`,
    issuer: 'fittrack',
  });
}

export function verifyRefreshToken(token: string): AccessPayload & { jti: string } {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, { issuer: 'fittrack' }) as jwt.JwtPayload;
  return decoded as unknown as AccessPayload & { jti: string };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function randomToken(): string {
  return crypto.randomBytes(48).toString('hex');
}
