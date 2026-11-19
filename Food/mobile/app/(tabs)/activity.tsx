import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarDays, ChevronRight, Layers, Trophy, Filter } from 'lucide-react-native';
import { Chip, EmptyState, ErrorState, SectionHeader, Card, Badge } from '../../components/ui';
import { HistoryCard } from '../../components/cards';
import { colors, spacing, typography } from '../../constants/theme';
import { useWorkoutHistory } from '../../hooks/queries';

const MUSCLE_FILTERS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'abs'];

export default function ActivityScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [muscle, setMuscle] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const historyQ = useWorkoutHistory({ page, limit: 12, muscle: muscle ?? undefined, status: status ?? undefined });
  const sessions = historyQ.data?.items ?? [];

  const reset = () => {
    setMuscle(null);
    setStatus(null);
    setPage(1);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={typography.title}>Activity</Text>
            <Text style={[typography.secondary, { marginTop: 2 }]}>Your complete workout history</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/records')}>
            <Trophy size={19} color={colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.sm }}>
          <Chip label="All" selected={!status && !muscle} onPress={reset} />
          <Chip label="Completed" selected={status === 'completed'} onPress={() => { setStatus(status === 'completed' ? null : 'completed'); setPage(1); }} />
          <Chip label="Abandoned" selected={status === 'abandoned'} onPress={() => { setStatus(status === 'abandoned' ? null : 'abandoned'); setPage(1); }} />
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}>
          {MUSCLE_FILTERS.map((m) => (
            <Chip
              key={m}
              label={m}
              selected={muscle === m}
              onPress={() => {
                setMuscle(muscle === m ? null : m);
                setPage(1);
              }}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={historyQ.isRefetching} onRefresh={() => void historyQ.refetch()} tintColor={colors.accent} />}
      >
        {historyQ.isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 50 }} />
        ) : historyQ.isError ? (
          <ErrorState message={(historyQ.error as Error)?.message ?? 'Could not load history.'} onRetry={() => void historyQ.refetch()} />
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No workouts here yet"
            message="Completed and abandoned sessions will show up here with full summaries."
            actionTitle="Start your first workout"
            onAction={() => router.push('/(tabs)/workouts')}
          />
        ) : (
          <>
            <View style={styles.summaryRow}>
              <Card style={{ flex: 1 }}>
                <Text style={typography.caption}>TOTAL SESSIONS</Text>
                <Text style={styles.summaryValue}>{historyQ.data?.meta.total ?? 0}</Text>
              </Card>
              <Card style={{ flex: 1 }}>
                <Text style={typography.caption}>SHOWING</Text>
                <Text style={styles.summaryValue}>
                  {sessions.length} of {historyQ.data?.meta.totalPages ?? 1} pages
                </Text>
              </Card>
            </View>

            {sessions.map((s) => (
              <HistoryCard key={s._id} session={s} onPress={() => router.push(`/workout/${s._id}`)} />
            ))}

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <TouchableOpacity
                disabled={!historyQ.data?.meta.hasPrev}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                style={[styles.pageBtn, { opacity: historyQ.data?.meta.hasPrev ? 1 : 0.4 }]}
              >
                <Text style={styles.pageText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={!historyQ.data?.meta.hasNext}
                onPress={() => setPage((p) => p + 1)}
                style={[styles.pageBtn, styles.pageBtnActive, { opacity: historyQ.data?.meta.hasNext ? 1 : 0.4 }]}
              >
                <Text style={[styles.pageText, { color: '#101114' }]}>Next page</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingTop: 4, paddingBottom: 40 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  summaryValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 },
  pageBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  pageText: { fontWeight: '700', color: colors.text, fontSize: 14 },
});
