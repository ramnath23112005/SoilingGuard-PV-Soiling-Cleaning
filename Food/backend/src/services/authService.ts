import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { FitnessProfile } from '../models/FitnessProfile';
import { RefreshToken } from '../models/RefreshToken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  randomToken,
} from '../utils/tokens';
import { RegisterInput, LoginInput } from '../validators/auth';
import { logger } from '../utils/logger';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  experienceLevel?: string;
  avatarUrl?: string;
  createdAt: string;
}

export function toPublicUser(user: IUser): PublicUser {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    gender: user.gender ?? null,
    experienceLevel: user.experienceLevel,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString(),
  };
}

async function issueTokens(user: IUser, userAgent?: string): Promise<TokenPair> {
  const payload = { sub: user._id.toString(), email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const jti = randomToken();
  const refreshToken = signRefreshToken({ ...payload, jti });
  const expiresAt = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId: user._id, tokenHash: hashToken(jti), expiresAt, userAgent });
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, userAgent?: string) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, env.NODE_ENV === 'test' ? 4 : 12);
  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender ?? null,
    experienceLevel: input.experienceLevel,
  });
  await FitnessProfile.create({ userId: user._id, onboardingCompleted: false });
  const tokens = await issueTokens(user, userAgent);
  logger.info('user registered', { userId: user._id.toString() });
  return { user: toPublicUser(user), ...tokens };
}

export async function login(input: LoginInput, userAgent?: string) {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  const valid = await user.comparePassword(input.password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  if (user.isDisabled) throw ApiError.forbidden('Account disabled. Contact support.');
  user.lastLoginAt = new Date();
  await user.save();
  const tokens = await issueTokens(user, userAgent);
  return { user: toPublicUser(user), ...tokens };
}

export async function refresh(refreshToken: string, userAgent?: string) {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token required');
  let payload: ReturnType<typeof verifyRefreshToken>;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token', 'INVALID_REFRESH');
  }
  const stored = await RefreshToken.findOne({ tokenHash: hashToken(payload.jti) });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token revoked or expired', 'INVALID_REFRESH');
  }
  const user = await User.findById(payload.sub);
  if (!user || user.isDisabled) throw ApiError.unauthorized('Account unavailable');

  // rotation: revoke old, issue new
  stored.revokedAt = new Date();
  await stored.save();
  const tokens = await issueTokens(user, userAgent);
  return { user: toPublicUser(user), ...tokens };
}

export async function logout(refreshToken?: string) {
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await RefreshToken.updateOne(
        { tokenHash: hashToken(payload.jti), revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
    } catch {
      /* token invalid - nothing to revoke */
    }
  }
  return { message: 'Logged out' };
}

/**
 * Password reset: in production an email with a signed token would be sent.
 * Development mode returns the reset token in the response so the flow is
 * fully testable without an SMTP provider (documented in README).
 */
export async function forgotPassword(email: string, isDev = env.NODE_ENV !== 'production') {
  const user = await User.findOne({ email: email.toLowerCase() });
  const generic = { message: 'If that email exists, a reset link has been sent.' };
  if (!user) return generic;

  const rawToken = randomToken();
  const hashed = hashToken(rawToken);
  const existing = await RefreshToken.findOne({ userId: user._id, userAgent: 'password-reset' });
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  if (existing) {
    existing.tokenHash = hashed;
    existing.expiresAt = expiresAt;
    existing.revokedAt = null;
    await existing.save();
  } else {
    await RefreshToken.create({ userId: user._id, tokenHash: hashed, expiresAt, userAgent: 'password-reset' });
  }
  logger.info('password reset requested', { userId: user._id.toString() });
  if (!isDev) return generic;
  return { ...generic, devResetToken: rawToken };
}

export async function resetPassword(token: string, password: string) {
  const hashed = hashToken(token);
  const record = await RefreshToken.findOne({ tokenHash: hashed, revokedAt: null });
  if (!record || record.expiresAt < new Date() || record.userAgent !== 'password-reset') {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.findByIdAndUpdate(record.userId, { passwordHash });
  await RefreshToken.updateMany({ userId: record.userId }, { $set: { revokedAt: new Date() } });
  logger.info('password reset completed', { userId: record.userId?.toString() });
  return { message: 'Password updated. Please log in with your new password.' };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  const valid = await user.comparePassword(currentPassword);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect', 'INVALID_CREDENTIALS');
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
  await RefreshToken.updateMany({ userId: user._id }, { $set: { revokedAt: new Date() } });
  return { message: 'Password changed. Please log in again.' };
}
