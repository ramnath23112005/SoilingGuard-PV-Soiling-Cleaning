import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import {
  catalogApi,
  workoutApi,
  progressApi,
  goalsApi,
  favoritesApi,
  notificationsApi,
  CatalogQuery,
} from '../services/endpoints';
import type {
  Exercise,
  WorkoutProgram,
  WorkoutSession,
  ProgressOverview,
  ProgressRecord,
  PersonalRecord,
  FitnessGoal,
  NotificationItem,
  PageMeta,
  ActivityBucket,
} from '../types';

export function useExercises(query: CatalogQuery, opts?: Partial<UseQueryOptions<{ items: Exercise[]; meta: PageMeta }>>) {
  return useQuery({
    queryKey: ['exercises', query],
    queryFn: () => catalogApi.exercises(query),
    ...opts,
  });
}

export function useExercise(id: string, enabled = true) {
  return useQuery({
    queryKey: ['exercise', id],
    queryFn: () => catalogApi.exercise(id),
    enabled: enabled && !!id,
  });
}

export function usePrograms(query: CatalogQuery, opts?: Partial<UseQueryOptions<{ items: WorkoutProgram[]; meta: PageMeta }>>) {
  return useQuery({
    queryKey: ['programs', query],
    queryFn: () => catalogApi.programs(query),
    ...opts,
  });
}

export function useProgram(id: string, enabled = true) {
  return useQuery({
    queryKey: ['program', id],
    queryFn: () => catalogApi.program(id),
    enabled: enabled && !!id,
  });
}

export function useActiveWorkout(enabled = true) {
  return useQuery({
    queryKey: ['workout', 'active'],
    queryFn: () => workoutApi.active(),
    enabled,
    staleTime: 5_000,
  });
}

export function useSession(id: string, enabled = true) {
  return useQuery({
    queryKey: ['workout', 'session', id],
    queryFn: () => workoutApi.session(id),
    enabled: enabled && !!id,
  });
}

export function useWorkoutHistory(query: { page?: number; limit?: number; muscle?: string; status?: string } = {}) {
  return useQuery({
    queryKey: ['workout', 'history', query],
    queryFn: () => workoutApi.history(query),
    placeholderData: (prev) => prev,
  });
}

export function useProgressOverview(days = 30) {
  return useQuery({
    queryKey: ['progress', 'overview', days],
    queryFn: () => progressApi.overview(days),
  });
}

export function useWeightHistory(days = 30) {
  return useQuery({
    queryKey: ['progress', 'weight', days],
    queryFn: () => progressApi.weight(days),
  });
}

export function useActivitySeries(days = 30) {
  return useQuery({
    queryKey: ['progress', 'activity', days],
    queryFn: () => progressApi.activity(days),
  });
}

export function usePersonalRecords() {
  return useQuery({
    queryKey: ['progress', 'records'],
    queryFn: () => progressApi.records(),
  });
}

export function useMeasurements(days = 365, label?: string) {
  return useQuery({
    queryKey: ['progress', 'measurements', days, label ?? 'all'],
    queryFn: () => progressApi.measurements(days, label),
  });
}

export function useGoals(status?: string) {
  return useQuery({
    queryKey: ['goals', status ?? 'all'],
    queryFn: () => goalsApi.list(status),
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(),
  });
}

export function useNotifications(page = 1) {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.list(page),
    placeholderData: (prev) => prev,
  });
}

/* ------------------------------ Mutations -------------------------------- */

export function useStartWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workoutApi.start,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['workout', 'active'] });
    },
  });
}

export function useCompleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, durationSeconds }: { sessionId: string; durationSeconds?: number }) =>
      workoutApi.complete(sessionId, durationSeconds),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['workout'] });
      void qc.invalidateQueries({ queryKey: ['progress'] });
      void qc.invalidateQueries({ queryKey: ['goals'] });
      void qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useAbandonWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => workoutApi.abandon(sessionId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['workout'] });
      void qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useAddWeight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ value, measuredAt, notes }: { value: number; measuredAt?: string; notes?: string }) =>
      progressApi.addWeight(value, measuredAt, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useAddMeasurement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: progressApi.addMeasurement,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => goalsApi.update(id, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemType,
      itemId,
      existingFavoriteId,
    }: {
      itemType: 'program' | 'exercise';
      itemId: string;
      existingFavoriteId?: string | null;
    }) => {
      if (existingFavoriteId) return favoritesApi.remove(existingFavoriteId);
      return favoritesApi.add(itemType, itemId);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useSaveOnboarding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) => import('../services/endpoints').then((m) => m.profileApi.saveOnboarding(input)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['progress'] });
      void qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export type { WorkoutSession, ProgressOverview, ProgressRecord, PersonalRecord, FitnessGoal, NotificationItem };
