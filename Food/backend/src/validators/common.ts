import { z } from 'zod';
import { MUSCLE_GROUPS, EQUIPMENT, DIFFICULTIES, PROGRAM_CATEGORIES, FITNESS_GOALS, WORKOUT_PREFERENCES } from '../utils/constants';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const muscleGroup = z.enum(MUSCLE_GROUPS);
export const equipmentEnum = z.enum(EQUIPMENT);
export const difficultyEnum = z.enum(DIFFICULTIES);
export const categoryEnum = z.enum(PROGRAM_CATEGORIES);

export const strengthMetricEnum = z.enum(['benchPress', 'squat', 'deadlift', 'overheadPress', 'pullUp']);
export const fitnessGoalEnum = z.enum(FITNESS_GOALS);
export const preferenceEnum = z.enum(WORKOUT_PREFERENCES);

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72)
  .regex(/[A-Za-z]/, 'Must contain a letter')
  .regex(/[0-9]/, 'Must contain a number');

export const emailSchema = z.string().trim().toLowerCase().email().max(160);
