import { User } from '../models/User';
import { WorkoutSession } from '../models/WorkoutSession';
import { Exercise } from '../models/Exercise';
import { WorkoutProgram } from '../models/WorkoutProgram';
import { FitnessProfile } from '../models/FitnessProfile';
import { ApiError } from '../utils/ApiError';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function dashboardStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalUsers, activeUsers, totalWorkouts, completedWorkouts, totalExercises, totalPrograms, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastLoginAt: { $gte: since } }),
      WorkoutSession.countDocuments(),
      WorkoutSession.countDocuments({ status: 'completed' }),
      Exercise.countDocuments(),
      WorkoutProgram.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('fullName email createdAt role').lean(),
    ]);

  const workoutsByDay = await WorkoutSession.aggregate([
    { $match: { status: 'completed', startedAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$startedAt' } },
        count: { $sum: 1 },
        minutes: { $sum: { $divide: ['$durationSeconds', 60] } },
        volume: { $sum: '$totalVolumeKg' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const goalStats = await Exercise.aggregate([
    { $group: { _id: '$targetMuscle', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return {
    totals: { totalUsers, activeUsers, totalWorkouts, completedWorkouts, totalExercises, totalPrograms },
    engagement: { workoutsLast30Days: workoutsByDay.reduce((a, d) => a + d.count, 0), byDay: workoutsByDay },
    exerciseDistribution: goalStats,
    recentUsers,
  };
}

export async function listUsers(query: { page?: number; limit?: number; search?: string }) {
  const { page, limit, skip } = parsePagination(query);
  const filter: Record<string, unknown> = {};
  if (query.search) {
    const rx = { $regex: query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    filter.$or = [{ fullName: rx }, { email: rx }];
  }
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).select('-passwordHash').lean(),
    User.countDocuments(filter),
  ]);
  const ids = items.map((u) => u._id);
  const [profiles, sessionCounts] = await Promise.all([
    FitnessProfile.find({ userId: { $in: ids } }).lean(),
    WorkoutSession.aggregate([
      { $match: { userId: { $in: ids }, status: 'completed' } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]),
  ]);
  const profileMap = new Map(profiles.map((p) => [String(p.userId), p]));
  const sessionMap = new Map(sessionCounts.map((s) => [String(s._id), s.count]));
  return {
    items: items.map((u) => ({
      ...u,
      profile: profileMap.get(String(u._id)) ?? null,
      completedWorkouts: sessionMap.get(String(u._id)) ?? 0,
    })),
    meta: buildMeta(page, limit, total),
  };
}

export async function setUserDisabled(userId: string, disabled: boolean) {
  const user = await User.findByIdAndUpdate(userId, { isDisabled: disabled }, { new: true }).select('-passwordHash');
  if (!user) throw ApiError.notFound('User not found');
  return user;
}
