import { Notification } from '../models/Notification';
import { DeviceToken } from '../models/DeviceToken';
import { parsePagination, buildMeta } from '../utils/pagination';

export async function listNotifications(userId: string, page = 1, limit = 20) {
  const { page: p, limit: l, skip } = parsePagination({ page, limit });
  const filter = { userId };
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, readAt: null }),
  ]);
  return { items, meta: { ...buildMeta(p, l, total), unread } };
}

export async function markRead(userId: string, id: string) {
  const notif = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  return notif;
}

export async function markAllRead(userId: string) {
  const result = await Notification.updateMany({ userId, readAt: null }, { $set: { readAt: new Date() } });
  return { modified: result.modifiedCount };
}

export async function registerDeviceToken(userId: string, token: string, platform: 'ios' | 'android' | 'web') {
  const doc = await DeviceToken.findOneAndUpdate(
    { token },
    { userId, platform, lastSeenAt: new Date() },
    { upsert: true, new: true }
  );
  return doc;
}

export async function removeDeviceToken(token: string) {
  await DeviceToken.deleteOne({ token });
  return { removed: true };
}
