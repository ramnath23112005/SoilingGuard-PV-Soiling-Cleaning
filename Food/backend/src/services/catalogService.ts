import { Exercise, IExercise } from '../models/Exercise';
import { WorkoutProgram, IWorkoutProgram } from '../models/WorkoutProgram';
import { ApiError } from '../utils/ApiError';
import { parsePagination, buildMeta } from '../utils/pagination';
import { ExerciseQuery, ProgramQuery, CreateExerciseInput, CreateProgramInput } from '../validators/catalog';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ------------------------------- Exercises ------------------------------- */

export async function listExercises(query: ExerciseQuery) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isPublished: true };
  if (query.search) filter.name = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (query.muscle) filter.targetMuscle = query.muscle;
  if (query.equipment) filter.equipment = query.equipment;
  if (query.difficulty) filter.difficulty = query.difficulty;

  const sort: Record<string, 1 | -1> = query.sort
    ? ({ [query.sort.replace('-', '')]: query.sort.startsWith('-') ? -1 : 1 } as Record<string, 1 | -1>)
    : { name: 1 };
  const [items, total] = await Promise.all([
    Exercise.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Exercise.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getExercise(id: string) {
  const exercise = await Exercise.findOne({ _id: id, isPublished: true }).lean();
  if (!exercise) throw ApiError.notFound('Exercise not found');
  const related = await Exercise.find({
    targetMuscle: exercise.targetMuscle,
    _id: { $ne: exercise._id },
    isPublished: true,
  })
    .limit(6)
    .lean();
  return { ...exercise, related };
}

export async function createExercise(input: CreateExerciseInput) {
  const base = slugify(input.name);
  const exists = await Exercise.findOne({ slug: base });
  const slug = exists ? `${base}-${Date.now().toString(36)}` : base;
  return Exercise.create({ ...input, slug });
}

export async function updateExercise(id: string, input: Partial<CreateExerciseInput>) {
  const exercise = await Exercise.findByIdAndUpdate(id, { $set: input }, { new: true, runValidators: true });
  if (!exercise) throw ApiError.notFound('Exercise not found');
  return exercise;
}

export async function deleteExercise(id: string) {
  const exercise = await Exercise.findByIdAndDelete(id);
  if (!exercise) throw ApiError.notFound('Exercise not found');
  return { id, deleted: true };
}

/* -------------------------------- Programs ------------------------------- */

export async function listPrograms(query: ProgramQuery) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = { isPublished: true };
  if (query.search) filter.name = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.category) filter.categories = query.category;
  if (query.muscle) filter.targetMuscleGroups = query.muscle;

  let sort: Record<string, 1 | -1> = { favoritesCount: -1, createdAt: -1 };
  if (query.sort) {
    const dir: 1 | -1 = query.sort.startsWith('-') ? -1 : 1;
    sort = { [query.sort.replace('-', '')]: dir };
  }
  const [items, total] = await Promise.all([
    WorkoutProgram.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    WorkoutProgram.countDocuments(filter),
  ]);
  return { items, meta: buildMeta(page, limit, total) };
}

export async function getProgram(id: string) {
  const program = await WorkoutProgram.findOne({ _id: id, isPublished: true })
    .populate({ path: 'exercises.exerciseId', select: 'name slug targetMuscle equipment difficulty imageUrls defaultSets defaultReps' })
    .lean();
  if (!program) throw ApiError.notFound('Program not found');
  return program;
}

export async function createProgram(input: CreateProgramInput, createdBy?: string) {
  const base = slugify(input.name);
  const exists = await WorkoutProgram.findOne({ slug: base });
  const slug = exists ? `${base}-${Date.now().toString(36)}` : base;
  const exercises = input.exercises.map((e, i) => ({ ...e, order: e.order ?? i }));
  return WorkoutProgram.create({ ...input, slug, exercises, createdBy });
}

export async function updateProgram(id: string, input: Partial<CreateProgramInput>) {
  const payload: Record<string, unknown> = { ...input };
  if (input.exercises) payload.exercises = input.exercises.map((e, i) => ({ ...e, order: e.order ?? i }));
  const program = await WorkoutProgram.findByIdAndUpdate(id, { $set: payload }, { new: true, runValidators: true });
  if (!program) throw ApiError.notFound('Program not found');
  return program;
}

export async function deleteProgram(id: string) {
  const program = await WorkoutProgram.findByIdAndDelete(id);
  if (!program) throw ApiError.notFound('Program not found');
  return { id, deleted: true };
}

export type { IExercise, IWorkoutProgram };
