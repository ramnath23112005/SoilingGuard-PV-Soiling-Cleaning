import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Heart, Play, PauseCircle, TriangleAlert, Lightbulb, RefreshCw, CheckCircle2 } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { Button, Card, Badge, ErrorState, SectionHeader, Divider, Chip } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { useExercise, useFavorites, useToggleFavorite, usePrograms } from '../../hooks/queries';
import { ExerciseVideo } from '../../components/ExerciseVideo';

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const exerciseQ = useExercise(id);
  const favoritesQ = useFavorites();
  const toggleFav = useToggleFavorite();
  const relatedQ = usePrograms({ limit: 4, muscle: exerciseQ.data?.targetMuscle });

  const ex = exerciseQ.data;
  const favoriteId = favoritesQ.data?.favorites.find((f) => f.itemType === 'exercise' && f.itemId === id)?.id ?? null;

  if (exerciseQ.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }
  if (exerciseQ.isError || !ex) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState message={(exerciseQ.error as Error)?.message ?? 'Exercise not found.'} onRetry={() => void exerciseQ.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleFav.mutate({ itemType: 'exercise', itemId: id, existingFavoriteId: favoriteId })}
            style={styles.iconBtn}
          >
            <Heart size={19} color={favoriteId ? colors.error : colors.text} fill={favoriteId ? colors.error : 'transparent'} />
          </TouchableOpacity>
        </View>

        {/* Media */}
        <View style={styles.mediaBox}>
          {ex.videoUrl ? (
            <ExerciseVideo uri={ex.videoUrl} posterUri={ex.imageUrls?.[0]} />
          ) : ex.imageUrls?.[0] ? (
            <Image source={{ uri: ex.imageUrls[0] }} style={styles.mediaImg} resizeMode="cover" />
          ) : (
            <View style={[styles.mediaImg, { alignItems: 'center', justifyContent: 'center' }]}>
              <Play size={44} color={colors.accent} />
            </View>
          )}
        </View>

        <View style={{ padding: spacing.md }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Badge label={ex.targetMuscle} color={colors.accent} />
            <Badge label={ex.equipment} color="#5AC8FA" />
            <Badge
              label={ex.difficulty}
              color={ex.difficulty === 'beginner' ? colors.success : ex.difficulty === 'advanced' ? colors.error : colors.warning}
            />
          </View>
          <Text style={[typography.title, { marginTop: spacing.sm }]}>{ex.name}</Text>
          <Text style={[typography.secondary, { marginTop: 6, lineHeight: 21 }]}>{ex.description}</Text>

          {ex.secondaryMuscles.length ? (
            <View style={{ marginTop: spacing.md }}>
              <Text style={typography.caption}>SECONDARY MUSCLES</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                {ex.secondaryMuscles.map((m) => (
                  <Chip key={m} label={m} />
                ))}
              </View>
            </View>
          ) : null}

          {/* Suggested sets */}
          <View style={styles.suggestRow}>
            <View style={styles.suggestBox}>
              <Text style={styles.suggestValue}>{ex.defaultSets}</Text>
              <Text style={typography.caption}>suggested sets</Text>
            </View>
            <View style={styles.suggestBox}>
              <Text style={styles.suggestValue}>{ex.defaultReps}</Text>
              <Text style={typography.caption}>suggested reps</Text>
            </View>
            <View style={styles.suggestBox}>
              <Text style={styles.suggestValue}>{ex.caloriesPerMinute}</Text>
              <Text style={typography.caption}>kcal / min (est.)</Text>
            </View>
          </View>

          <SectionHeader title="Instructions" />
          <Card>
            {ex.instructions.map((step, i) => (
              <View key={i} style={[styles.stepRow, i === ex.instructions.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={[typography.body, { flex: 1, lineHeight: 21 }]}>{step}</Text>
              </View>
            ))}
          </Card>

          {ex.commonMistakes.length ? (
            <>
              <SectionHeader title="Common mistakes" />
              <Card style={{ borderColor: `${colors.error}55` }}>
                {ex.commonMistakes.map((m, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6 }}>
                    <TriangleAlert size={16} color={colors.error} style={{ marginTop: 2 }} />
                    <Text style={[typography.body, { flex: 1, color: colors.textSecondary, lineHeight: 20 }]}>{m}</Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          {ex.safetyTips.length ? (
            <>
              <SectionHeader title="Safety tips" />
              <Card style={{ borderColor: `${colors.success}55` }}>
                {ex.safetyTips.map((m, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, paddingVertical: 6 }}>
                    <CheckCircle2 size={16} color={colors.success} style={{ marginTop: 2 }} />
                    <Text style={[typography.body, { flex: 1, color: colors.textSecondary, lineHeight: 20 }]}>{m}</Text>
                  </View>
                ))}
              </Card>
            </>
          ) : null}

          {ex.related && ex.related.length ? (
            <>
              <SectionHeader title="Related exercises" />
              {ex.related.map((r) => (
                <Card key={r._id} style={{ marginBottom: spacing.sm }}>
                  <TouchableOpacity onPress={() => router.push(`/exercise/${r._id}`)}>
                    <Text style={typography.h3}>{r.name}</Text>
                    <Text style={[typography.secondary, { marginTop: 2 }]}>
                      {r.targetMuscle} · {r.equipment} · {r.difficulty}
                    </Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </>
          ) : null}

          <Button
            title="Find programs with this exercise"
            variant="secondary"
            icon={RefreshCw}
            onPress={() => router.push({ pathname: '/(tabs)/workouts' })}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
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
  mediaBox: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    aspectRatio: 16 / 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaImg: { width: '100%', height: '100%' },
  suggestRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  suggestBox: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
  },
  suggestValue: { fontSize: 22, fontWeight: '800', color: colors.accent },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: `${colors.accent}1E`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: { color: colors.accent, fontWeight: '800', fontSize: 13 },
});
