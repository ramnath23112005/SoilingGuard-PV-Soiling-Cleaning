/**
 * FitTrack database seeder.
 * Creates: 20 exercises, 10 programs, demo + admin accounts,
 * sample goals, progress records and completed workout sessions.
 *
 * Run: npm run seed
 * Sample content is clearly labeled as seeded demo data.
 */
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { FitnessProfile } from '../models/FitnessProfile';
import { Exercise } from '../models/Exercise';
import { WorkoutProgram } from '../models/WorkoutProgram';
import { WorkoutSession } from '../models/WorkoutSession';
import { FitnessGoal } from '../models/FitnessGoal';
import { ProgressRecord } from '../models/ProgressRecord';
import { PersonalRecord } from '../models/PersonalRecord';
import { Notification } from '../models/Notification';
import { Favorite } from '../models/Favorite';
import { seedExercises, slugify } from './exerciseData';
import { seedPrograms } from './programData';
import { kcalForSession } from '../utils/constants';

const DAY = 24 * 60 * 60 * 1000;

async function seed() {
  await connectDB();
  console.log('[seed] connected');

  const wipe = process.argv.includes('--fresh');
  if (wipe) {
    console.log('[seed] --fresh: clearing collections');
    await Promise.all([
      User.deleteMany({}),
      FitnessProfile.deleteMany({}),
      Exercise.deleteMany({}),
      WorkoutProgram.deleteMany({}),
      WorkoutSession.deleteMany({}),
      FitnessGoal.deleteMany({}),
      ProgressRecord.deleteMany({}),
      PersonalRecord.deleteMany({}),
      Notification.deleteMany({}),
      Favorite.deleteMany({}),
    ]);
  }

  /* ------------------------------- Accounts ------------------------------- */
  const passwordHash = await bcrypt.hash('Demo123!', 12);
  const adminHash = await bcrypt.hash('Admin123!', 12);

  let demo = await User.findOne({ email: 'demo@fittrack.app' });
  if (!demo) {
    demo = await User.create({
      fullName: 'Demo Athlete',
      email: 'demo@fittrack.app',
      passwordHash,
      role: 'user',
      dateOfBirth: new Date('1996-06-15'),
      gender: 'other',
      experienceLevel: 'intermediate',
      lastLoginAt: new Date(),
    });
    console.log('[seed] created demo user');
  }

  let admin = await User.findOne({ email: 'admin@fittrack.app' });
  if (!admin) {
    admin = await User.create({
      fullName: 'FitTrack Admin',
      email: 'admin@fittrack.app',
      passwordHash: adminHash,
      role: 'admin',
      experienceLevel: 'advanced',
      lastLoginAt: new Date(),
    });
    console.log('[seed] created admin user');
  }

  const profile = await FitnessProfile.findOneAndUpdate(
    { userId: demo._id },
    {
      $set: {
        age: 29,
        heightCm: 174,
        weightKg: 76,
        experienceLevel: 'intermediate',
        goals: ['muscle building', 'strength improvement'],
        preferences: ['gym workouts', 'equipment-based workouts'],
        daysPerWeek: 4,
        sessionMinutes: 45,
        targetMuscleGroups: ['chest', 'back', 'quadriceps', 'abs'],
        onboardingCompleted: true,
      },
    },
    { upsert: true, new: true }
  );

  /* ------------------------------- Exercises ------------------------------ */
  const exerciseIds = new Map<string, string>();
  for (const ex of seedExercises) {
    let doc = await Exercise.findOne({ slug: slugify(ex.name) });
    if (!doc) {
      doc = await Exercise.create({ ...ex, slug: slugify(ex.name), isPublished: true });
    }
    exerciseIds.set(ex.name, String(doc._id));
  }
  console.log(`[seed] exercises ready: ${exerciseIds.size}`);

  /* -------------------------------- Programs ------------------------------ */
  for (const p of seedPrograms) {
    const exists = await WorkoutProgram.findOne({ slug: slugify(p.name) });
    if (exists) continue;
    const exercises = p.exercises
      .map((pe, i) => {
        const exerciseId = exerciseIds.get(pe.name);
        if (!exerciseId) {
          console.warn(`[seed] missing exercise ref: ${pe.name}`);
          return null;
        }
        return { exerciseId, order: i, sets: pe.sets, reps: pe.reps, restSeconds: pe.restSeconds };
      })
      .filter(Boolean);
    const targetMuscleGroups = Array.from(
      new Set(exercises.flatMap((e) => {
        const doc = seedExercises.find((s) => exerciseIds.get(s.name) === (e as { exerciseId: string }).exerciseId);
        return doc ? [doc.targetMuscle] : [];
      }))
    );
    await WorkoutProgram.create({
      name: p.name,
      slug: slugify(p.name),
      description: p.description,
      categories: p.categories,
      difficulty: p.difficulty,
      durationMinutes: p.durationMinutes,
      weeklyFrequency: p.weeklyFrequency,
      targetMuscleGroups: targetMuscleGroups.length ? targetMuscleGroups : p.targetMuscleGroups,
      equipment: p.equipment,
      coverImage: `https://placehold.co/600x400/1B1D22/B7F34A.png?text=${encodeURIComponent(p.name)}`,
      exercises,
      estimatedCalories: p.estimatedCalories,
      isPublished: true,
      createdBy: admin._id,
    });
  }
  console.log(`[seed] programs ready: ${await WorkoutProgram.countDocuments()}`);

  /* ---------------------------- Sample history ---------------------------- */
  const existingSessions = await WorkoutSession.countDocuments({ userId: demo._id });
  if (existingSessions === 0) {
    const programs = await WorkoutProgram.find().lean();
    const sessions = [];
    for (let i = 27; i >= 0; i -= 3) {
      const program = programs[i % programs.length];
      const start = new Date(Date.now() - i * DAY + 18 * 60 * 60 * 1000);
      const durationMin = program.durationMinutes;
      const exercises = program.exercises.slice(0, 5).map((pe, order) => {
        const doc = seedExercises.find((s) => exerciseIds.get(s.name) === String(pe.exerciseId));
        const baseWeight =
          doc?.equipment === 'bodyweight' ? 0 : 20 + ((i + order) % 4) * 5;
        const sets = Array.from({ length: pe.sets }, (_, s) => ({
          setNumber: s + 1,
          weightKg: baseWeight,
          reps: Math.max(4, pe.reps - s * 2),
          completed: true,
          completedAt: new Date(start.getTime() + (order * 3 + s) * 3 * 60 * 1000),
        }));
        const volume = sets.reduce((a, x) => a + x.weightKg * x.reps, 0);
        return {
          exerciseId: pe.exerciseId,
          order,
          nameSnapshot: doc?.name ?? 'Exercise',
          targetMuscle: doc?.targetMuscle,
          equipment: doc?.equipment,
          targetSets: pe.sets,
          targetReps: pe.reps,
          restSeconds: pe.restSeconds,
          sets,
          skipped: false,
        };
      });
      const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
      const totalReps = exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.reps, 0), 0);
      const volume = exercises.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.weightKg * s.reps, 0), 0);
      const durationSeconds = durationMin * 60 + ((i * 37) % 400);
      sessions.push({
        userId: demo._id,
        programId: program._id,
        title: program.name,
        status: 'completed' as const,
        startedAt: start,
        completedAt: new Date(start.getTime() + durationSeconds * 1000),
        durationSeconds,
        totalVolumeKg: Math.round(volume),
        totalSets,
        totalReps,
        caloriesBurned: kcalForSession(durationMin, profile.weightKg ?? 75),
        caloriesEstimated: true,
        exercises,
      });
    }
    await WorkoutSession.insertMany(sessions);
    console.log(`[seed] sample sessions: ${sessions.length}`);

    // Personal records from the sample history
    const bestByExercise = new Map<string, { weight: number; reps: number; volume: number; name: string; date: Date }>();
    for (const s of sessions) {
      for (const e of s.exercises) {
        const current = bestByExercise.get(String(e.exerciseId)) ?? {
          weight: 0,
          reps: 0,
          volume: 0,
          name: e.nameSnapshot,
          date: s.startedAt,
        };
        for (const set of e.sets) {
          current.weight = Math.max(current.weight, set.weightKg);
          current.reps = Math.max(current.reps, set.reps);
          current.volume = Math.max(
            current.volume,
            e.sets.reduce((a, x) => a + x.weightKg * x.reps, 0)
          );
        }
        bestByExercise.set(String(e.exerciseId), current);
      }
    }
    const prs = Array.from(bestByExercise.entries())
      .filter(([, v]) => v.weight > 0)
      .flatMap(([exId, v]) => [
        {
          userId: demo._id,
          exerciseId: exId,
          exerciseNameSnapshot: v.name,
          recordType: 'maxWeight',
          value: v.weight,
          unit: 'kg',
          achievedAt: v.date,
          confirmed: true,
        },
        {
          userId: demo._id,
          exerciseId: exId,
          exerciseNameSnapshot: v.name,
          recordType: 'bestVolume',
          value: Math.round(v.volume),
          unit: 'kg',
          achievedAt: v.date,
          confirmed: true,
        },
      ]);
    await PersonalRecord.insertMany(prs);
    console.log(`[seed] personal records: ${prs.length}`);
  }

  /* --------------------------------- Goals -------------------------------- */
  if ((await FitnessGoal.countDocuments({ userId: demo._id })) === 0) {
    await FitnessGoal.insertMany([
      {
        userId: demo._id,
        title: 'Complete 20 workouts',
        description: 'Finish 20 sessions this quarter to build consistency.',
        goalType: 'workoutsCount',
        targetValue: 20,
        currentValue: 9,
        unit: 'workouts',
        startDate: new Date(Date.now() - 30 * DAY),
        targetDate: new Date(Date.now() + 60 * DAY),
        status: 'active',
      },
      {
        userId: demo._id,
        title: 'Exercise 4 days per week',
        description: 'Hit the gym on four separate days every week.',
        goalType: 'frequency',
        targetValue: 4,
        currentValue: 3,
        unit: 'days/week',
        startDate: new Date(Date.now() - 14 * DAY),
        status: 'active',
      },
      {
        userId: demo._id,
        title: 'Reach 74 kg body weight',
        description: 'Gradual cut while keeping training performance up.',
        goalType: 'targetWeight',
        targetValue: 74,
        currentValue: 76,
        unit: 'kg',
        startDate: new Date(Date.now() - 30 * DAY),
        targetDate: new Date(Date.now() + 90 * DAY),
        status: 'active',
      },
      {
        userId: demo._id,
        title: 'Bench press 60 kg',
        description: 'Add load to the barbell bench press.',
        goalType: 'strengthMetric',
        targetValue: 60,
        currentValue: 45,
        unit: 'kg',
        startDate: new Date(Date.now() - 45 * DAY),
        status: 'active',
      },
    ]);
    console.log('[seed] goals created');
  }

  /* ---------------------------- Progress records -------------------------- */
  if ((await ProgressRecord.countDocuments({ userId: demo._id })) === 0) {
    const weightSeries = [];
    let weight = 79.4;
    for (let i = 56; i >= 0; i -= 7) {
      weight = Math.round((weight - 0.5) * 10) / 10;
      weightSeries.push({
        userId: demo._id,
        type: 'weight' as const,
        value: weight,
        unit: 'kg',
        measuredAt: new Date(Date.now() - i * DAY),
        source: 'manual' as const,
        notes: 'Weekly weigh-in (seeded demo data)',
      });
    }
    await ProgressRecord.insertMany(weightSeries);
    await ProgressRecord.insertMany([
      { userId: demo._id, type: 'measurement', value: 102, unit: 'cm', label: 'chest', measuredAt: new Date(Date.now() - 28 * DAY) },
      { userId: demo._id, type: 'measurement', value: 104, unit: 'cm', label: 'chest', measuredAt: new Date() },
      { userId: demo._id, type: 'measurement', value: 84, unit: 'cm', label: 'waist', measuredAt: new Date(Date.now() - 28 * DAY) },
      { userId: demo._id, type: 'measurement', value: 82, unit: 'cm', label: 'waist', measuredAt: new Date() },
    ]);
    console.log('[seed] progress records created');
  }

  /* ----------------------------- Notifications ---------------------------- */
  if ((await Notification.countDocuments({ userId: demo._id })) === 0) {
    await Notification.insertMany([
      {
        userId: demo._id,
        type: 'weekly_summary',
        title: 'Your weekly summary',
        body: 'You completed 3 workouts and lifted 12,400 kg of volume. Keep the streak alive!',
        createdAt: new Date(Date.now() - 2 * DAY),
      },
      {
        userId: demo._id,
        type: 'workout_reminder',
        title: 'Workout reminder',
        body: 'Your Upper Body Power session is scheduled for today at 6:00 PM.',
        createdAt: new Date(Date.now() - 1 * DAY),
      },
    ]);
  }

  /* -------------------------------- Favorites ----------------------------- */
  const firstProgram = await WorkoutProgram.findOne().lean();
  if (firstProgram && !(await Favorite.findOne({ userId: demo._id }))) {
    await Favorite.create({ userId: demo._id, itemType: 'program', itemId: firstProgram._id });
    await WorkoutProgram.updateOne({ _id: firstProgram._id }, { $inc: { favoritesCount: 1 } });
  }

  console.log('[seed] done.');
  console.log('[seed] demo account:  demo@fittrack.app / Demo123!');
  console.log('[seed] admin account: admin@fittrack.app / Admin123!');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
