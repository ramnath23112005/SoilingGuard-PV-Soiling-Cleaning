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

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

export interface DashboardStats {
  users: number;
  activeUsers: number;
  exercises: number;
  programs: number;
  sessions: number;
  completedSessions: number;
  totalVolumeKg: number;
  avgSessionMinutes: number;
  recentUsers: PublicUser[];
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
}

export interface ProgramExerciseRef {
  exerciseId: string | { _id: string; name: string; targetMuscle?: string; equipment?: string };
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
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
