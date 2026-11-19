import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, Target, CalendarDays } from 'lucide-react-native';
import { Button, Card, Input, Chip, ChipRow, ErrorState, EmptyState, CardSkeleton, Badge, SectionHeader, ProgressBar } from '../components/ui';
import { GoalCard } from '../components/cards';
import { colors, spacing, typography } from '../constants/theme';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from '../hooks/queries';
import type { FitnessGoal } from '../types';

const GOAL_TYPES = [
  { key: 'weight_loss', unit: 'kg', label: 'Weight loss' },
  { key: 'muscle_gain', unit: 'kg', label: 'Muscle gain' },
  { key: 'workouts_per_week', unit: 'sessions', label: 'Workouts / week' },
  { key: 'run_distance', unit: 'km', label: 'Run distance' },
  { key: 'custom', unit: 'units', label: 'Custom' },
] as const;

export default function GoalsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ status?: string }>();
  const [statusFilter, setStatusFilter] = useState<string>(params.status ?? 'active');
  const goalsQ = useGoals(statusFilter === 'all' ? undefined : statusFilter);
  const createMut = useCreateGoal();
  const updateMut = useUpdateGoal();
  const deleteMut = useDeleteGoal();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<FitnessGoal | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<string>('workouts_per_week');
  const [targetValue, setTargetValue] = useState('');
  const [currentValue, setCurrentValue] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setTitle('');
    setDescription('');
    setGoalType('workouts_per_week');
    setTargetValue('');
    setCurrentValue('0');
    setTargetDate('');
    setFormError('');
    setEditorOpen(true);
  };

  const openEdit = (goal: FitnessGoal) => {
    setEditing(goal);
    setTitle(goal.title);
    setDescription(goal.description ?? '');
    setGoalType(goal.goalType);
    setTargetValue(String(goal.targetValue));
    setCurrentValue(String(goal.currentValue));
    setTargetDate(goal.targetDate ? goal.targetDate.slice(0, 10) : '');
    setFormError('');
    setEditorOpen(true);
  };

  const save = async () => {
    if (!title.trim()) {
      setFormError('Give your goal a title.');
      return;
    }
    const tv = Number(targetValue);
    if (Number.isNaN(tv) || tv <= 0) {
      setFormError('Target must be a positive number.');
      return;
    }
    const cv = Number(currentValue || '0');
    const payload: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim() || undefined,
      goalType,
      targetValue: tv,
      currentValue: Number.isNaN(cv) ? 0 : cv,
      unit: GOAL_TYPES.find((g) => g.key === goalType)?.unit ?? 'units',
      targetDate: targetDate || undefined,
    };
    try {
      if (editing) {
        await updateMut.mutateAsync({ id: editing._id, body: payload });
      } else {
        await createMut.mutateAsync(payload);
      }
      setEditorOpen(false);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const confirmDelete = (goal: FitnessGoal) => {
    Alert.alert('Delete goal?', `“${goal.title}” will be removed permanently.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteMut.mutateAsync(goal._id) },
    ]);
  };

  const completeGoal = async (goal: FitnessGoal) => {
    try {
      await updateMut.mutateAsync({
        id: goal._id,
        body: { status: 'completed', currentValue: goal.targetValue },
      });
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={typography.h1}>Goals</Text>
        <TouchableOpacity onPress={openCreate} style={styles.iconBtn} testID="add-goal">
          <Plus size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ChipRow style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        {['active', 'completed', 'failed', 'all'].map((s) => (
          <Chip key={s} label={s} selected={statusFilter === s} onPress={() => setStatusFilter(s)} />
        ))}
      </ChipRow>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}>
        {goalsQ.isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : goalsQ.isError ? (
          <ErrorState message={(goalsQ.error as Error)?.message} onRetry={() => void goalsQ.refetch()} />
        ) : !goalsQ.data?.length ? (
          <EmptyState
            icon={Target}
            title="No goals yet"
            message="Set a target — workouts per week, a bodyweight goal, or anything measurable — and track it here."
            actionTitle="Create your first goal"
            onAction={openCreate}
          />
        ) : (
          goalsQ.data.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onEdit={() => openEdit(goal)}
              onDelete={() => confirmDelete(goal)}
              onPress={() => (goal.status === 'active' ? completeGoal(goal) : undefined)}
            />
          ))
        )}

        {goalsQ.data && goalsQ.data.length > 0 && statusFilter === 'active' ? (
          <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.md }]}>Tap a goal to mark it complete.</Text>
        ) : null}
      </ScrollView>

      {/* Create / edit modal */}
      <Modal visible={editorOpen} animationType="slide" transparent onRequestClose={() => setEditorOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={typography.h2}>{editing ? 'Edit goal' : 'New goal'}</Text>
              <View style={{ marginTop: spacing.md }}>
                <Input label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Train 4× per week" />
                <Input label="Description (optional)" value={description} onChangeText={setDescription} placeholder="Why this matters" multiline />
                <Text style={styles.fieldLabel}>Type</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
                  {GOAL_TYPES.map((g) => (
                    <Chip key={g.key} label={g.label} selected={goalType === g.key} onPress={() => setGoalType(g.key)} />
                  ))}
                </View>
                <Input label="Target value" value={targetValue} onChangeText={setTargetValue} keyboardType="decimal-pad" placeholder="e.g. 12" />
                <Input label="Current value" value={currentValue} onChangeText={setCurrentValue} keyboardType="decimal-pad" placeholder="0" />
                <Input label="Target date (YYYY-MM-DD, optional)" value={targetDate} onChangeText={setTargetDate} placeholder="2026-12-31" autoCapitalize="none" />
                {formError ? <Text style={styles.formError}>{formError}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm, marginBottom: spacing.md }}>
                <Button title="Cancel" variant="secondary" onPress={() => setEditorOpen(false)} style={{ flex: 1 }} />
                <Button
                  title={editing ? 'Save changes' : 'Create goal'}
                  onPress={() => void save()}
                  loading={createMut.isPending || updateMut.isPending}
                  style={{ flex: 1.3 }}
                  testID="save-goal"
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  modalBackdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldLabel: { ...typography.secondary, marginBottom: 6, fontWeight: '600' },
  formError: { color: colors.error, fontSize: 13, marginBottom: 8 },
});
