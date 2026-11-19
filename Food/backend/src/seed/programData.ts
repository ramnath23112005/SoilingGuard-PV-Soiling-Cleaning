/* Sample workout programs - exercise refs are resolved by name at seed time. */

export interface SeedProgram {
  name: string;
  description: string;
  categories: string[];
  difficulty: string;
  durationMinutes: number;
  weeklyFrequency: number;
  targetMuscleGroups: string[];
  equipment: string[];
  estimatedCalories: number;
  exercises: Array<{ name: string; sets: number; reps: number; restSeconds: number }>;
}

export const seedPrograms: SeedProgram[] = [
  {
    name: 'Beginner Full Body',
    description:
      'A complete first program for newcomers. Five simple movements that train the whole body with minimal equipment and clear progression.',
    categories: ['beginner workouts', 'full body', 'home workouts'],
    difficulty: 'beginner',
    durationMinutes: 30,
    weeklyFrequency: 3,
    targetMuscleGroups: ['full body', 'chest', 'quadriceps', 'abs'],
    equipment: ['bodyweight'],
    estimatedCalories: 220,
    exercises: [
      { name: 'Bodyweight Squat', sets: 3, reps: 12, restSeconds: 45 },
      { name: 'Push-up', sets: 3, reps: 10, restSeconds: 45 },
      { name: 'Plank', sets: 3, reps: 40, restSeconds: 30 },
      { name: 'Dumbbell Lunge', sets: 3, reps: 10, restSeconds: 60 },
      { name: 'Jumping Jack', sets: 3, reps: 30, restSeconds: 30 },
    ],
  },
  {
    name: 'Muscle Building Split',
    description:
      'Hypertrophy-focused compound lifting with progressive overload. Bench, press, pulldown, squat and curls across the week.',
    categories: ['muscle building', 'gym workouts', 'strength training'],
    difficulty: 'intermediate',
    durationMinutes: 60,
    weeklyFrequency: 4,
    targetMuscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'quadriceps'],
    equipment: ['barbell', 'dumbbells', 'gym machines'],
    estimatedCalories: 420,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, restSeconds: 90 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restSeconds: 75 },
      { name: 'Lat Pulldown', sets: 3, reps: 10, restSeconds: 75 },
      { name: 'Barbell Squat', sets: 4, reps: 6, restSeconds: 120 },
      { name: 'Dumbbell Bicep Curl', sets: 3, reps: 12, restSeconds: 45 },
    ],
  },
  {
    name: 'Home Fitness Blast',
    description:
      'No equipment needed. A fast, sweaty bodyweight circuit you can do in a living room to stay conditioned.',
    categories: ['home workouts', 'fat burning', 'full body'],
    difficulty: 'beginner',
    durationMinutes: 30,
    weeklyFrequency: 4,
    targetMuscleGroups: ['full body', 'abs', 'glutes', 'chest'],
    equipment: ['bodyweight'],
    estimatedCalories: 300,
    exercises: [
      { name: 'Push-up', sets: 3, reps: 12, restSeconds: 30 },
      { name: 'Mountain Climber', sets: 3, reps: 24, restSeconds: 30 },
      { name: 'Bodyweight Squat', sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Glute Bridge', sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Plank', sets: 3, reps: 45, restSeconds: 30 },
    ],
  },
  {
    name: 'Upper Body Power',
    description: 'Push-pull strength session for chest, back, shoulders and arms with barbell and dumbbell work.',
    categories: ['upper body', 'strength training', 'gym workouts'],
    difficulty: 'intermediate',
    durationMinutes: 45,
    weeklyFrequency: 3,
    targetMuscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    equipment: ['barbell', 'dumbbells', 'cable machine'],
    estimatedCalories: 340,
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, restSeconds: 90 },
      { name: 'Dumbbell Row', sets: 3, reps: 10, restSeconds: 75 },
      { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, restSeconds: 75 },
      { name: 'Tricep Rope Pushdown', sets: 3, reps: 12, restSeconds: 45 },
      { name: 'Dumbbell Bicep Curl', sets: 3, reps: 12, restSeconds: 45 },
    ],
  },
  {
    name: 'Lower Body Strength',
    description: 'Leg day builder pairing heavy squats and deadlifts with targeted glute and calf accessories.',
    categories: ['lower body', 'strength training', 'gym workouts'],
    difficulty: 'advanced',
    durationMinutes: 60,
    weeklyFrequency: 2,
    targetMuscleGroups: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    equipment: ['barbell', 'dumbbells', 'gym machines'],
    estimatedCalories: 450,
    exercises: [
      { name: 'Barbell Squat', sets: 4, reps: 6, restSeconds: 120 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 90 },
      { name: 'Dumbbell Lunge', sets: 3, reps: 12, restSeconds: 60 },
      { name: 'Glute Bridge', sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Calf Raise', sets: 4, reps: 15, restSeconds: 30 },
    ],
  },
  {
    name: 'Core Crusher',
    description: 'Dedicated core circuit for stability and definition. Plank variations plus dynamic movement.',
    categories: ['core training', 'home workouts', 'fat burning'],
    difficulty: 'intermediate',
    durationMinutes: 15,
    weeklyFrequency: 4,
    targetMuscleGroups: ['abs'],
    equipment: ['bodyweight'],
    estimatedCalories: 150,
    exercises: [
      { name: 'Plank', sets: 3, reps: 60, restSeconds: 30 },
      { name: 'Mountain Climber', sets: 3, reps: 30, restSeconds: 30 },
      { name: 'Forearm Plank Hip Dip', sets: 3, reps: 20, restSeconds: 30 },
      { name: 'Glute Bridge', sets: 3, reps: 15, restSeconds: 30 },
    ],
  },
  {
    name: 'Fat Burn Express',
    description: 'High-rep, short-rest circuit designed to keep heart rate elevated and maximize calorie burn.',
    categories: ['weight loss', 'fat burning', 'full body'],
    difficulty: 'beginner',
    durationMinutes: 30,
    weeklyFrequency: 5,
    targetMuscleGroups: ['full body'],
    equipment: ['bodyweight', 'dumbbells'],
    estimatedCalories: 380,
    exercises: [
      { name: 'Jumping Jack', sets: 3, reps: 40, restSeconds: 30 },
      { name: 'Bodyweight Squat', sets: 3, reps: 20, restSeconds: 30 },
      { name: 'Mountain Climber', sets: 3, reps: 30, restSeconds: 30 },
      { name: 'Push-up', sets: 3, reps: 12, restSeconds: 30 },
      { name: 'Plank', sets: 3, reps: 45, restSeconds: 30 },
    ],
  },
  {
    name: 'Pull Day Focus',
    description: 'Back and biceps session built around vertical and horizontal pulling for width and detail.',
    categories: ['upper body', 'muscle building', 'gym workouts'],
    difficulty: 'intermediate',
    durationMinutes: 45,
    weeklyFrequency: 2,
    targetMuscleGroups: ['back', 'biceps', 'forearms'],
    equipment: ['barbell', 'dumbbells', 'gym machines'],
    estimatedCalories: 330,
    exercises: [
      { name: 'Deadlift', sets: 3, reps: 5, restSeconds: 120 },
      { name: 'Lat Pulldown', sets: 4, reps: 10, restSeconds: 75 },
      { name: 'Dumbbell Row', sets: 3, reps: 10, restSeconds: 75 },
      { name: 'Pull-up', sets: 3, reps: 6, restSeconds: 90 },
      { name: 'Dumbbell Bicep Curl', sets: 3, reps: 12, restSeconds: 45 },
    ],
  },
  {
    name: 'Shoulder & Arms Sculpt',
    description: 'Isolation-heavy session for deltoids, biceps and triceps to round out the upper body.',
    categories: ['muscle building', 'upper body', 'gym workouts'],
    difficulty: 'intermediate',
    durationMinutes: 45,
    weeklyFrequency: 3,
    targetMuscleGroups: ['shoulders', 'biceps', 'triceps'],
    equipment: ['dumbbells', 'cable machine'],
    estimatedCalories: 280,
    exercises: [
      { name: 'Dumbbell Shoulder Press', sets: 4, reps: 10, restSeconds: 75 },
      { name: 'Lateral Raise', sets: 3, reps: 15, restSeconds: 45 },
      { name: 'Tricep Rope Pushdown', sets: 3, reps: 12, restSeconds: 45 },
      { name: 'Dumbbell Bicep Curl', sets: 3, reps: 12, restSeconds: 45 },
    ],
  },
  {
    name: 'Strength Foundations',
    description: 'Barbell fundamentals for building raw strength across the three big lifts with conservative volume.',
    categories: ['strength training', 'beginner workouts', 'gym workouts'],
    difficulty: 'intermediate',
    durationMinutes: 60,
    weeklyFrequency: 3,
    targetMuscleGroups: ['chest', 'back', 'quadriceps', 'hamstrings'],
    equipment: ['barbell'],
    estimatedCalories: 400,
    exercises: [
      { name: 'Barbell Squat', sets: 5, reps: 5, restSeconds: 120 },
      { name: 'Barbell Bench Press', sets: 5, reps: 5, restSeconds: 120 },
      { name: 'Deadlift', sets: 3, reps: 5, restSeconds: 150 },
      { name: 'Plank', sets: 3, reps: 45, restSeconds: 45 },
    ],
  },
];
