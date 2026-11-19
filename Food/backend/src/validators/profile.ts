import { z } from 'zod';
import { fitnessGoalEnum, preferenceEnum, muscleGroup, strengthMetricEnum, objectId } from './common';

export const onboardingSchema = z.object({
  age: z.coerce.number().int().min(10).max(100),
  heightCm: z.coerce.number().min(80).max(260),
  weightKg: z.coerce.number().min(25).max(400),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  goals: z.array(fitnessGoalEnum).min(1),
  preferences: z.array(preferenceEnum).min(1),
  daysPerWeek: z.coerce.number().int().min(2).max(7),
  sessionMinutes: z.coerce.number().int().refine((v) => [15, 30, 45, 60].includes(v), 'Invalid duration'),
  targetMuscleGroups: z.array(muscleGroup).min(1),
});

export const updateProfileSchema = z.object({
  age: z.coerce.number().int().min(10).max(100).optional(),
  heightCm: z.coerce.number().min(80).max(260).optional(),
  weightKg: z.coerce.number().min(25).max(400).optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goals: z.array(fitnessGoalEnum).optional(),
  preferences: z.array(preferenceEnum).optional(),
  daysPerWeek: z.coerce.number().int().min(2).max(7).optional(),
  sessionMinutes: z.coerce.number().int().refine((v) => [15, 30, 45, 60].includes(v), 'Invalid duration').optional(),
  targetMuscleGroups: z.array(muscleGroup).optional(),
  onboardingCompleted: z.boolean().optional(),
});

export const createGoalSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().max(500).optional(),
  goalType: z.enum(['workoutsCount', 'frequency', 'targetWeight', 'strengthMetric', 'programCompletion', 'streak']),
  targetValue: z.coerce.number().min(0),
  unit: z.string().max(24).optional(),
  startDate: z.coerce.date().optional(),
  targetDate: z.coerce.date().optional(),
  exerciseId: objectId.optional(),
  programId: objectId.optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  targetValue: z.coerce.number().min(0).optional(),
  currentValue: z.coerce.number().min(0).optional(),
  unit: z.string().max(24).optional(),
  targetDate: z.coerce.date().nullable().optional(),
  status: z.enum(['active', 'completed', 'failed']).optional(),
});

export const measurementSchema = z.object({
  type: z.enum(['weight', 'measurement']).default('weight'),
  value: z.coerce.number().min(20).max(400),
  unit: z.string().max(10).optional(),
  label: z.string().max(40).optional(),
  measuredAt: z.coerce.date().optional(),
  notes: z.string().max(300).optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalSchemaInput = z.infer<typeof updateGoalSchema>;
export type MeasurementInput = z.infer<typeof measurementSchema>;
