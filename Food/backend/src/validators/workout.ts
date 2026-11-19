import { z } from 'zod';
import { objectId, paginationQuery, muscleGroup } from './common';

export const startWorkoutSchema = z.object({
  programId: objectId.optional(),
  title: z.string().trim().min(2).max(120).optional(),
  exercises: z
    .array(
      z.object({
        exerciseId: objectId,
        sets: z.coerce.number().int().min(1).max(10).default(3),
        reps: z.coerce.number().int().min(1).max(100).default(10),
        restSeconds: z.coerce.number().int().min(10).max(300).default(60),
      })
    )
    .min(1)
    .optional(),
});

export const addSetSchema = z.object({
  exerciseId: objectId,
  weightKg: z.coerce.number().min(0).max(1500).default(0),
  reps: z.coerce.number().int().min(0).max(500).default(0),
  completed: z.boolean().default(false),
  isWarmup: z.boolean().default(false),
});

export const updateSetSchema = z.object({
  weightKg: z.coerce.number().min(0).max(1500).optional(),
  reps: z.coerce.number().int().min(0).max(500).optional(),
  completed: z.boolean().optional(),
});

export const updateSessionExerciseSchema = z.object({
  notes: z.string().max(500).nullish(),
  skipped: z.boolean().optional(),
  replaceExerciseId: objectId.optional(),
});

export const historyQuerySchema = paginationQuery.extend({
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  muscle: muscleGroup.optional(),
});

export const completeWorkoutSchema = z.object({
  durationSeconds: z.coerce.number().int().min(0).max(86400).optional(),
});

export type StartWorkoutInput = z.infer<typeof startWorkoutSchema>;
export type HistoryQuery = z.infer<typeof historyQuerySchema>;
