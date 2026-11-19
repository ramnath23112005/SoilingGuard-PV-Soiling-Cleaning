import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle2, Trophy, Flame, Timer, Layers, ArrowRight, Sparkles } from 'lucide-react-native';
import { Button, Card, Badge, Divider } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import type { WorkoutSummary, PersonalRecord } from '../../types';

function fmtDur(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

export default function WorkoutCompleteScreen() {
  const params = useLocalSearchParams<{ summary?: string; records?: string }>();
  const router = useRouter();
  const scale = useRef(new Animated.Value(0.6)).current;
  const fade = useRef(new Animated.Value(0)).current;

  let summary: WorkoutSummary | null = null;
  let records: PersonalRecord[] = [];
  try {
    if (params.summary) summary = JSON.parse(params.summary) as WorkoutSummary;
  } catch {
    summary = null;
  }
  try {
    if (params.records) records = JSON.parse(params.records) as PersonalRecord[];
  } catch {
    records = [];
  }

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  if (!summary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={typography.h2}>Workout saved</Text>
          <Button title="Back to home" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.hero}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <View style={styles.checkCircle}>
              <CheckCircle2 size={54} color={colors.accent} />
            </View>
          </Animated.View>
          <Text style={[typography.title, { marginTop: spacing.md, textAlign: 'center' }]}>Workout complete!</Text>
          <Text style={[typography.secondary, { textAlign: 'center', marginTop: 6 }]}>“{summary.title}”</Text>
        </View>

        <Animated.View style={{ opacity: fade, paddingHorizontal: spacing.md }}>
          <View style={styles.statGrid}>
            <BigStat icon={Timer} label="Duration" value={fmtDur(summary.durationSeconds)} color="#5AC8FA" />
            <BigStat icon={Layers} label="Sets" value={`${summary.totalSets}`} color={colors.accent} />
            <BigStat icon={Flame} label="Calories" value={`${Math.round(summary.caloriesBurned)}`} color={colors.warning} />
            <BigStat icon={Layers} label="Volume" value={`${Math.round(summary.totalVolumeKg).toLocaleString()} kg`} color={colors.success} />
          </View>

          {records.length > 0 ? (
            <Card style={{ marginTop: spacing.md, borderColor: `${colors.warning}55` }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={18} color={colors.warning} />
                <Text style={typography.h3}>New personal records!</Text>
              </View>
              {records.map((r) => (
                <View key={r._id} style={styles.prRow}>
                  <Trophy size={16} color={colors.warning} />
                  <Text style={[typography.body, { flex: 1, fontWeight: '600' }]}>{r.exerciseNameSnapshot}</Text>
                  <Badge label={`${r.value} ${r.unit}`} color={colors.warning} small />
                </View>
              ))}
              {summary.totalSets > 0 ? (
                <>
                  <Divider style={{ marginVertical: spacing.sm }} />
                  <Text style={typography.caption}>Previous best improved on {records.length} exercise{records.length > 1 ? 's' : ''}.</Text>
                </>
              ) : null}
            </Card>
          ) : (
            <Card style={{ marginTop: spacing.md }}>
              <Text style={typography.h3}>Nice work</Text>
              <Text style={[typography.secondary, { marginTop: 4 }]}>
                No PRs this session — {summary.exercisesCompleted} exercises completed. Keep progressive overload going.
              </Text>
            </Card>
          )}

          <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
            <Button title="View progress" iconRight={ArrowRight} onPress={() => router.replace('/(tabs)/progress')} testID="view-progress" />
            <Button title="Done" variant="secondary" onPress={() => router.replace('/(tabs)')} testID="complete-done" />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BigStat({
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
    <View style={styles.bigStat}>
      <View style={[styles.bigStatIcon, { backgroundColor: `${color}1F` }]}>
        <Icon size={18} color={color} strokeWidth={2.2} />
      </View>
      <Text style={styles.bigStatValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={typography.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingTop: spacing.xxl, paddingBottom: spacing.lg },
  checkCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: `${colors.accent}18`,
    borderWidth: 2,
    borderColor: `${colors.accent}55`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  bigStat: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  bigStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigStatValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  prRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
});
