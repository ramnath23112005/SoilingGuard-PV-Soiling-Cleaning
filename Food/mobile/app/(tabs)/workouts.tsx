import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Dumbbell, X, Heart, ListFilter } from 'lucide-react-native';
import { Chip, ChipRow, EmptyState, ErrorState, SectionHeader, Button, Badge } from '../../components/ui';
import { ProgramCard, ExerciseCard } from '../../components/cards';
import { colors, spacing, typography } from '../../constants/theme';
import { usePrograms, useExercises, useFavorites, useToggleFavorite } from '../../hooks/queries';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'abs'];
const CATEGORIES = [
  'full body',
  'weight loss',
  'muscle building',
  'strength training',
  'home workouts',
  'gym workouts',
  'core training',
];

function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function WorkoutsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<'programs' | 'exercises'>('programs');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [muscle, setMuscle] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const query = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      difficulty: difficulty ?? undefined,
      muscle: muscle ?? undefined,
      category: category ?? undefined,
    }),
    [page, debouncedSearch, difficulty, muscle, category]
  );

  const programsQ = usePrograms(tab === 'programs' ? query : { limit: 1 }, { enabled: tab === 'programs' });
  const exercisesQ = useExercises(tab === 'exercises' ? query : { limit: 1 }, { enabled: tab === 'exercises' });
  const favoritesQ = useFavorites();
  const toggleFav = useToggleFavorite();

  const active = tab === 'programs' ? programsQ : exercisesQ;
  const programs = programsQ.data?.items ?? [];
  const exercises = exercisesQ.data?.items ?? [];
  const hasFilters = !!(search || difficulty || muscle || category);

  const clearFilters = () => {
    setSearch('');
    setDifficulty(null);
    setMuscle(null);
    setCategory(null);
    setPage(1);
  };

  const programFavId = (id: string) =>
    favoritesQ.data?.favorites.find((f) => f.itemType === 'program' && f.itemId === id)?.id ?? null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
        <Text style={typography.title}>Library</Text>
        <Text style={[typography.secondary, { marginTop: 2 }]}>Programs and exercises for every level</Text>

        {/* Tabs */}
        <View style={styles.segment}>
          {(['programs', 'exercises'] as const).map((t) => (
            <Text
              key={t}
              onPress={() => {
                setTab(t);
                setPage(1);
              }}
              style={[styles.segmentItem, tab === t && styles.segmentActive]}
            >
              {t === 'programs' ? 'Programs' : 'Exercises'}
            </Text>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={18} color={colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={(t) => {
              setSearch(t);
              setPage(1);
            }}
            placeholder={tab === 'programs' ? 'Search programs…' : 'Search exercises…'}
            placeholderTextColor={colors.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {search ? (
            <X size={16} color={colors.textSecondary} onPress={() => setSearch('')} />
          ) : null}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: 6 }}>
          {tab === 'programs'
            ? DIFFICULTIES.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  selected={difficulty === d}
                  onPress={() => {
                    setDifficulty(difficulty === d ? null : d);
                    setPage(1);
                  }}
                />
              ))
            : MUSCLES.map((m) => (
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
          {hasFilters ? <Chip label="Clear ✕" selected color={colors.error} onPress={clearFilters} /> : null}
        </ScrollView>

        {tab === 'programs' ? (
          <ChipRow style={{ paddingBottom: 6 }}>
            {CATEGORIES.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={category === c}
                onPress={() => {
                  setCategory(category === c ? null : c);
                  setPage(1);
                }}
              />
            ))}
          </ChipRow>
        ) : (
          <ChipRow style={{ paddingBottom: 6 }}>
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={difficulty === d}
                onPress={() => {
                  setDifficulty(difficulty === d ? null : d);
                  setPage(1);
                }}
              />
            ))}
          </ChipRow>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={active.isRefetching}
            onRefresh={() => void active.refetch()}
            tintColor={colors.accent}
          />
        }
      >
        {active.isLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 60 }} />
        ) : active.isError ? (
          <ErrorState message={(active.error as Error)?.message ?? 'Could not load content.'} onRetry={() => void active.refetch()} />
        ) : tab === 'programs' ? (
          programs.length === 0 ? (
            <EmptyState icon={Dumbbell} title="No programs found" message="Adjust your filters or search for something else." actionTitle="Clear filters" onAction={clearFilters} />
          ) : (
            <>
              {programs.map((p) => (
                <ProgramCard
                  key={p._id}
                  program={p}
                  favoriteId={programFavId(p._id)}
                  onPress={() => router.push(`/program/${p._id}`)}
                  onToggleFavorite={
                    toggleFav.isPending
                      ? undefined
                      : () => toggleFav.mutate({ itemType: 'program', itemId: p._id, existingFavoriteId: programFavId(p._id) })
                  }
                />
              ))}
              {programsQ.data?.meta.hasNext ? (
                <Button title="Load more" variant="secondary" onPress={() => setPage((p) => p + 1)} style={{ marginBottom: spacing.lg }} />
              ) : null}
            </>
          )
        ) : exercises.length === 0 ? (
          <EmptyState icon={Search} title="No exercises found" message="Try a different muscle group, equipment or search term." actionTitle="Clear filters" onAction={clearFilters} />
        ) : (
          <>
            {exercises.map((e) => (
              <ExerciseCard key={e._id} exercise={e} onPress={() => router.push(`/exercise/${e._id}`)} />
            ))}
            {exercisesQ.data?.meta.hasNext ? (
              <Button title="Load more" variant="secondary" onPress={() => setPage((p) => p + 1)} style={{ marginBottom: spacing.lg }} />
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingTop: spacing.sm, paddingBottom: 40 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentItem: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 9,
    borderRadius: 9,
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13,
    overflow: 'hidden',
  },
  segmentActive: { backgroundColor: colors.accent, color: '#101114' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 44,
    marginTop: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, height: '100%' },
});
