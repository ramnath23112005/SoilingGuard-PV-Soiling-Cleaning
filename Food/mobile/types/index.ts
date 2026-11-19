/* Shared API types mirroring the backend responses. */

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  unread?: number;
}

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: 'user' | 'admin';
  dateOfBirth?: string | null;
  gender?: string | null;
  experienceLevel?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface FitnessProfileDoc {
  _id?: string;
  userId?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  experienceLevel?: string;
  goals: string[];
  preferences: string[];
  daysPerWeek?: number;
  sessionMinutes?: number;
  targetMuscleGroups: string[];
  onboardingCompleted: boolean;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface Exercise {
  _id: string;
  name: string;
  slug: string;
  description: string;
  imageUrls: string[];
  videoUrl?: string;
  targetMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  difficulty: string;
  instructions: string[];
  commonMistakes: string[];
  safetyTips: string[];
  defaultSets: number;
  defaultReps: number;
  caloriesPerMinute: number;
  related?: Exercise[];
}

export interface ProgramExerciseRef {
  exerciseId:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
        targetMuscle: string;
        equipment: string;
        difficulty: string;
        imageUrls: string[];
        defaultSets: number;
        defaultReps: number;
      };
  order: number;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface WorkoutProgram {
  _id: string;
  name: string;
  slug: string;
  description: string;
  categories: string[];
  difficulty: string;
  durationMinutes: number;
  weeklyFrequency: number;
  targetMuscleGroups: string[];
  equipment: string[];
  coverImage?: string;
  exercises: ProgramExerciseRef[];
  estimatedCalories: number;
  favoritesCount: number;
  favoriteId?: string | null;
}

export interface ExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  completedAt?: string;
  isWarmup?: boolean;
  isPR?: boolean;
}

export interface SessionExercise {
  exerciseId: string;
  order: number;
  nameSnapshot: string;
  targetMuscle?: string;
  equipment?: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  sets: ExerciseSet[];
  notes?: string;
  skipped?: boolean;
  previousBest?: { weightKg: number; reps: number } | null;
}

export interface WorkoutSession {
  _id: string;
  userId?: string;
  programId?: string;
  title: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  caloriesBurned: number;
  caloriesEstimated: boolean;
  personalRecords: string[];
  exercises: SessionExercise[];
}

export interface WorkoutSummary {
  id: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  durationMinutes: number;
  exercisesCompleted: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  caloriesBurned: number;
  caloriesEstimated: boolean;
  personalRecordIds: string[];
}

export interface FitnessGoal {
  _id: string;
  title: string;
  description?: string;
  goalType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string;
  targetDate?: string;
  status: 'active' | 'completed' | 'failed';
  completedAt?: string;
  progressPercent: number;
}

export interface ProgressRecord {
  _id: string;
  type: 'weight' | 'measurement';
  value: number;
  unit: string;
  label?: string;
  measuredAt: string;
  notes?: string;
  source: 'manual' | 'derived';
}

export interface PersonalRecord {
  _id: string;
  exerciseId?: string;
  exerciseNameSnapshot: string;
  recordType: string;
  value: number;
  previousValue?: number | null;
  unit: string;
  achievedAt: string;
  confirmed: boolean;
}

export interface ProgressOverview {
  rangeDays: number;
  workouts: {
    count: number;
    totalCount: number;
    durationSeconds: number;
    durationMinutes: number;
    volumeKg: number;
    sets: number;
    caloriesBurned: number;
    caloriesEstimated: boolean;
    weeklyCount: number;
    weeklyTarget: number;
  };
  body: {
    latestWeight: ProgressRecord | null;
    latestWeightValue: number | null;
    weightSource: string | null;
    heightCm: number | null;
    bmi: number | null;
    bmiNote: string;
    weightSeries: Array<{ date: string; value: number; source: string }>;
  };
  streak: number;
  personalRecords: PersonalRecord[];
  activeGoals: Array<FitnessGoal & { progressPercent: number }>;
  profileSummary: {
    experienceLevel?: string;
    goals: string[];
    daysPerWeek?: number;
    sessionMinutes?: number;
  } | null;
}

export interface ActivityBucket {
  date: string;
  workouts: number;
  minutes: number;
  volumeKg: number;
  calories: number;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
}

export interface StartWorkoutResponse {
  session: WorkoutSession;
  resumed: boolean;
}

export interface CompleteWorkoutResponse {
  session: WorkoutSession;
  summary: WorkoutSummary;
  personalRecords: PersonalRecord[];
}
