import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Timer, Layers, Flame, Trophy, CheckCircle2, Circle, XCircle } from 'lucide-react-native';
import { Card, Badge, ErrorState, SectionHeader, Divider, ProgressBar } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { useSession } from '../../hooks/queries';

function fmtClock(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

export default function SessionSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessionQ = useSession(id);
  const session = sessionQ.data;

  if (sessionQ.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }
  if (sessionQ.isError || !session) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={(sessionQ.error as Error)?.message ?? 'Session not found.'} onRetry={() => void sessionQ.refetch()} />
      </SafeAreaView>
    );
  }

  const exercises = session.exercises.slice().sort((a, b) => a.order - b.order);
  const completedSets = exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0);
  const totalSets = exercises.reduce((acc, e) => acc + e.sets.length, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h1, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
          {session.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}>
        <View style={styles.statusRow}>
          <Badge
            label={session.status}
            color={session.status === 'completed' ? colors.success : session.status === 'active' ? colors.accent : colors.error}
          />
          <Text style={typography.caption}>{new Date(session.startedAt).toLocaleString()}</Text>
        </View>

        <View style={styles.statGrid}>
          <MiniStat icon={Timer} label="Duration" value={fmtClock(session.durationSeconds)} color="#5AC8FA" />
          <MiniStat icon={Layers} label="Sets" value={`${completedSets}/${totalSets}`} color={colors.accent} />
          <MiniStat icon={Flame} label="Volume" value={`${Math.round(session.totalVolumeKg).toLocaleString()} kg`} color={colors.success} />
          <MiniStat icon={Flame} label="Calories" value={`${Math.round(session.caloriesBurned)}`} color={colors.warning} />
        </View>

        {session.personalRecords.length > 0 ? (
          <Card style={{ marginTop: spacing.md, borderColor: `${colors.warning}55` }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Trophy size={17} color={colors.warning} />
              <Text style={typography.h3}>
                {session.personalRecords.length} personal record{session.personalRecords.length > 1 ? 's' : ''} this session
              </Text>
            </View>
          </Card>
        ) : null}

        <SectionHeader title="Exercises" />
        {exercises.map((ex) => {
          const done = ex.sets.filter((s) => s.completed).length;
          return (
            <Card key={String(ex.exerciseId)} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={typography.h3} numberOfLines={1}>
                    {ex.nameSnapshot}
                  </Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>
                    {done}/{ex.sets.length} sets completed
                    {ex.skipped ? ' · skipped' : ''}
                  </Text>
                </View>
                {ex.skipped ? (
                  <XCircle size={18} color={colors.error} />
                ) : done === ex.sets.length ? (
                  <CheckCircle2 size={18} color={colors.success} />
                ) : (
                  <Circle size={18} color={colors.textSecondary} />
                )}
              </View>
              <View style={{ marginTop: 10 }}>
                <ProgressBar value={ex.sets.length ? (done / ex.sets.length) * 100 : 0} height={5} color={done === ex.sets.length ? colors.success : colors.accent} />
              </View>
              <View style={{ marginTop: spacing.sm, gap: 6 }}>
                {ex.sets.map((s) => (
                  <View key={s.setNumber} style={[styles.setLine, !s.completed && { opacity: 0.5 }]}>
                    <Text style={typography.caption}>Set {s.setNumber}</Text>
                    <Text style={[typography.body, { fontWeight: '700', fontVariant: ['tabular-nums'] }]}>
                      {s.weightKg} kg × {s.reps}
                    </Text>
                    {s.isPR ? <Badge label="PR" color={colors.warning} small /> : null}
                    {s.completed ? <CheckCircle2 size={14} color={colors.success} /> : <Circle size={14} color={colors.textSecondary} />}
                  </View>
                ))}
              </View>
              {ex.notes ? (
                <>
                  <Divider style={{ marginVertical: 8 }} />
                  <Text style={typography.caption}>NOTE</Text>
                  <Text style={[typography.secondary, { marginTop: 2 }]}>{ex.notes}</Text>
                </>
              ) : null}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.miniStat}>
      <Icon size={16} color={color} />
      <Text style={styles.miniStatValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
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
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.md },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  miniStat: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 4,
    alignItems: 'center',
    gap: 3,
  },
  miniStatValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  setLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
