import { apiRequest, apiRequestWithMeta } from './api';
import type {
  Exercise,
  WorkoutProgram,
  WorkoutSession,
  StartWorkoutResponse,
  CompleteWorkoutResponse,
  WorkoutSummary,
  ProgressOverview,
  ProgressRecord,
  PersonalRecord,
  FitnessGoal,
  NotificationItem,
  PageMeta,
  FitnessProfileDoc,
  ActivityBucket,
} from '../types';

/* --------------------------------- Auth ---------------------------------- */

export const authApi = {
  forgotPassword: (email: string) =>
    apiRequest<{ message: string; devResetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    }),
  resetPassword: (token: string, password: string, confirmPassword: string) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password, confirmPassword },
      auth: false,
    }),
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) =>
    apiRequest<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword, confirmPassword },
    }),
};

/* -------------------------------- Profile -------------------------------- */

export const profileApi = {
  saveOnboarding: (input: Record<string, unknown>) =>
    apiRequest<FitnessProfileDoc>('/profile/onboarding', { method: 'POST', body: input }),
  update: (input: Record<string, unknown>) =>
    apiRequest<FitnessProfileDoc>('/profile', { method: 'PUT', body: input }),
  updateMe: (input: Record<string, unknown>) =>
    apiRequest<{ user: unknown }>('/users/me', { method: 'PATCH', body: input }),
  deleteMe: () => apiRequest<{ deleted: boolean }>('/users/me', { method: 'DELETE' }),
};

/* -------------------------------- Catalog -------------------------------- */

export interface CatalogQuery {
  page?: number;
  limit?: number;
  search?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  category?: string;
  sort?: string;
  [key: string]: string | number | boolean | undefined | null;
}

export const catalogApi = {
  exercises: async (query: CatalogQuery = {}): Promise<{ items: Exercise[]; meta: PageMeta }> => {
    const res = await apiRequestWithMeta<Exercise[]>('/exercises', { query });
    return { items: res.data, meta: (res.meta as PageMeta) ?? { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false } };
  },
  exercise: (id: string) => apiRequest<Exercise>(`/exercises/${id}`),
  programs: async (query: CatalogQuery = {}): Promise<{ items: WorkoutProgram[]; meta: PageMeta }> => {
    const res = await apiRequestWithMeta<WorkoutProgram[]>('/programs', { query });
    return { items: res.data, meta: (res.meta as PageMeta) ?? { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false } };
  },
  program: (id: string) => apiRequest<WorkoutProgram>(`/programs/${id}`),
};

/* -------------------------------- Workouts ------------------------------- */

export const workoutApi = {
  start: (body: { programId?: string; title?: string; exercises?: unknown[] }) =>
    apiRequest<StartWorkoutResponse>('/workouts/start', { method: 'POST', body }),
  active: () => apiRequest<WorkoutSession | null>('/workouts/active'),
  session: (id: string) => apiRequest<WorkoutSession>(`/workouts/${id}`),
  addSet: (sessionId: string, body: { exerciseId: string; weightKg: number; reps: number; completed?: boolean }) =>
    apiRequest<{ session: WorkoutSession; set: unknown }>(`/workouts/${sessionId}/sets`, { method: 'POST', body }),
  updateSet: (
    sessionId: string,
    exerciseId: string,
    setNumber: number,
    body: { weightKg?: number; reps?: number; completed?: boolean }
  ) =>
    apiRequest<{ session: WorkoutSession; set: unknown }>(`/workouts/${sessionId}/sets/${exerciseId}/${setNumber}`, {
      method: 'PATCH',
      body,
    }),
  removeSet: (sessionId: string, exerciseId: string, setNumber: number) =>
    apiRequest<WorkoutSession>(`/workouts/${sessionId}/sets/${exerciseId}/${setNumber}`, { method: 'DELETE' }),
  updateExercise: (
    sessionId: string,
    exerciseId: string,
    body: { notes?: string | null; skipped?: boolean; replaceExerciseId?: string }
  ) => apiRequest<WorkoutSession>(`/workouts/${sessionId}/exercises/${exerciseId}`, { method: 'PATCH', body }),
  complete: (sessionId: string, durationSeconds?: number) =>
    apiRequest<CompleteWorkoutResponse>(`/workouts/${sessionId}/complete`, { method: 'POST', body: { durationSeconds } }),
  abandon: (sessionId: string) => apiRequest<WorkoutSession>(`/workouts/${sessionId}/abandon`, { method: 'POST' }),
  history: async (query: { page?: number; limit?: number; status?: string; muscle?: string } = {}) => {
    const res = await apiRequestWithMeta<WorkoutSession[]>('/workouts/history', { query });
    return {
      items: res.data,
      meta: (res.meta as PageMeta) ?? { page: 1, limit: 10, total: 0, totalPages: 1, hasNext: false, hasPrev: false },
    };
  },
};

/* -------------------------------- Progress ------------------------------- */

export const progressApi = {
  overview: (days = 30) => apiRequest<ProgressOverview>('/progress/overview', { query: { days } }),
  weight: (days = 30) => apiRequest<ProgressRecord[]>('/progress/weight', { query: { days } }),
  addWeight: (value: number, measuredAt?: string, notes?: string) =>
    apiRequest<ProgressRecord>('/progress/weight', { method: 'POST', body: { value, measuredAt, notes } }),
  measurements: (days = 365, label?: string) =>
    apiRequest<ProgressRecord[]>('/progress/measurements', { query: { days, label } }),
  addMeasurement: (body: { type: string; value: number; label?: string; unit?: string; measuredAt?: string }) =>
    apiRequest<ProgressRecord>('/progress/measurements', { method: 'POST', body }),
  records: () =>
    apiRequest<{ records: PersonalRecord[]; grouped: Record<string, PersonalRecord[]>; lifetime: Record<string, unknown> }>(
      '/progress/records'
    ),
  activity: (days = 30) => apiRequest<ActivityBucket[]>('/progress/activity', { query: { days } }),
};

/* ---------------------------------- Goals -------------------------------- */

export const goalsApi = {
  list: (status?: string) => apiRequest<FitnessGoal[]>('/profile/goals', { query: { status } }),
  create: (body: Record<string, unknown>) => apiRequest<FitnessGoal>('/profile/goals', { method: 'POST', body }),
  update: (id: string, body: Record<string, unknown>) =>
    apiRequest<FitnessGoal>(`/profile/goals/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => apiRequest<{ deleted: boolean }>(`/profile/goals/${id}`, { method: 'DELETE' }),
};

/* ------------------------------- Favorites ------------------------------- */

export const favoritesApi = {
  list: () =>
    apiRequest<{ favorites: Array<{ id: string; itemType: string; itemId: string }>; programs: WorkoutProgram[]; exercises: Exercise[] }>(
      '/favorites'
    ),
  add: (itemType: 'program' | 'exercise', itemId: string) =>
    apiRequest<{ favorite: { _id: string }; alreadyFavorite: boolean }>('/favorites', {
      method: 'POST',
      body: { itemType, itemId },
    }),
  remove: (id: string) => apiRequest<{ deleted: boolean }>(`/favorites/${id}`, { method: 'DELETE' }),
};

/* ------------------------------ Notifications ---------------------------- */

export const notificationsApi = {
  list: async (page = 1) => {
    const res = await apiRequestWithMeta<NotificationItem[]>('/notifications', { query: { page, limit: 20 } });
    return {
      items: res.data,
      meta: (res.meta as PageMeta) ?? { page: 1, limit: 20, total: 0, totalPages: 1, hasNext: false, hasPrev: false, unread: 0 },
    };
  },
  markRead: (id: string) => apiRequest<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiRequest<{ modified: number }>('/notifications/read-all', { method: 'PATCH' }),
  registerDevice: (token: string, platform: 'ios' | 'android' | 'web') =>
    apiRequest('/notifications/devices', { method: 'POST', body: { token, platform } }),
};
