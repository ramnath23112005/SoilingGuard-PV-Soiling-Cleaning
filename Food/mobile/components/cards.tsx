import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Flame, Dumbbell, Heart, ChevronRight, Layers, Target } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../constants/theme';
import { Badge, Card, ProgressBar } from './ui';
import type { WorkoutProgram, Exercise, WorkoutSession, FitnessGoal } from '../types';

const difficultyColor: Record<string, string> = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.error,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/* ------------------------------ ProgramCard ------------------------------ */

export function ProgramCard({
  program,
  onPress,
  onToggleFavorite,
  favoriteId,
}: {
  program: WorkoutProgram;
  onPress: () => void;
  onToggleFavorite?: () => void;
  favoriteId?: string | null;
}) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden', marginBottom: spacing.md }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View style={styles.cover}>
          {program.coverImage ? (
            <Image source={{ uri: program.coverImage }} style={styles.coverImg} resizeMode="cover" />
          ) : (
            <View style={[styles.coverImg, { backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' }]}>
              <Dumbbell size={40} color={colors.accent} strokeWidth={1.6} />
            </View>
          )}
          <View style={styles.coverOverlay}>
            <Badge label={program.difficulty} color={difficultyColor[program.difficulty] ?? colors.accent} small />
            {onToggleFavorite ? (
              <TouchableOpacity onPress={onToggleFavorite} style={styles.heartBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Heart size={18} color={favoriteId ? colors.error : colors.text} fill={favoriteId ? colors.error : 'transparent'} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View style={{ padding: spacing.md }}>
          <Text style={typography.h3} numberOfLines={1}>
            {program.name}
          </Text>
          <Text style={[typography.secondary, { marginTop: 4, minHeight: 38 }]} numberOfLines={2}>
            {program.description}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Clock size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{program.durationMinutes} min</Text>
            </View>
            <View style={styles.metaItem}>
              <Layers size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{program.exercises?.length ?? 0} exercises</Text>
            </View>
            <View style={styles.metaItem}>
              <Flame size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>~{program.estimatedCalories} kcal</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.sm }}>
            {program.targetMuscleGroups.slice(0, 4).map((m) => (
              <Badge key={m} label={m} color={colors.accent} small />
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Card>
  );
}

/* ----------------------------- ExerciseCard ------------------------------ */

export function ExerciseCard({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={styles.rowCard}>
        {exercise.imageUrls?.[0] ? (
          <Image source={{ uri: exercise.imageUrls[0] }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, { alignItems: 'center', justifyContent: 'center' }]}>
            <Dumbbell size={22} color={colors.accent} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={typography.h3} numberOfLines={1}>
            {exercise.name}
          </Text>
          <Text style={[typography.secondary, { marginTop: 2 }]} numberOfLines={1}>
            {exercise.targetMuscle} · {exercise.equipment}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
            <Badge label={exercise.difficulty} color={difficultyColor[exercise.difficulty] ?? colors.accent} small />
            <Badge label={`${exercise.defaultSets}×${exercise.defaultReps}`} color={colors.textSecondary} small />
          </View>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </Card>
    </TouchableOpacity>
  );
}

/* ----------------------------- HistoryCard ------------------------------- */

export function HistoryCard({ session, onPress }: { session: WorkoutSession; onPress: () => void }) {
  const date = new Date(session.startedAt);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Card style={[styles.rowCard, { marginBottom: spacing.sm }]}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{date.getDate()}</Text>
          <Text style={styles.dateMonth}>{date.toLocaleString('en', { month: 'short' }).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.h3} numberOfLines={1}>
            {session.title}
          </Text>
          <Text style={[typography.secondary, { marginTop: 2 }]}>
            {Math.round(session.durationSeconds / 60)} min · {session.totalSets} sets ·{' '}
            {Math.round(session.totalVolumeKg).toLocaleString()} kg
          </Text>
          <Text style={[typography.caption, { marginTop: 2 }]}>Status: {session.status}</Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </Card>
    </TouchableOpacity>
  );
}

/* -------------------------------- GoalCard ------------------------------- */

export function GoalCard({
  goal,
  onPress,
  onEdit,
  onDelete,
}: {
  goal: FitnessGoal;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const complete = goal.status === 'completed';
  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={typography.h3} numberOfLines={1}>
              {goal.title}
            </Text>
            {goal.description ? (
              <Text style={[typography.secondary, { marginTop: 2 }]} numberOfLines={2}>
                {goal.description}
              </Text>
            ) : null}
          </View>
          <Badge
            label={complete ? 'completed' : goal.status}
            color={complete ? colors.success : goal.status === 'failed' ? colors.error : colors.warning}
            small
          />
        </View>
        <View style={{ marginTop: spacing.md }}>
          <ProgressBar value={goal.progressPercent} color={complete ? colors.success : colors.accent} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={typography.caption}>
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </Text>
            <Text style={[typography.caption, { color: colors.accent, fontWeight: '700' }]}>{goal.progressPercent}%</Text>
          </View>
        </View>
      </TouchableOpacity>
      {(onEdit || onDelete) && (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
          {onEdit ? (
            <TouchableOpacity onPress={onEdit} style={styles.goalBtn}>
              <Target size={14} color={colors.accent} />
              <Text style={styles.goalBtnText}>Edit</Text>
            </TouchableOpacity>
          ) : null}
          {onDelete ? (
            <TouchableOpacity onPress={onDelete} style={styles.goalBtn}>
              <Text style={[styles.goalBtnText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  cover: { height: 132, width: '100%' },
  coverImg: { width: '100%', height: '100%', borderRadius: radius.lg },
  coverOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heartBtn: {
    backgroundColor: colors.overlay,
    padding: 8,
    borderRadius: radius.full,
  },
  metaRow: { flexDirection: 'row', gap: 14, marginTop: spacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  thumb: { width: 58, height: 58, borderRadius: radius.md, backgroundColor: colors.backgroundSecondary },
  dateBox: {
    width: 48,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateDay: { fontSize: 18, fontWeight: '800', color: colors.accent },
  dateMonth: { fontSize: 10, color: colors.textSecondary, fontWeight: '700' },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalBtnText: { fontSize: 12, fontWeight: '700', color: colors.accent },
});
