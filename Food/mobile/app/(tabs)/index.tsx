import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Play,
  Flame,
  Dumbbell,
  Timer,
  TrendingUp,
  Trophy,
  ChevronRight,
  Zap,
  Bell,
  CalendarCheck,
} from 'lucide-react-native';
import { Button, Card, SectionHeader, StatTile, Skeleton, EmptyState, Badge } from '../../components/ui';
import { BarChart, WeekDots } from '../../components/charts';
import { ProgramCard } from '../../components/cards';
import { colors, spacing, typography } from '../../constants/theme';
import { useProgressOverview, useActivitySeries, usePrograms, useActiveWorkout, useNotifications } from '../../hooks/queries';
import { useAuthStore } from '../../store/auth';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function motivation(overview: { streak: number; workouts: { weeklyCount: number; weeklyTarget: number } } | undefined): string {
  if (!overview) return 'Consistency beats intensity. Show up today.';
  const { streak, workouts } = overview;
  if (streak >= 7) return `${streak}-day streak! You are on fire — protect it.`;
  if (streak >= 3) return `${streak} days strong. Momentum is building.`;
  if (workouts.weeklyCount === 0) return 'A fresh week. The first workout is the hardest — start now.';
  if (workouts.weeklyCount >= workouts.weeklyTarget) return 'Weekly target crushed. Extra work is bonus points.';
  const left = workouts.weeklyTarget - workouts.weeklyCount;
  return `${left} workout${left > 1 ? 's' : ''} left this week. You have got this.`;
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);

  const overviewQ = useProgressOverview(30);
  const activityQ = useActivitySeries(7);
  const programsQ = usePrograms({ limit: 3, difficulty: profile?.experienceLevel });
  const activeQ = useActiveWorkout();
  const notifQ = useNotifications(1);

  const overview = overviewQ.data;
  const refreshing = overviewQ.isRefetching;
  const onRefresh = () => {
    void overviewQ.refetch();
    void activityQ.refetch();
    void programsQ.refetch();
  };

  const unread = notifQ.data?.meta?.unread ?? 0;
  const todayWorkout = useMemo(() => {
    const preferred = profile?.goals?.[0];
    return (
      programsQ.data?.items.find((p) => (preferred ? p.categories.includes(preferred) : true)) ??
      programsQ.data?.items[0]
    );
  }, [programsQ.data, profile]);

  const weekDots = useMemo(() => {
    const buckets = activityQ.data ?? [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    if (!buckets.length) return labels.map((l) => ({ label: l, value: 0 }));
    const byDay = new Map(buckets.map((b) => [b.date, b.workouts]));
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return labels.map((l, i) => {
      const d = new Date(monday.getTime() + i * 86400000);
      const key = d.toISOString().slice(0, 10);
      return { label: l, value: byDay.get(key) ?? 0 };
    });
  }, [activityQ.data]);

  const isEmpty = !overviewQ.isLoading && (overview?.workouts.totalCount ?? 0) === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={typography.secondary}>{greeting()},</Text>
            <Text style={typography.title} numberOfLines={1}>
              {user?.fullName ?? 'Athlete'}
            </Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')}>
            <Bell size={20} color={colors.text} />
            {unread > 0 ? (
              <View style={styles.bellDot}>
                <Text style={styles.bellDotText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Goal banner */}
        <Card style={styles.goalBanner}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.goalIcon}>
              <Target />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.caption}>CURRENT GOAL</Text>
              <Text style={[typography.h3, { marginTop: 2 }]} numberOfLines={1}>
                {overview?.activeGoals?.[0]?.title ?? profile?.goals?.[0] ?? 'Build consistency'}
              </Text>
            </View>
            <TrendingUp size={20} color={colors.accent} />
          </View>
        </Card>

        {overviewQ.isLoading ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <Skeleton height={90} />
            <Skeleton height={160} />
            <Skeleton height={200} />
          </View>
        ) : isEmpty ? (
          <EmptyState
            icon={Dumbbell}
            title="Your journey starts here"
            message="No workouts yet. Pick a program tailored to your goals and record your very first session."
            actionTitle="Browse programs"
            onAction={() => router.push('/(tabs)/workouts')}
          />
        ) : (
          <>
            {/* Active workout resume */}
            {activeQ.data ? (
              <Card style={{ marginTop: spacing.md, borderColor: colors.warning }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Zap size={20} color={colors.warning} />
                  <View style={{ flex: 1 }}>
                    <Text style={typography.h3}>Workout in progress</Text>
                    <Text style={typography.secondary}>{activeQ.data.title}</Text>
                  </View>
                  <Button title="Resume" size="sm" onPress={() => router.push('/workout/active')} />
                </View>
              </Card>
            ) : null}

            {/* Start workout CTA */}
            <Button
              title={activeQ.data ? 'Open active workout' : 'Start workout'}
              icon={Play}
              size="lg"
              onPress={() => router.push(activeQ.data ? '/workout/active' : '/(tabs)/workouts')}
              style={{ marginTop: spacing.md }}
              testID="start-workout"
            />

            {/* Stats grid */}
            <View style={styles.statGrid}>
              <StatTile icon={CalendarCheck} label="This week" value={`${overview?.workouts.weeklyCount ?? 0}/${overview?.workouts.weeklyTarget ?? 3}`} color={colors.accent} />
              <StatTile icon={Dumbbell} label="Total workouts" value={overview?.workouts.totalCount ?? 0} color={colors.success} />
            </View>
            <View style={styles.statGrid}>
              <StatTile icon={Timer} label="Minutes (30d)" value={overview?.workouts.durationMinutes ?? 0} color={colors.warning} />
              <StatTile icon={Trophy} label="Streak (days)" value={overview?.streak ?? 0} color={colors.error} />
            </View>
            <View style={styles.statGrid}>
              <StatTile icon={Flame} label="Est. calories" value={overview?.workouts.caloriesBurned ?? 0} unit="kcal" color="#FF8A4C" />
              <StatTile icon={TrendingUp} label="Volume (30d)" value={(overview?.workouts.volumeKg ?? 0).toLocaleString()} unit="kg" color="#5AC8FA" />
            </View>

            {/* Weekly dots */}
            <SectionHeader title="This week" actionLabel="History" onAction={() => router.push('/(tabs)/activity')} />
            <Card>
              <WeekDots days={weekDots} />
              <Text style={[typography.caption, { marginTop: spacing.md }]}>
                {overview?.workouts.weeklyCount ?? 0} of {overview?.workouts.weeklyTarget ?? 3} planned sessions
              </Text>
            </Card>

            {/* Weekly activity chart */}
            <SectionHeader title="Last 7 days" />
            <Card>
              <BarChart
                data={(activityQ.data ?? []).map((b) => ({ label: b.date.slice(8), value: b.minutes }))}
                labelEvery={1}
                valueFormatter={(v) => `${v}m`}
                title="Training minutes"
              />
            </Card>

            {/* Motivation */}
            <Card style={[styles.motivation, { marginTop: spacing.md }]}>
              <Text style={styles.motivationText}>{motivation(overview)}</Text>
            </Card>

            {/* Recommended */}
            <SectionHeader title="Recommended for you" actionLabel="See all" onAction={() => router.push('/(tabs)/workouts')} />
            {programsQ.isLoading ? (
              <Skeleton height={260} />
            ) : (
              (programsQ.data?.items ?? []).map((p) => (
                <ProgramCard key={p._id} program={p} onPress={() => router.push(`/program/${p._id}`)} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Target() {
  return <TrendingUp size={22} color={colors.accent} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  bellDotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  goalBanner: { backgroundColor: `${colors.accent}12`, borderColor: `${colors.accent}44` },
  goalIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: `${colors.accent}22`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  motivation: { backgroundColor: colors.backgroundSecondary },
  motivationText: { ...typography.body, fontStyle: 'italic', color: colors.accent, textAlign: 'center', lineHeight: 22 },
});
