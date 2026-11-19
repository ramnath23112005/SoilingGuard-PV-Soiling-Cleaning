/**
 * Local active-workout draft: mirrors the server session so the UI can stay
 * responsive and survive app backgrounding / reloads (persisted per session id
 * in memory + AsyncStorage snapshot).
 */
import { create } from 'zustand';
import type { WorkoutSession } from '../types';

interface WorkoutStore {
  session: WorkoutSession | null;
  elapsedSeconds: number;
  startedTick: number | null;
  setSession: (session: WorkoutSession | null) => void;
  updateSession: (session: WorkoutSession) => void;
  startTicking: () => void;
  stopTicking: () => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  session: null,
  elapsedSeconds: 0,
  startedTick: null,

  setSession: (session) =>
    set({
      session,
      startedTick: session ? Date.now() : null,
      elapsedSeconds: session ? Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000)) : 0,
    }),

  updateSession: (session) => set({ session }),

  startTicking: () => set({ startedTick: Date.now() }),

  stopTicking: () => set({ startedTick: null }),

  reset: () => set({ session: null, elapsedSeconds: 0, startedTick: null }),
}));

export function currentElapsed(session: WorkoutSession | null, fallback: number): number {
  if (!session) return fallback;
  return Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000));
}
