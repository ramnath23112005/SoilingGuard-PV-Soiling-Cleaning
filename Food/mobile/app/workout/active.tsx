import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Plus, Trash2, SkipForward, StickyNote, Timer, Trophy, ChevronLeft, RefreshCcw, Zap } from 'lucide-react-native';
import { Button, Card, Badge, ProgressBar } from '../../components/ui';
import { RestTimer } from '../../components/RestTimer';
import { colors, spacing, typography } from '../../constants/theme';
import {
  useSession,
  useStartWorkout,
  useCompleteWorkout,
  useActiveWorkout,
  useExercises,
} from '../../hooks/queries';
import { workoutApi } from '../../services/endpoints';
import type { SessionExercise, WorkoutSession, ExerciseSet, Exercise } from '../../types';

function fmtClock(total: number): string {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function ActiveWorkoutScreen() {
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const router = useRouter();
  const activeQ = useActiveWorkout(!params.sessionId);
  const sessionId = params.sessionId ?? activeQ.data?._id ?? '';
  const sessionQ = useSession(sessionId, !!sessionId);
  const startMut = useStartWorkout();
  const completeMut = useCompleteWorkout();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [restVisible, setRestVisible] = useState(false);
  const [restSeconds, setRestSeconds] = useState(60);
  const [savingSet, setSavingSet] = useState<string | null>(null);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [replaceFor, setReplaceFor] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sessionQ.data) setSession(sessionQ.data);
  }, [sessionQ.data]);

  // Elapsed timer - wall-clock based, background safe
  useEffect(() => {
    if (!session) return;
    const startedAt = new Date(session.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?._id, session?.startedAt]);

  const exercises = session?.exercises.slice().sort((a, b) => a.order - b.order) ?? [];
  const current: SessionExercise | undefined = exercises[currentIndex];
  const completedSets = exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.completed).length, 0);
  const targetSets = exercises.reduce((acc, e) => acc + Math.max(e.targetSets, e.sets.length), 0);

  const celebrate = () => {
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.25, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(pulse, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const requireSession = (): WorkoutSession => {
    if (!session) throw new Error('Workout not loaded');
    return session;
  };

  const completeSet = async (ex: SessionExercise, set: ExerciseSet) => {
    if (!session) return;
    if (savingSet) return;
    const key = `${ex.exerciseId}-${set.setNumber}`;
    setSavingSet(key);
    try {
      const res = await workoutApi.updateSet(session._id, ex.exerciseId, set.setNumber, {
        weightKg: set.weightKg,
        reps: set.reps,
        completed: true,
      });
      setSession(res.session);
      celebrate();
      setRestSeconds(ex.restSeconds ?? 60);
      setTimeout(() => setRestVisible(true), 350);
    } catch (err) {
      Alert.alert('Could not save set', (err as Error).message);
    } finally {
      setSavingSet(null);
    }
  };

  const uncompleteSet = async (ex: SessionExercise, set: ExerciseSet) => {
    if (!session || savingSet) return;
    const key = `${ex.exerciseId}-${set.setNumber}`;
    setSavingSet(key);
    try {
      const res = await workoutApi.updateSet(session._id, ex.exerciseId, set.setNumber, { completed: false });
      setSession(res.session);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setSavingSet(null);
    }
  };

  const updateField = (ex: SessionExercise, set: ExerciseSet, field: 'weightKg' | 'reps', raw: string) => {
    const num = Number(raw.replace(',', '.'));
    const value = Number.isNaN(num) ? 0 : Math.max(0, num);
    const next = requireSession();
    setSession({
      ...next,
      exercises: next.exercises.map((e) =>
        String(e.exerciseId) === String(ex.exerciseId)
          ? { ...e, sets: e.sets.map((s) => (s.setNumber === set.setNumber ? { ...s, [field]: value } : s)) }
          : e
      ),
    });
  };

  const addSet = async (ex: SessionExercise) => {
    if (!session) return;
    try {
      const last = ex.sets[ex.sets.length - 1];
      const res = await workoutApi.addSet(session._id, {
        exerciseId: String(ex.exerciseId),
        weightKg: last?.weightKg ?? 0,
        reps: last?.reps ?? ex.targetReps,
        completed: false,
      });
      setSession(res.session);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const removeSet = async (ex: SessionExercise, setNumber: number) => {
    if (!session) return;
    if (ex.sets.length <= 1) {
      Alert.alert('Cannot remove', 'Each exercise keeps at least one set.');
      return;
    }
    try {
      const res = await workoutApi.removeSet(session._id, String(ex.exerciseId), setNumber);
      setSession(res);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const skipExercise = async (ex: SessionExercise) => {
    if (!session) return;
    try {
      const res = await workoutApi.updateExercise(session._id, String(ex.exerciseId), { skipped: !ex.skipped });
      setSession(res);
      if (currentIndex < exercises.length - 1) setCurrentIndex((i) => i + 1);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const saveNote = async () => {
    if (!session || !noteFor) return;
    try {
      const res = await workoutApi.updateExercise(session._id, noteFor, { notes: noteText || null });
      setSession(res);
      setNoteFor(null);
      setNoteText('');
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const openReplace = (ex: SessionExercise) => {
    setReplaceFor(String(ex.exerciseId));
  };

  const doReplace = async (replacementExerciseId: string) => {
    if (!session || !replaceFor) return;
    try {
      const res = await workoutApi.updateExercise(session._id, replaceFor, { replaceExerciseId: replacementExerciseId });
      setSession(res);
      setReplaceFor(null);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  const finish = async () => {
    if (!session) return;
    Alert.alert(
      'Finish workout?',
      `You logged ${completedSets} sets. You can still review before saving.`,
      [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            setFinishing(true);
            try {
              const result = await completeMut.mutateAsync({ sessionId: session._id, durationSeconds: elapsed });
              router.replace({
                pathname: '/workout/complete',
                params: { summary: JSON.stringify(result.summary), records: JSON.stringify(result.personalRecords) },
              });
            } catch (err) {
              Alert.alert('Error', (err as Error).message);
              setFinishing(false);
            }
          },
        },
      ]
    );
  };

  const discard = () => {
    Alert.alert('Discard workout?', 'Your logged sets for this session will be abandoned.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          if (session) {
            try {
              await workoutApi.abandon(session._id);
            } catch {
              /* ignore */
            }
          }
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Timer size={40} color={colors.accent} />
          <Text style={[typography.h3, { marginTop: 12 }]}>Preparing workout…</Text>
          <Button
            title="Start a new workout"
            onPress={() => router.replace('/(tabs)/workouts')}
            style={{ marginTop: 16, minWidth: 220 }}
            loading={activeQ.isLoading}
          />
        </View>
      </SafeAreaView>
    );
  }

  const progressPct = targetSets > 0 ? (completedSets / targetSets) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={discard} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={typography.caption}>WORKOUT IN PROGRESS</Text>
          <Text style={typography.h3} numberOfLines={1}>
            {session.title}
          </Text>
        </View>
        <View style={styles.timerBox}>
          <Timer size={13} color={colors.accent} />
          <Text style={styles.timerText}>{fmtClock(elapsed)}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: spacing.md }}>
        <ProgressBar value={progressPct} height={7} />
        <View style={styles.progressMeta}>
          <Text style={typography.caption}>
            {completedSets}/{targetSets} sets · exercise {currentIndex + 1} of {exercises.length}
          </Text>
          <Badge label={`${Math.round(progressPct)}%`} color={colors.accent} small />
        </View>
      </View>

      {/* Exercise chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {exercises.map((e, i) => {
          const done = e.sets.every((s) => s.completed);
          return (
            <TouchableOpacity
              key={String(e.exerciseId)}
              onPress={() => setCurrentIndex(i)}
              style={[
                styles.exChip,
                {
                  borderColor: i === currentIndex ? colors.accent : done ? colors.success : colors.border,
                  backgroundColor: i === currentIndex ? `${colors.accent}18` : colors.card,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: i === currentIndex ? colors.accent : done ? colors.success : colors.textSecondary,
                  fontWeight: '700',
                  fontSize: 12,
                  maxWidth: 120,
                }}
              >
                {i + 1}. {e.nameSnapshot}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {current ? (
          <Card style={styles.currentCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={typography.title} numberOfLines={2}>
                  {current.nameSnapshot}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  <Badge label={current.targetMuscle ?? 'exercise'} color={colors.accent} small />
                  <Badge label={current.equipment ?? '—'} color="#5AC8FA" small />
                  {current.skipped ? <Badge label="skipped" color={colors.warning} small /> : null}
                </View>
              </View>
              <Animated.View style={{ transform: [{ scale: pulse }] }}>
                <Trophy size={26} color={current.sets.some((s) => s.isPR) ? colors.warning : colors.border} />
              </Animated.View>
            </View>

            {current.previousBest ? (
              <View style={styles.prevBest}>
                <Zap size={14} color={colors.warning} />
                <Text style={styles.prevBestText}>
                  Previous best: {current.previousBest.weightKg} kg × {current.previousBest.reps}
                </Text>
              </View>
            ) : (
              <Text style={[typography.caption, { marginTop: 8 }]}>First time logging this exercise — sets are pre-filled with your target.</Text>
            )}

            {/* Set table header */}
            <View style={styles.setHead}>
              <Text style={[styles.setHeadCell, { width: 34 }]}>SET</Text>
              <Text style={[styles.setHeadCell, { flex: 1, textAlign: 'center' }]}>KG</Text>
              <Text style={[styles.setHeadCell, { flex: 1, textAlign: 'center' }]}>REPS</Text>
              <Text style={[styles.setHeadCell, { width: 74, textAlign: 'right' }]}>LOG</Text>
            </View>

            {current.sets.map((set) => (
              <View key={set.setNumber} style={[styles.setRow, set.completed && styles.setRowDone]}>
                <Text style={[styles.setNum, set.completed && { color: colors.success }]}>{set.setNumber}</Text>
                <View style={styles.setInputWrap}>
                  <TextInput
                    value={String(set.weightKg)}
                    onChangeText={(t) => updateField(current, set, 'weightKg', t)}
                    keyboardType="decimal-pad"
                    style={[styles.setInput, set.completed && styles.setInputDone]}
                    editable={!set.completed}
                    selectTextOnFocus={!set.completed}
                  />
                </View>
                <View style={styles.setInputWrap}>
                  <TextInput
                    value={String(set.reps)}
                    onChangeText={(t) => updateField(current, set, 'reps', t)}
                    keyboardType="number-pad"
                    style={[styles.setInput, set.completed && styles.setInputDone]}
                    editable={!set.completed}
                    selectTextOnFocus={!set.completed}
                  />
                </View>
                <View style={{ width: 74, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => (set.completed ? void uncompleteSet(current, set) : void completeSet(current, set))}
                    disabled={savingSet === `${current.exerciseId}-${set.setNumber}`}
                    style={[
                      styles.checkBtn,
                      {
                        backgroundColor: set.completed ? colors.success : colors.accent,
                        opacity: savingSet && !set.completed ? 0.5 : 1,
                      },
                    ]}
                    testID={`complete-set-${set.setNumber}`}
                  >
                    <Check size={18} color="#101114" strokeWidth={3} />
                  </TouchableOpacity>
                  {!set.completed ? (
                    <TouchableOpacity onPress={() => void removeSet(current, set.setNumber)} style={styles.miniBtn}>
                      <Trash2 size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))}

            {/* Set actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => void addSet(current)}>
                <Plus size={15} color={colors.accent} />
                <Text style={styles.actionText}>Add set</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  setNoteFor(String(current.exerciseId));
                  setNoteText(current.notes ?? '');
                }}
              >
                <StickyNote size={15} color={colors.accent} />
                <Text style={styles.actionText}>{current.notes ? 'Edit note' : 'Note'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => void skipExercise(current)}>
                <SkipForward size={15} color={colors.warning} />
                <Text style={[styles.actionText, { color: colors.warning }]}>{current.skipped ? 'Unskip' : 'Skip'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => openReplace(current)}>
                <RefreshCcw size={15} color="#5AC8FA" />
                <Text style={[styles.actionText, { color: '#5AC8FA' }]}>Replace</Text>
              </TouchableOpacity>
            </View>

            {current.notes ? (
              <View style={styles.notePreview}>
                <Text style={typography.caption}>NOTE</Text>
                <Text style={[typography.body, { marginTop: 2 }]}>{current.notes}</Text>
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomBar}>
        <Button
          title="Previous"
          variant="secondary"
          icon={ChevronLeft}
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          style={{ flex: 1 }}
        />
        {currentIndex < exercises.length - 1 ? (
          <Button
            title="Next exercise"
            onPress={() => setCurrentIndex((i) => i + 1)}
            iconRight={ChevronLeft}
            style={{ flex: 1.4 }}
            testID="next-exercise"
          />
        ) : (
          <Button title="Finish workout" onPress={finish} loading={finishing} icon={Check} style={{ flex: 1.4 }} testID="finish-workout" />
        )}
      </View>

      {/* Rest timer */}
      <RestTimer
        visible={restVisible}
        initialSeconds={restSeconds}
        onFinish={() => setRestVisible(false)}
        onSkip={() => setRestVisible(false)}
      />

      {/* Note modal */}
      {noteFor ? (
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setNoteFor(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard} onPress={() => undefined}>
            <Text style={typography.h3}>Exercise note</Text>
            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="e.g. Felt strong, elbow fine with lighter grip"
              placeholderTextColor={colors.textSecondary}
              multiline
              style={styles.noteInput}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button title="Cancel" variant="secondary" onPress={() => setNoteFor(null)} style={{ flex: 1 }} />
              <Button title="Save note" onPress={() => void saveNote()} style={{ flex: 1 }} />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}

      {/* Replace exercise picker */}
      {replaceFor ? <ReplacePicker currentId={replaceFor} onClose={() => setReplaceFor(null)} onPick={(x) => void doReplace(x)} /> : null}
    </SafeAreaView>
  );
}

function ReplacePicker({
  currentId,
  onClose,
  onPick,
}: {
  currentId: string;
  onClose: () => void;
  onPick: (exerciseId: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const listQuery = useExerciseList(search);

  return (
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
      <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxHeight: '75%' }]} onPress={() => undefined}>
        <Text style={typography.h3}>Replace exercise</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search exercise…"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
        <ScrollView style={{ maxHeight: 340 }}>
          {listQuery.map((ex) => (
            <TouchableOpacity
              key={ex._id}
              style={[styles.replaceRow, selected === ex._id && { borderColor: colors.accent }]}
              onPress={() => setSelected(ex._id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.body, { fontWeight: '600', flex: 1 }]}>
                  {ex.name}
                </Text>
                <Text style={typography.caption}>
                  {ex.targetMuscle} · {ex.equipment}
                </Text>
              </View>
              {selected === ex._id ? <Check size={18} color={colors.accent} /> : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <Button title="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button title="Replace" disabled={!selected || selected === currentId} onPress={() => selected && onPick(selected)} style={{ flex: 1 }} />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function useExerciseList(search: string): Exercise[] {
  const q = useExercises({ search: search || undefined, limit: 25 });
  return q.data?.items ?? [];
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${colors.accent}16`,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
  },
  timerText: { color: colors.accent, fontWeight: '800', fontSize: 13, fontVariant: ['tabular-nums'] },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  chipRow: { gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  exChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    maxWidth: 150,
  },
  scroll: { padding: spacing.md, paddingTop: 4, paddingBottom: 24 },
  currentCard: { paddingBottom: spacing.md },
  prevBest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: `${colors.warning}14`,
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: `${colors.warning}44`,
  },
  prevBestText: { color: colors.warning, fontSize: 12.5, fontWeight: '700' },
  setHead: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setHeadCell: { fontSize: 11, fontWeight: '800', color: colors.textSecondary, letterSpacing: 0.8 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.border}66`,
  },
  setRowDone: { backgroundColor: `${colors.success}0D` },
  setNum: { width: 34, textAlign: 'center', fontWeight: '800', color: colors.textSecondary, fontSize: 15 },
  setInputWrap: { flex: 1, alignItems: 'center' },
  setInput: {
    width: 76,
    textAlign: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    paddingVertical: 8,
    fontVariant: ['tabular-nums'],
  },
  setInputDone: { borderColor: `${colors.success}66`, color: colors.success, backgroundColor: `${colors.success}12` },
  checkBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBtn: {
    width: 30,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: 6 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { fontSize: 11, fontWeight: '700', color: colors.accent },
  notePreview: {
    marginTop: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bottomBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(16,17,20,0.88)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 18,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  noteInput: {
    minHeight: 100,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  replaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    backgroundColor: colors.card,
    gap: 8,
  },
});
