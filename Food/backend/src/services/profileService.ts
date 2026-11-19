import { FitnessProfile } from '../models/FitnessProfile';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { OnboardingInput, updateProfileSchema } from '../validators/profile';
import { z } from 'zod';

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function getProfile(userId: string) {
  const [profile, user] = await Promise.all([
    FitnessProfile.findOne({ userId }),
    User.findById(userId).select('fullName email experienceLevel avatarUrl dateOfBirth gender'),
  ]);
  if (!user) throw ApiError.notFound('User not found');
  if (!profile) {
    const created = await FitnessProfile.create({ userId, onboardingCompleted: false });
    return { profile: created.toObject(), user: user.toObject() };
  }
  return { profile: profile.toObject(), user: user.toObject() };
}

export async function saveOnboarding(userId: string, input: OnboardingInput) {
  const profile = await FitnessProfile.findOneAndUpdate(
    { userId },
    { $set: { ...input, onboardingCompleted: true } },
    { new: true, upsert: true, runValidators: true }
  );
  if (input.experienceLevel) {
    await User.findByIdAndUpdate(userId, { experienceLevel: input.experienceLevel });
  }
  return profile;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const profile = await FitnessProfile.findOneAndUpdate(
    { userId },
    { $set: input },
    { new: true, runValidators: true, upsert: true }
  );
  if (input.experienceLevel) {
    await User.findByIdAndUpdate(userId, { experienceLevel: input.experienceLevel });
  }
  return profile;
}
