import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell, BellOff, CheckCheck, Trophy, Target, Dumbbell, Info, Gift } from 'lucide-react-native';
import { Card, EmptyState, ErrorState, CardSkeleton } from '../components/ui';
import { colors, spacing, typography } from '../constants/theme';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/queries';
import type { NotificationItem } from '../types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  personal_record: Trophy,
  goal_reminder: Target,
  workout_reminder: Dumbbell,
  streak: Gift,
  info: Info,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const notifQ = useNotifications(1);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = notifQ.data?.items ?? [];
  const unread = notifQ.data?.meta?.unread ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={typography.h1}>Notifications</Text>
          {unread > 0 ? (
            <Text style={[typography.caption, { color: colors.accent, marginTop: 2 }]}>{unread} unread</Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => void markAll.mutateAsync()}
          style={styles.iconBtn}
          disabled={unread === 0}
          testID="mark-all-read"
        >
          <CheckCheck size={19} color={unread > 0 ? colors.accent : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={notifQ.isFetching && !notifQ.isLoading} onRefresh={() => void notifQ.refetch()} tintColor={colors.accent} />}
      >
        {notifQ.isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : notifQ.isError ? (
          <ErrorState message={(notifQ.error as Error)?.message} onRetry={() => void notifQ.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={BellOff}
            title="All caught up"
            message="You'll see PR celebrations, goal nudges and workout reminders here."
          />
        ) : (
          items.map((n) => <NotificationRow key={n._id} item={n} onOpen={() => void markRead.mutateAsync(n._id)} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationRow({ item, onOpen }: { item: NotificationItem; onOpen: () => void }) {
  const unread = !item.readAt;
  const Icon = TYPE_ICONS[item.type] ?? Info;
  const accent = unread ? colors.accent : colors.textSecondary;

  return (
    <TouchableOpacity onPress={onOpen} activeOpacity={0.8}>
      <Card style={[styles.row, unread && { borderColor: `${colors.accent}55`, backgroundColor: `${colors.card}` }]}>
        <View style={[styles.iconBox, { backgroundColor: `${accent}18` }]}>
          <Icon size={18} color={accent} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text style={[typography.h3, !unread && { color: colors.textSecondary }]} numberOfLines={1}>
              {item.title}
            </Text>
            {unread ? <View style={styles.dot} /> : null}
          </View>
          <Text style={[typography.secondary, { marginTop: 2, lineHeight: 19 }]} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={[typography.caption, { marginTop: 6 }]}>{timeAgo(item.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: spacing.sm, alignItems: 'flex-start' },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
});
