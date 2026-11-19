import { z } from 'zod';
import { muscleGroup, equipmentEnum, difficultyEnum, categoryEnum, objectId, paginationQuery } from './common';

export const exerciseQuerySchema = paginationQuery.extend({
  search: z.string().trim().max(80).optional(),
  muscle: muscleGroup.optional(),
  equipment: equipmentEnum.optional(),
  difficulty: difficultyEnum.optional(),
  sort: z.enum(['name', '-name', 'difficulty', '-difficulty']).optional(),
});

export const createExerciseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(1000),
  targetMuscle: muscleGroup,
  secondaryMuscles: z.array(muscleGroup).default([]),
  equipment: equipmentEnum,
  difficulty: difficultyEnum,
  instructions: z.array(z.string().min(4).max(400)).min(1),
  commonMistakes: z.array(z.string().max(400)).default([]),
  safetyTips: z.array(z.string().max(400)).default([]),
  defaultSets: z.coerce.number().int().min(1).max(10).default(3),
  defaultReps: z.coerce.number().int().min(1).max(100).default(10),
  caloriesPerMinute: z.coerce.number().min(1).max(20).default(6),
  imageUrls: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().default(true),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const programQuerySchema = paginationQuery.extend({
  search: z.string().trim().max(80).optional(),
  difficulty: difficultyEnum.optional(),
  muscle: muscleGroup.optional(),
  category: categoryEnum.optional(),
  sort: z.enum(['name', '-name', 'durationMinutes', '-durationMinutes', 'difficulty']).optional(),
});

export const programExerciseInput = z.object({
  exerciseId: objectId,
  order: z.coerce.number().int().min(0).optional(),
  sets: z.coerce.number().int().min(1).max(10).default(3),
  reps: z.coerce.number().int().min(1).max(100).default(10),
  restSeconds: z.coerce.number().int().min(10).max(300).default(60),
});

export const createProgramSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(2000),
  categories: z.array(categoryEnum).min(1),
  difficulty: difficultyEnum,
  durationMinutes: z.coerce.number().int().min(5).max(180),
  weeklyFrequency: z.coerce.number().int().min(1).max(7).default(3),
  targetMuscleGroups: z.array(muscleGroup).default([]),
  equipment: z.array(equipmentEnum).default([]),
  coverImage: z.string().optional(),
  estimatedCalories: z.coerce.number().int().min(0).max(3000).default(250),
  exercises: z.array(programExerciseInput).min(1),
  isPublished: z.boolean().default(true),
});

export const updateProgramSchema = createProgramSchema.partial();

export type ExerciseQuery = z.infer<typeof exerciseQuerySchema>;
export type ProgramQuery = z.infer<typeof programQuerySchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type CreateProgramInput = z.infer<typeof createProgramSchema>;
