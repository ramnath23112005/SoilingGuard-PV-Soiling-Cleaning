export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
  'full body',
] as const;

export const EQUIPMENT = [
  'bodyweight',
  'dumbbells',
  'barbell',
  'resistance bands',
  'cable machine',
  'kettlebell',
  'gym machines',
] as const;

export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'] as const;

export const PROGRAM_CATEGORIES = [
  'beginner workouts',
  'muscle building',
  'weight loss',
  'strength training',
  'fat burning',
  'full body',
  'home workouts',
  'gym workouts',
  'upper body',
  'lower body',
  'core training',
] as const;

export const FITNESS_GOALS = [
  'weight loss',
  'muscle building',
  'strength improvement',
  'general fitness',
  'endurance',
] as const;

export const WORKOUT_PREFERENCES = ['home workouts', 'gym workouts', 'bodyweight exercises', 'equipment-based workouts'] as const;

export const GOAL_TYPES = [
  'workoutsCount',
  'frequency',
  'targetWeight',
  'strengthMetric',
  'programCompletion',
  'streak',
] as const;

export const PR_TYPES = ['maxWeight', 'maxReps', 'bestVolume', 'longestWorkout', 'longestStreak'] as const;

export const REST_PRESETS = [30, 45, 60, 90, 120] as const;

export function kcalForSession(durationMin: number, weightKg: number): number {
  // MET-based estimate (walking≈3.5 … vigorous lifting≈6.0). Always flagged estimated.
  const met = 5.5;
  return Math.round((met * 3.5 * weightKg) / 200 * durationMin);
}
