import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Scale, Ruler, Trophy, Target, ChevronRight, Activity, Info } from 'lucide-react-native';
import { Button, Card, Chip, SectionHeader, StatTile, Skeleton, EmptyState, ProgressBar, Input, Badge } from '../../components/ui';
import { LineChart, BarChart } from '../../components/charts';
import { colors, spacing, typography } from '../../constants/theme';
import {
  useProgressOverview,
  useWeightHistory,
  useActivitySeries,
  usePersonalRecords,
  useGoals,
  useAddWeight,
} from '../../hooks/queries';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '6m', days: 180 },
  { label: '1y', days: 365 },
];

const recordLabel: Record<string, string> = {
  maxWeight: 'Max weight',
  maxReps: 'Max reps',
  bestVolume: 'Best volume',
  longestWorkout: 'Longest workout',
  longestStreak: 'Longest streak',
};

export default function ProgressScreen() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const overviewQ = useProgressOverview(days);
  const weightQ = useWeightHistory(days);
  const activityQ = useActivitySeries(days);
  const recordsQ = usePersonalRecords();
  const goalsQ = useGoals('active');
  const addWeight = useAddWeight();

  const overview = overviewQ.data;

  const submitWeight = async () => {
    const v = Number(weightInput);
    if (!v || v < 25 || v > 400) {
      Alert.alert('Invalid weight', 'Enter a weight between 25 and 400 kg.');
      return;
    }
    try {
      await addWeight.mutateAsync({ value: v });
      setWeightInput('');
      setShowWeightForm(false);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const weightPoints = (weightQ.data ?? []).map((w) => ({
    label: new Date(w.measuredAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: w.value,
  }));

  const activityBars = (activityQ.data ?? [])
    .filter((_, i, arr) => arr.length <= 31 || i % Math.ceil(arr.length / 31) === 0)
    .map((b) => ({ label: b.date.slice(5), value: b.volumeKg }));

  const grouped = recordsQ.data?.grouped ?? {};

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={overviewQ.isRefetching} onRefresh={() => void overviewQ.refetch()} tintColor={colors.accent} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={typography.title}>Progress</Text>
            <Text style={[typography.secondary, { marginTop: 2 }]}>Measured data &amp; training analytics</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowWeightForm((v) => !v)}>
            <Plus size={20} color="#101114" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
          {RANGES.map((r) => (
            <Chip key={r.days} label={r.label} selected={days === r.days} onPress={() => setDays(r.days)} />
          ))}
        </View>

        {showWeightForm ? (
          <Card style={{ marginTop: spacing.md, borderColor: colors.accent }}>
            <Text style={typography.h3}>Log body weight</Text>
            <Input label="Weight (kg)" value={weightInput} onChangeText={setWeightInput} keyboardType="decimal-pad" placeholder="76.4" leftIcon={Scale} />
            <Button title="Save weight" onPress={submitWeight} loading={addWeight.isPending} size="sm" />
          </Card>
        ) : null}

        {overviewQ.isLoading ? (
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <Skeleton height={100} />
            <Skeleton height={200} />
            <Skeleton height={180} />
          </View>
        ) : (
          <>
            {/* Body stats */}
            <SectionHeader title="Body" />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <StatTile icon={Scale} label="Weight" value={overview?.body.latestWeightValue ?? '—'} unit="kg" color={colors.accent} />
              <StatTile icon={Ruler} label="Height" value={overview?.body.heightCm ?? '—'} unit="cm" color="#5AC8FA" />
              <StatTile icon={Activity} label="BMI" value={overview?.body.bmi ?? '—'} color={colors.warning} />
            </View>
            <View style={styles.noteBox}>
              <Info size={14} color={colors.textSecondary} />
              <Text style={[typography.caption, { flex: 1, marginLeft: 6 }]}>
                {overview?.body.bmiNote} Weight source: {overview?.body.weightSource ?? 'no data yet'}.
              </Text>
            </View>

            {/* Weight chart */}
            <SectionHeader title="Weight trend" />
            <Card>
              {weightPoints.length > 1 ? (
                <LineChart points={weightPoints} unit=" kg" title={`Last ${days} days`} yFormatter={(v) => `${v}kg`} />
              ) : (
                <EmptyState
                  icon={Scale}
                  title="Not enough data"
                  message="Log your weight at least twice to see a trend line."
                  actionTitle={showWeightForm ? undefined : 'Log weight'}
                  onAction={showWeightForm ? undefined : () => setShowWeightForm(true)}
                />
              )}
            </Card>

            {/* Training volume */}
            <SectionHeader title="Training volume" />
            <Card>
              <BarChart
                data={activityBars.length ? activityBars : [{ label: '-', value: 0 }]}
                labelEvery={Math.max(1, Math.ceil(activityBars.length / 7))}
                valueFormatter={(v) => `${(v / 1000).toFixed(1)}t`}
                title={`Volume lifted (kg) · ${days}d`}
              />
              <Text style={[typography.caption, { marginTop: 6 }]}>Estimated totals from recorded sets (measured).</Text>
            </Card>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              <StatTile icon={Target} label="Workouts" value={overview?.workouts.count ?? 0} color={colors.success} />
              <StatTile icon={Trophy} label="Total sets" value={overview?.workouts.sets ?? 0} color={colors.accent} />
            </View>

            {/* Goals */}
            <SectionHeader title="Active goals" actionLabel="Manage" onAction={() => router.push('/goals')} />
            {(goalsQ.data ?? []).slice(0, 3).map((g) => (
              <Card key={g._id} style={{ marginBottom: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={typography.h3} numberOfLines={1}>
                    {g.title}
                  </Text>
                  <Text style={[typography.caption, { color: colors.accent, fontWeight: '800' }]}>{g.progressPercent}%</Text>
                </View>
                <ProgressBar value={g.progressPercent} />
              </Card>
            ))}
            {!goalsQ.isLoading && (goalsQ.data ?? []).length === 0 ? (
              <Button title="Create your first goal" variant="secondary" onPress={() => router.push('/goals')} />
            ) : null}

            {/* Personal records */}
            <SectionHeader title="Personal records" actionLabel="View all" onAction={() => router.push('/records')} />
            {recordsQ.isLoading ? (
              <Skeleton height={120} />
            ) : (recordsQ.data?.records.length ?? 0) === 0 ? (
              <EmptyState icon={Trophy} title="No records yet" message="Complete workouts with recorded weight to set your first PRs." />
            ) : (
              <Card>
                {Object.entries(grouped)
                  .slice(0, 4)
                  .map(([type, list]) => {
                    const top = list[0];
                    if (!top) return null;
                    return (
                      <View key={type} style={styles.prRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={typography.caption}>{recordLabel[type] ?? type}</Text>
                          <Text style={typography.h3} numberOfLines={1}>
                            {top.exerciseNameSnapshot}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.prValue}>
                            {top.value} <Text style={{ fontSize: 13, color: colors.textSecondary }}>{top.unit}</Text>
                          </Text>
                          {top.previousValue ? (
                            <Badge label={`+${Math.round(((top.value - top.previousValue) / top.previousValue) * 100)}%`} color={colors.success} small />
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
              </Card>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  prValue: { fontSize: 18, fontWeight: '800', color: colors.accent },
});
