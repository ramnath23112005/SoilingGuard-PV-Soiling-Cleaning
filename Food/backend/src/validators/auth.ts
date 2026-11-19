import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2).max(80),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.enum(['male', 'female', 'other']).nullish(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const updateMeSchema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  dateOfBirth: z.coerce.date().nullish(),
  gender: z.enum(['male', 'female', 'other']).nullish(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  avatarUrl: z.union([z.string().url().max(500), z.string().startsWith('/').max(500)]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateMeInput = z.infer<typeof updateMeSchema>;
