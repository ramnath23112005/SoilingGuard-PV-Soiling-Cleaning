import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Heart, Clock, Flame, Layers, ChevronRight, Dumbbell } from 'lucide-react-native';
import { Button, Card, Badge, ErrorState, SectionHeader, Divider, ChipRow, Chip } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { useProgram, useStartWorkout, useFavorites, useToggleFavorite, useActiveWorkout } from '../../hooks/queries';
import type { ProgramExerciseRef } from '../../types';

function exName(ref: ProgramExerciseRef): string {
  return typeof ref.exerciseId === 'object' ? ref.exerciseId.name : 'Exercise';
}
function exId(ref: ProgramExerciseRef): string {
  return typeof ref.exerciseId === 'object' ? ref.exerciseId._id : ref.exerciseId;
}
function exMeta(ref: ProgramExerciseRef): { muscle: string; difficulty?: string } {
  return typeof ref.exerciseId === 'object'
    ? { muscle: ref.exerciseId.targetMuscle, difficulty: ref.exerciseId.difficulty }
    : { muscle: '' };
}

export default function ProgramDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const programQ = useProgram(id);
  const start = useStartWorkout();
  const favoritesQ = useFavorites();
  const toggleFav = useToggleFavorite();
  const activeQ = useActiveWorkout();

  const program = programQ.data;
  const favoriteId = favoritesQ.data?.favorites.find((f) => f.itemType === 'program' && f.itemId === id)?.id ?? null;

  const onStart = async () => {
    if (activeQ.data) {
      Alert.alert('Workout already active', 'You have a workout in progress. Resume it or finish it first.', [
        { text: 'Open active', onPress: () => router.push('/workout/active') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    try {
      const res = await start.mutateAsync({ programId: id });
      router.push({ pathname: '/workout/active', params: { sessionId: res.session._id } });
    } catch (err) {
      Alert.alert('Could not start', (err as Error).message);
    }
  };

  if (programQ.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (programQ.isError || !program) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={(programQ.error as Error)?.message ?? 'Program not found.'} onRetry={() => void programQ.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.hero}>
          {program.coverImage ? (
            <Image source={{ uri: program.coverImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <View style={styles.heroOverlay} />
          <View style={styles.heroTop}>
            <TouchableOpacityBtn onPress={() => router.back()} icon={<ArrowLeft size={20} color="#fff" />} />
            <TouchableOpacityBtn
              onPress={() => toggleFav.mutate({ itemType: 'program', itemId: id, existingFavoriteId: favoriteId })}
              icon={<Heart size={20} color={favoriteId ? colors.error : '#fff'} fill={favoriteId ? colors.error : 'transparent'} />}
            />
          </View>
          <View style={styles.heroContent}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Badge label={program.difficulty} color={program.difficulty === 'beginner' ? colors.success : program.difficulty === 'advanced' ? colors.error : colors.warning} />
              <Badge label={`${program.weeklyFrequency}×/week`} color={colors.accent} />
            </View>
            <Text style={styles.heroTitle}>{program.name}</Text>
          </View>
        </View>

        <View style={{ padding: spacing.md }}>
          <View style={styles.statRow}>
            <HeroStat icon={Clock} value={`${program.durationMinutes}`} label="minutes" />
            <HeroStat icon={Layers} value={`${program.exercises.length}`} label="exercises" />
            <HeroStat icon={Flame} value={`${program.estimatedCalories}`} label="kcal est." />
          </View>

          <Card style={{ marginTop: spacing.md }}>
            <Text style={typography.secondary}>{program.description}</Text>
            <Divider style={{ marginVertical: spacing.md }} />
            <Text style={typography.caption}>TARGET MUSCLES</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {program.targetMuscleGroups.map((m) => (
                <Badge key={m} label={m} color={colors.accent} small />
              ))}
            </View>
            <Text style={[typography.caption, { marginTop: spacing.md }]}>EQUIPMENT</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {program.equipment.map((m) => (
                <Badge key={m} label={m} color="#5AC8FA" small />
              ))}
            </View>
          </Card>

          <SectionHeader title="Exercises" />
          {program.exercises
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((ref, i) => {
              const meta = exMeta(ref);
              return (
                <Card key={`${exId(ref)}-${i}`} style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.orderBox}>
                      <Text style={styles.orderText}>{i + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={typography.h3} numberOfLines={1}>
                        {exName(ref)}
                      </Text>
                      <Text style={typography.secondary}>
                        {ref.sets} sets × {ref.reps} reps · rest {ref.restSeconds}s
                      </Text>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </View>
                </Card>
              );
            })}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Button
          title={start.isPending ? 'Starting…' : 'Start this program'}
          icon={Play}
          size="lg"
          onPress={onStart}
          loading={start.isPending}
          style={{ flex: 1 }}
          testID="start-program"
        />
      </View>
    </SafeAreaView>
  );
}

function TouchableOpacityBtn({ onPress, icon }: { onPress: () => void; icon: React.ReactNode }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.heroBtn} activeOpacity={0.8}>
      {icon}
    </TouchableOpacity>
  );
}

function HeroStat({ icon: Icon, value, label }: { icon: React.ComponentType<{ size?: number; color?: string }>; value: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <Icon size={17} color={colors.accent} />
      <Text style={styles.heroStatValue}>{value}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { height: 250, backgroundColor: colors.backgroundSecondary, justifyContent: 'space-between' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16,17,20,0.55)' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  heroBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(16,17,20,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroContent: { padding: spacing.md },
  heroTitle: { fontSize: 28, fontWeight: '900', color: '#fff', marginTop: spacing.sm, letterSpacing: -0.6 },
  statRow: { flexDirection: 'row', gap: spacing.sm, marginTop: -28, position: 'relative' },
  heroStat: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm + 2,
    alignItems: 'center',
  },
  heroStatValue: { fontSize: 19, fontWeight: '800', color: colors.text, marginTop: 4 },
  heroStatLabel: { fontSize: 11, color: colors.textSecondary },
  orderBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: `${colors.accent}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: 28,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
  },
});
