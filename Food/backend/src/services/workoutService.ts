import { WorkoutSession, ISessionExercise, IExerciseSet, IWorkoutSession } from '../models/WorkoutSession';
import { Exercise } from '../models/Exercise';
import { WorkoutProgram } from '../models/WorkoutProgram';
import { PersonalRecord } from '../models/PersonalRecord';
import { FitnessGoal } from '../models/FitnessGoal';
import { ProgressRecord } from '../models/ProgressRecord';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/ApiError';
import { parsePagination, buildMeta } from '../utils/pagination';
import { StartWorkoutInput, HistoryQuery } from '../validators/workout';
import { kcalForSession } from '../utils/constants';
import { logger } from '../utils/logger';

/** Best completed set for an exercise from the user's history. */
async function previousBest(userId: string, exerciseId: string) {
  const sessions = await WorkoutSession.find({
    userId,
    status: 'completed',
    'exercises.exerciseId': exerciseId,
  })
    .sort({ startedAt: -1 })
    .limit(10)
    .lean();
  let best: { weightKg: number; reps: number } | null = null;
  for (const s of sessions as Array<{ exercises: ISessionExercise[] }>) {
    const ex = s.exercises.find((e: ISessionExercise) => String(e.exerciseId) === exerciseId);
    if (!ex) continue;
    for (const set of ex.sets) {
      if (!set.completed) continue;
      if (!best || set.weightKg > best.weightKg || (set.weightKg === best.weightKg && set.reps > best.reps)) {
        best = { weightKg: set.weightKg, reps: set.reps };
      }
    }
  }
  return best;
}

export async function startWorkout(userId: string, input: StartWorkoutInput) {
  const active = await WorkoutSession.findOne({ userId, status: 'active' });
  if (active) {
    // Resume support: return the existing active session instead of failing.
    return { session: active, resumed: true };
  }

  let title = input.title ?? 'Quick Workout';
  let programId: string | undefined = input.programId;
  let specs = input.exercises ?? [];

  if (input.programId) {
    const program = await WorkoutProgram.findOne({ _id: input.programId, isPublished: true }).lean();
    if (!program) throw ApiError.notFound('Program not found');
    title = input.title ?? program.name;
    specs = program.exercises.map((e) => ({
      exerciseId: String(e.exerciseId),
      sets: e.sets,
      reps: e.reps,
      restSeconds: e.restSeconds,
    }));
  }

  if (!specs.length) throw ApiError.badRequest('No exercises provided for the workout');

  const exerciseDocs = await Exercise.find({ _id: { $in: specs.map((s) => s.exerciseId) } }).lean();
  const byId = new Map(exerciseDocs.map((d) => [String(d._id), d]));

  const exercises: ISessionExercise[] = [];
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    const doc = byId.get(String(spec.exerciseId));
    if (!doc) throw ApiError.badRequest(`Exercise not found: ${spec.exerciseId}`);
    const best = await previousBest(userId, String(doc._id));
    exercises.push({
      exerciseId: doc._id,
      order: i,
      nameSnapshot: doc.name,
      targetMuscle: doc.targetMuscle,
      equipment: doc.equipment,
      targetSets: spec.sets,
      targetReps: spec.reps,
      restSeconds: spec.restSeconds ?? 60,
      sets: Array.from({ length: spec.sets }, (_, s) => ({
        setNumber: s + 1,
        weightKg: best?.weightKg ?? 0,
        reps: spec.reps,
        completed: false,
      })),
      previousBest: best,
      skipped: false,
    });
  }

  const session = await WorkoutSession.create({
    userId,
    programId,
    title,
    status: 'active',
    startedAt: new Date(),
    exercises,
  });
  logger.info('workout started', { userId, sessionId: session._id.toString() });
  return { session, resumed: false };
}

export async function getActiveWorkout(userId: string) {
  const session = await WorkoutSession.findOne({ userId, status: 'active' });
  return session;
}

export async function getSession(userId: string, sessionId: string) {
  const session = await WorkoutSession.findOne({ _id: sessionId, userId });
  if (!session) throw ApiError.notFound('Workout session not found');
  return session;
}

export async function addSet(userId: string, sessionId: string, input: { exerciseId: string; weightKg: number; reps: number; completed?: boolean; isWarmup?: boolean }) {
  const session = await getSession(userId, sessionId);
  if (session.status !== 'active') throw ApiError.badRequest('Workout is not active');
  const ex = session.exercises.find((e) => String(e.exerciseId) === input.exerciseId);
  if (!ex) throw ApiError.badRequest('Exercise is not part of this workout');
  const set: IExerciseSet = {
    setNumber: ex.sets.length + 1,
    weightKg: input.weightKg,
    reps: input.reps,
    completed: Boolean(input.completed),
    completedAt: input.completed ? new Date() : undefined,
    isWarmup: Boolean(input.isWarmup),
  };
  ex.sets.push(set);
  await session.save();
  return { session, set };
}

export async function updateSet(
  userId: string,
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  patch: { weightKg?: number; reps?: number; completed?: boolean }
) {
  const session = await getSession(userId, sessionId);
  if (session.status !== 'active') throw ApiError.badRequest('Workout is not active');
  const ex = session.exercises.find((e) => String(e.exerciseId) === exerciseId);
  if (!ex) throw ApiError.badRequest('Exercise is not part of this workout');
  const set = ex.sets.find((s) => s.setNumber === setNumber);
  if (!set) throw ApiError.notFound('Set not found');
  if (patch.weightKg !== undefined) set.weightKg = patch.weightKg;
  if (patch.reps !== undefined) set.reps = patch.reps;
  if (patch.completed !== undefined) {
    set.completed = patch.completed;
    set.completedAt = patch.completed ? new Date() : undefined;
  }
  await session.save();
  return { session, set };
}

export async function removeSet(userId: string, sessionId: string, exerciseId: string, setNumber: number) {
  const session = await getSession(userId, sessionId);
  if (session.status !== 'active') throw ApiError.badRequest('Workout is not active');
  const ex = session.exercises.find((e) => String(e.exerciseId) === exerciseId);
  if (!ex) throw ApiError.badRequest('Exercise is not part of this workout');
  if (ex.sets.length <= 1) throw ApiError.badRequest('A workout exercise must keep at least one set');
  ex.sets = ex.sets.filter((s: IExerciseSet) => s.setNumber !== setNumber).map((s: IExerciseSet, i: number) => ({ ...s, setNumber: i + 1 }));
  await session.save();
  return session;
}

export async function updateSessionExercise(
  userId: string,
  sessionId: string,
  exerciseId: string,
  patch: { notes?: string | null; skipped?: boolean; replaceExerciseId?: string }
) {
  const session = await getSession(userId, sessionId);
  if (session.status !== 'active') throw ApiError.badRequest('Workout is not active');
  const idx = session.exercises.findIndex((e) => String(e.exerciseId) === exerciseId);
  if (idx === -1) throw ApiError.badRequest('Exercise is not part of this workout');
  const ex = session.exercises[idx];
  if (patch.notes !== undefined) ex.notes = patch.notes ?? undefined;
  if (patch.skipped !== undefined) ex.skipped = patch.skipped;
  if (patch.replaceExerciseId) {
    const replacement = await Exercise.findById(patch.replaceExerciseId).lean();
    if (!replacement) throw ApiError.notFound('Replacement exercise not found');
    const best = await previousBest(userId, String(replacement._id));
    ex.exerciseId = replacement._id;
    ex.nameSnapshot = replacement.name;
    ex.targetMuscle = replacement.targetMuscle;
    ex.equipment = replacement.equipment;
    ex.previousBest = best;
    ex.sets = Array.from({ length: ex.targetSets }, (_, s) => ({
      setNumber: s + 1,
      weightKg: best?.weightKg ?? 0,
      reps: ex.targetReps,
      completed: false,
    }));
  }
  await session.save();
  return session;
}

export interface CompleteResult {
  session: IWorkoutSession;
  summary: Record<string, unknown>;
  newRecords: Array<Record<string, unknown>>;
}

export async function completeWorkout(userId: string, sessionId: string, durationSeconds?: number, userWeightKg?: number): Promise<CompleteResult> {
  const session = await WorkoutSession.findOne({ _id: sessionId, userId });
  if (!session) throw ApiError.notFound('Workout session not found');
  if (session.status === 'completed') {
    return { session, summary: buildSummary(session), newRecords: [] };
  }

  const completedAt = new Date();
  const duration = durationSeconds ?? Math.max(60, Math.round((completedAt.getTime() - session.startedAt.getTime()) / 1000));
  session.status = 'completed';
  session.completedAt = completedAt;
  session.durationSeconds = duration;

  let volume = 0;
  let sets = 0;
  let reps = 0;
  for (const ex of session.exercises) {
    if (ex.skipped) continue;
    for (const s of ex.sets) {
      if (!s.completed) continue;
      sets += 1;
      reps += s.reps;
      volume += s.weightKg * s.reps;
    }
  }
  session.totalVolumeKg = Math.round(volume * 10) / 10;
  session.totalSets = sets;
  session.totalReps = reps;
  session.caloriesBurned = kcalForSession(duration / 60, userWeightKg ?? 75);

  /* ---- Personal record detection (only genuinely lifted weight counts) ---- */
  const newRecords = [];
  for (const ex of session.exercises) {
    if (ex.skipped) continue;
    const completed = ex.sets.filter((s: IExerciseSet) => s.completed);
    if (!completed.length) continue;
    const bestSet = completed.reduce((a: IExerciseSet, b: IExerciseSet) => (b.weightKg > a.weightKg || (b.weightKg === a.weightKg && b.reps > a.reps) ? b : a));
    const exVolume = completed.reduce((acc: number, s: IExerciseSet) => acc + s.weightKg * s.reps, 0);
    const bestReps = completed.reduce((a: IExerciseSet, b: IExerciseSet) => (b.reps > a.reps ? b : a));

    const candidates = [
      { recordType: 'maxWeight', value: bestSet.weightKg, unit: 'kg', lift: bestSet },
      { recordType: 'maxReps', value: bestReps.reps, unit: 'reps', lift: bestReps },
      { recordType: 'bestVolume', value: Math.round(exVolume), unit: 'kg', lift: null },
    ];

    for (const cand of candidates) {
      if (cand.value <= 0) continue;
      const existing = await PersonalRecord.findOne({
        userId,
        exerciseId: ex.exerciseId,
        recordType: cand.recordType,
      });
      if (!existing) {
        const rec = await PersonalRecord.create({
          userId,
          exerciseId: ex.exerciseId,
          exerciseNameSnapshot: ex.nameSnapshot,
          recordType: cand.recordType,
          value: cand.value,
          unit: cand.unit,
          achievedAt: completedAt,
          sessionId: session._id,
          confirmed: true,
        });
        if (cand.lift) cand.lift.isPR = true;
        session.personalRecords.push(rec._id);
        newRecords.push({ ...rec.toObject(), previousValue: null });
      } else if (cand.value > existing.value) {
        existing.previousValue = existing.value;
        existing.value = cand.value;
        existing.achievedAt = completedAt;
        existing.sessionId = session._id;
        await existing.save();
        if (cand.lift) cand.lift.isPR = true;
        session.personalRecords.push(existing._id);
        newRecords.push({ ...existing.toObject() });
      }
    }
  }

  await session.save();

  /* ---- Side effects: goals, notifications, derived weight entry ---- */
  await applyGoalProgress(userId, session, completedAt);
  if (newRecords.length) {
    await Notification.insertMany(
      newRecords.map((r) => ({
        userId,
        type: 'personal_record',
        title: 'New personal record!',
        body: `${r.exerciseNameSnapshot}: ${r.value} ${r.unit} (${String(r.recordType).replace(/([A-Z])/g, ' $1').toLowerCase()})`,
        data: { recordId: String(r._id), sessionId: String(session._id) },
      }))
    );
  }
  if (userWeightKg) {
    await ProgressRecord.create({
      userId,
      type: 'weight',
      value: userWeightKg,
      unit: 'kg',
      measuredAt: completedAt,
      source: 'derived',
      notes: 'Auto-recorded at workout completion',
    });
  }

  logger.info('workout completed', { userId, sessionId: session._id.toString(), sets, volume: session.totalVolumeKg });
  return { session, summary: buildSummary(session), newRecords };
}

async function applyGoalProgress(userId: string, session: IWorkoutSession, at: Date) {
  const goals = await FitnessGoal.find({ userId, status: 'active' });
  if (!goals.length) return;
  const dayStart = new Date(at);
  dayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(dayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  for (const goal of goals) {
    let next = goal.currentValue;
    if (goal.goalType === 'workoutsCount') next = goal.currentValue + 1;
    else if (goal.goalType === 'frequency') {
      const count = await WorkoutSession.countDocuments({
        userId,
        status: 'completed',
        startedAt: { $gte: weekStart, $lte: at },
      });
      next = Math.max(goal.currentValue, count);
    } else if (goal.goalType === 'strengthMetric') {
      const rec = await PersonalRecord.findOne({ userId, recordType: 'maxWeight' }).sort({ value: -1 });
      if (rec) next = Math.max(goal.currentValue, rec.value);
    } else if (goal.goalType === 'programCompletion' && session.programId && String(session.programId) === goal.unit) {
      next = goal.targetValue;
    }
    goal.currentValue = next;
    const justCompleted = goal.status === 'active' && goal.currentValue >= goal.targetValue;
    if (justCompleted) {
      goal.status = 'completed';
      goal.completedAt = at;
      await Notification.create({
        userId,
        type: 'goal_completed',
        title: 'Goal completed!',
        body: `You achieved "${goal.title}". Great work.`,
        data: { goalId: String(goal._id) },
      });
    }
    await goal.save();
  }
}

export function buildSummary(session: IWorkoutSession) {
  const minutes = Math.round(session.durationSeconds / 60);
  return {
    id: String(session._id),
    title: session.title,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    durationSeconds: session.durationSeconds,
    durationMinutes: minutes,
    exercisesCompleted: session.exercises.filter((e: ISessionExercise) => !e.skipped).length,
    totalSets: session.totalSets,
    totalReps: session.totalReps,
    totalVolumeKg: session.totalVolumeKg,
    caloriesBurned: session.caloriesBurned,
    caloriesEstimated: true,
    personalRecordIds: session.personalRecords.map((p: { toString(): string }) => String(p)),
  };
}

export async function history(userId: string, query: HistoryQuery) {
  const { page, limit, skip } = parsePagination(query, { page: 1, limit: 10 });
  const filter: Record<string, unknown> = { userId };
  if (query.status) filter.status = query.status;
  else filter.status = { $in: ['completed', 'abandoned'] };
  if (query.from || query.to) {
    const range: Record<string, Date> = {};
    if (query.from) range.$gte = query.from;
    if (query.to) range.$lte = query.to;
    filter.startedAt = range;
  }
  if (query.muscle) filter['exercises.targetMuscle'] = query.muscle;

  const [items, total] = await Promise.all([
    WorkoutSession.find(filter)
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-exercises.sets')
      .lean(),
    WorkoutSession.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function abandonWorkout(userId: string, sessionId: string) {
  const session = await getSession(userId, sessionId);
  if (session.status !== 'active') throw ApiError.badRequest('Workout is not active');
  session.status = 'abandoned';
  session.completedAt = new Date();
  session.durationSeconds = Math.round((Date.now() - session.startedAt.getTime()) / 1000);
  await session.save();
  return session;
}
