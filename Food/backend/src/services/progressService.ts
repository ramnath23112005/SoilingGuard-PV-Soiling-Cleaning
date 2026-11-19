import { FitnessGoal, IFitnessGoal } from '../models/FitnessGoal';
import { WorkoutSession } from '../models/WorkoutSession';
import { ProgressRecord } from '../models/ProgressRecord';
import { PersonalRecord } from '../models/PersonalRecord';
import { FitnessProfile } from '../models/FitnessProfile';
import { ApiError } from '../utils/ApiError';
import { parsePagination, buildMeta } from '../utils/pagination';
import { CreateGoalInput, UpdateGoalSchemaInput, MeasurementInput } from '../validators/profile';

const DAY = 24 * 60 * 60 * 1000;

function rangeFromDays(days: number): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date(to.getTime() - days * DAY);
  return { from, to };
}

/* --------------------------------- Goals --------------------------------- */

export async function listGoals(userId: string, status?: string) {
  const filter: Record<string, unknown> = { userId };
  if (status) filter.status = status;
  const goals = await FitnessGoal.find(filter).sort({ createdAt: -1 }).lean();
  return goals.map((g) => ({
    ...g,
    progressPercent: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
  }));
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  const goal = await FitnessGoal.create({
    userId,
    title: input.title,
    description: input.description,
    goalType: input.goalType,
    targetValue: input.targetValue,
    unit: input.unit ?? defaultUnit(input.goalType),
    startDate: input.startDate ?? new Date(),
    targetDate: input.targetDate,
    currentValue: 0,
  });
  return goal;
}

function defaultUnit(goalType: string): string {
  switch (goalType) {
    case 'workoutsCount':
      return 'workouts';
    case 'frequency':
      return 'days/week';
    case 'targetWeight':
      return 'kg';
    case 'strengthMetric':
      return 'kg';
    case 'streak':
      return 'days';
    default:
      return 'x';
  }
}

export async function updateGoal(userId: string, id: string, input: UpdateGoalSchemaInput) {
  const goal = await FitnessGoal.findOneAndUpdate(
    { _id: id, userId },
    {
      $set: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.targetValue !== undefined ? { targetValue: input.targetValue } : {}),
        ...(input.currentValue !== undefined ? { currentValue: input.currentValue } : {}),
        ...(input.unit !== undefined ? { unit: input.unit } : {}),
        ...(input.targetDate !== undefined ? { targetDate: input.targetDate } : {}),
        ...(input.status !== undefined
          ? { status: input.status, ...(input.status === 'completed' ? { completedAt: new Date() } : {}) }
          : {}),
      },
    },
    { new: true, runValidators: true }
  );
  if (!goal) throw ApiError.notFound('Goal not found');
  return goal;
}

export async function deleteGoal(userId: string, id: string) {
  const goal = await FitnessGoal.findOneAndDelete({ _id: id, userId });
  if (!goal) throw ApiError.notFound('Goal not found');
  return { id, deleted: true };
}

/* ------------------------------- Progress -------------------------------- */

export async function overview(userId: string, days = 30) {
  const { from, to } = rangeFromDays(days);
  const [profile, sessions, weights, prs, activeGoals, totalSessions] = await Promise.all([
    FitnessProfile.findOne({ userId }),
    WorkoutSession.find({ userId, status: 'completed', startedAt: { $gte: from, $lte: to } }).lean(),
    ProgressRecord.find({ userId, type: 'weight', measuredAt: { $gte: from, $lte: to } })
      .sort({ measuredAt: 1 })
      .lean(),
    PersonalRecord.find({ userId }).sort({ achievedAt: -1 }).limit(20).lean(),
    FitnessGoal.find({ userId, status: 'active' }).lean(),
    WorkoutSession.countDocuments({ userId, status: 'completed' }),
  ]);

  const totalDuration = sessions.reduce((a: number, s: { durationSeconds?: number; totalVolumeKg?: number; totalSets?: number; caloriesBurned?: number }) => a + (s.durationSeconds ?? 0), 0);
  const totalVolume = sessions.reduce((a: number, s: { durationSeconds?: number; totalVolumeKg?: number; totalSets?: number; caloriesBurned?: number }) => a + (s.totalVolumeKg ?? 0), 0);
  const totalSets = sessions.reduce((a: number, s: { durationSeconds?: number; totalVolumeKg?: number; totalSets?: number; caloriesBurned?: number }) => a + (s.totalSets ?? 0), 0);
  const totalCalories = sessions.reduce((a: number, s: { durationSeconds?: number; totalVolumeKg?: number; totalSets?: number; caloriesBurned?: number }) => a + (s.caloriesBurned ?? 0), 0);

  // weekly frequency (last 7 days) + streak
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const weeklyCount = await WorkoutSession.countDocuments({
    userId,
    status: 'completed',
    startedAt: { $gte: weekStart },
  });

  const streak = await computeStreak(userId);
  const latestWeight = weights.length ? weights[weights.length - 1] : null;
  const heightCm = profile?.heightCm;
  const weightValue = latestWeight?.value ?? profile?.weightKg ?? null;
  const bmi = weightValue && heightCm ? Math.round((weightValue / Math.pow(heightCm / 100, 2)) * 10) / 10 : null;

  return {
    rangeDays: days,
    workouts: {
      count: sessions.length,
      totalCount: totalSessions,
      durationSeconds: totalDuration,
      durationMinutes: Math.round(totalDuration / 60),
      volumeKg: Math.round(totalVolume),
      sets: totalSets,
      caloriesBurned: totalCalories,
      caloriesEstimated: true,
      weeklyCount,
      weeklyTarget: profile?.daysPerWeek ?? 3,
    },
    body: {
      latestWeight,
      latestWeightValue: weightValue,
      weightSource: latestWeight ? latestWeight.source : profile?.weightKg ? 'profile' : null,
      heightCm: heightCm ?? null,
      bmi,
      bmiNote: 'BMI is a rough indicator only, not a medical diagnosis.',
      weightSeries: weights.map((w: { measuredAt: Date; value: number; source: string }) => ({ date: w.measuredAt, value: w.value, source: w.source })),
    },
    streak,
    personalRecords: prs,
    activeGoals: activeGoals.map((g: { targetValue: number; currentValue: number }) => ({
      ...g,
      progressPercent: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
    })),
    profileSummary: profile
      ? {
          experienceLevel: profile.experienceLevel,
          goals: profile.goals,
          daysPerWeek: profile.daysPerWeek,
          sessionMinutes: profile.sessionMinutes,
        }
      : null,
  };
}

async function computeStreak(userId: string): Promise<number> {
  const sessions = await WorkoutSession.find({ userId, status: 'completed', startedAt: { $gte: new Date(Date.now() - 365 * DAY) } })
    .sort({ startedAt: -1 })
    .select('startedAt')
    .lean();
  if (!sessions.length) return 0;
  const days = Array.from(
    new Set(sessions.map((s) => new Date(s.startedAt).toISOString().slice(0, 10)))
  ).sort();
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const key = (d: Date) => d.toISOString().slice(0, 10);
  if (!set.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // allow streak to survive until end of today
    if (!set.has(key(cursor))) return 0;
  }
  while (set.has(key(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function weightHistory(userId: string, days = 30) {
  const { from, to } = rangeFromDays(days);
  const items = await ProgressRecord.find({ userId, type: 'weight', measuredAt: { $gte: from, $lte: to } })
    .sort({ measuredAt: 1 })
    .lean();
  return items;
}

export async function recordWeight(userId: string, input: MeasurementInput) {
  const record = await ProgressRecord.create({
    userId,
    type: 'weight',
    value: input.value,
    unit: input.unit ?? 'kg',
    measuredAt: input.measuredAt ?? new Date(),
    notes: input.notes,
    source: 'manual',
  });
  await FitnessProfile.updateOne({ userId }, { $set: { weightKg: input.value } });
  return record;
}

export async function measurements(userId: string, days = 365, label?: string) {
  const { from, to } = rangeFromDays(days);
  const filter: Record<string, unknown> = { userId, measuredAt: { $gte: from, $lte: to } };
  if (label) filter.label = label;
  else filter.type = 'weight';
  return ProgressRecord.find(filter).sort({ measuredAt: 1 }).lean();
}

export async function recordMeasurement(userId: string, input: MeasurementInput) {
  if (input.type === 'weight') {
    const rec = await recordWeight(userId, input);
    return rec;
  }
  if (!input.label) throw ApiError.badRequest('label is required for measurements (e.g. chest, waist, arms)');
  return ProgressRecord.create({
    userId,
    type: 'measurement',
    value: input.value,
    unit: input.unit ?? 'cm',
    label: input.label,
    measuredAt: input.measuredAt ?? new Date(),
    notes: input.notes,
    source: 'manual',
  });
}

export async function records(userId: string) {
  const prs = await PersonalRecord.find({ userId }).sort({ achievedAt: -1 }).lean();
  const grouped: Record<string, unknown[]> = {};
  for (const pr of prs) {
    grouped[pr.recordType] = grouped[pr.recordType] ?? [];
    grouped[pr.recordType].push(pr);
  }
  const longestStreak = await computeStreak(userId);
  const longestWorkout = await WorkoutSession.findOne({ userId, status: 'completed' })
    .sort({ durationSeconds: -1 })
    .select('title durationSeconds startedAt')
    .lean();
  return {
    records: prs,
    grouped,
    lifetime: {
      longestStreakDays: longestStreak,
      longestWorkoutSeconds: longestWorkout?.durationSeconds ?? 0,
      longestWorkoutTitle: longestWorkout?.title ?? null,
    },
  };
}

/** Chart-ready series: workout frequency by day for the given range. */
export async function activitySeries(userId: string, days = 30) {
  const { from, to } = rangeFromDays(days);
  const sessions = await WorkoutSession.find({
    userId,
    status: 'completed',
    startedAt: { $gte: from, $lte: to },
  })
    .select('startedAt durationSeconds totalVolumeKg caloriesBurned')
    .lean();
  const buckets = new Map<string, { date: string; workouts: number; minutes: number; volumeKg: number; calories: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(from.getTime() + i * DAY);
    buckets.set(d.toISOString().slice(0, 10), {
      date: d.toISOString().slice(0, 10),
      workouts: 0,
      minutes: 0,
      volumeKg: 0,
      calories: 0,
    });
  }
  for (const s of sessions) {
    const key = new Date(s.startedAt).toISOString().slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    b.workouts += 1;
    b.minutes += Math.round(s.durationSeconds / 60);
    b.volumeKg += Math.round(s.totalVolumeKg);
    b.calories += s.caloriesBurned;
  }
  return Array.from(buckets.values());
}
