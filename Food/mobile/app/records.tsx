import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, Medal, TrendingUp } from 'lucide-react-native';
import { Card, ErrorState, EmptyState, CardSkeleton, Badge, SectionHeader } from '../components/ui';
import { colors, spacing, typography } from '../constants/theme';
import { usePersonalRecords } from '../hooks/queries';
import type { PersonalRecord } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecordsScreen() {
  const router = useRouter();
  const recordsQ = usePersonalRecords();
  const grouped = recordsQ.data?.grouped ?? {};
  const lifetime = (recordsQ.data?.lifetime ?? {}) as Record<string, unknown>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={typography.h1}>Personal records</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}>
        {recordsQ.isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : recordsQ.isError ? (
          <ErrorState message={(recordsQ.error as Error)?.message} onRetry={() => void recordsQ.refetch()} />
        ) : Object.keys(grouped).length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No records yet"
            message="Log a workout and beat your previous numbers — PRs are detected automatically."
            actionTitle="Start a workout"
            onAction={() => router.push('/(tabs)/workouts')}
          />
        ) : (
          <>
            {/* Lifetime stats */}
            {Object.keys(lifetime).length > 0 ? (
              <Card style={{ marginBottom: spacing.md, borderColor: `${colors.accent}44` }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Medal size={18} color={colors.accent} />
                  <Text style={typography.h3}>Lifetime highlights</Text>
                </View>
                {Object.entries(lifetime).map(([k, v]) => (
                  <View key={k} style={styles.lifetimeRow}>
                    <Text style={[typography.secondary, { flex: 1, textTransform: 'capitalize' }]}>{k.replace(/([A-Z])/g, ' $1')}</Text>
                    <Text style={[typography.body, { fontWeight: '700' }]}>{String(v)}</Text>
                  </View>
                ))}
              </Card>
            ) : null}

            {Object.entries(grouped).map(([exercise, records]) => (
              <View key={exercise} style={{ marginBottom: spacing.md }}>
                <SectionHeader title={exercise} />
                <Card style={{ paddingVertical: spacing.sm }}>
                  {records.map((r, i) => (
                    <RecordRow key={r._id} record={r} last={i === records.length - 1} />
                  ))}
                </Card>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function RecordRow({ record, last }: { record: PersonalRecord; last: boolean }) {
  return (
    <View style={[styles.recordRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.recordIcon}>
        <TrendingUp size={15} color={colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontWeight: '600' }]}>
          {record.value} {record.unit}
        </Text>
        <Text style={typography.caption}>
          {record.recordType.replace(/_/g, ' ')} · {formatDate(record.achievedAt)}
          {record.confirmed ? ' · confirmed' : ''}
        </Text>
      </View>
      {record.previousValue != null && record.previousValue > 0 ? (
        <Badge label={`+${Math.round(((record.value - record.previousValue) / record.previousValue) * 1000) / 10}%`} color={colors.success} small />
      ) : (
        <Badge label="first" color={colors.accent} small />
      )}
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
  lifetimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}66`,
  },
  recordIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: `${colors.warning}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
