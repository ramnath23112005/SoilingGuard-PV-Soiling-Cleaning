import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Check, User, Activity, Target, Home, CalendarClock, Timer, BicepsFlexed } from 'lucide-react-native';
import { Button, Chip, Input, ProgressBar } from '../components/ui';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthStore } from '../store/auth';
import { useSaveOnboarding } from '../hooks/queries';
import { ApiClientError } from '../services/api';

const STEPS = [
  { key: 'personal', title: 'About you', subtitle: 'Basic stats used for calories, BMI and recommendations.' },
  { key: 'experience', title: 'Your experience', subtitle: 'How long have you been training consistently?' },
  { key: 'goals', title: 'Fitness goals', subtitle: 'Pick everything that applies — programs are personalized around this.' },
  { key: 'preferences', title: 'Workout style', subtitle: 'Where and how do you like to train?' },
  { key: 'frequency', title: 'Weekly availability', subtitle: 'How many days can you commit each week?' },
  { key: 'duration', title: 'Session length', subtitle: 'Typical time you want to spend per workout.' },
  { key: 'muscles', title: 'Focus areas', subtitle: 'Which muscle groups do you want to prioritise?' },
] as const;

const GOAL_OPTIONS = ['weight loss', 'muscle building', 'strength improvement', 'general fitness', 'endurance'];
const PREF_OPTIONS = ['home workouts', 'gym workouts', 'bodyweight exercises', 'equipment-based workouts'];
const DAY_OPTIONS = [2, 3, 4, 5, 6];
const TIME_OPTIONS = [15, 30, 45, 60];
const MUSCLE_OPTIONS = ['chest', 'back', 'shoulders', 'arms', 'legs', 'abs', 'full body'];
const MUSCLE_MAP: Record<string, string[]> = {
  arms: ['biceps', 'triceps'],
  legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
};

export default function OnboardingScreen() {
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const save = useSaveOnboarding();

  const [step, setStep] = useState(0);
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [height, setHeight] = useState(profile?.heightCm ? String(profile.heightCm) : '');
  const [weight, setWeight] = useState(profile?.weightKg ? String(profile.weightKg) : '');
  const [experience, setExperience] = useState<string>(profile?.experienceLevel ?? 'beginner');
  const [goals, setGoals] = useState<string[]>(profile?.goals?.length ? profile.goals : []);
  const [prefs, setPrefs] = useState<string[]>(profile?.preferences?.length ? profile.preferences : ['gym workouts']);
  const [days, setDays] = useState<number>(profile?.daysPerWeek ?? 4);
  const [minutes, setMinutes] = useState<number>(profile?.sessionMinutes ?? 45);
  const [muscles, setMuscles] = useState<string[]>(
    profile?.targetMuscleGroups?.length
      ? MUSCLE_OPTIONS.filter((m) => {
          const mapped = MUSCLE_MAP[m] ?? [m];
          return mapped.some((x) => profile.targetMuscleGroups.includes(x)) || profile.targetMuscleGroups.includes(m);
        })
      : ['full body']
  );
  const [error, setError] = useState<string | null>(null);

  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const validateStep = (): boolean => {
    setError(null);
    if (step === 0) {
      const a = Number(age);
      const h = Number(height);
      const w = Number(weight);
      if (!age || Number.isNaN(a) || a < 10 || a > 100) return fail('Age must be between 10 and 100');
      if (!height || Number.isNaN(h) || h < 80 || h > 260) return fail('Height must be 80–260 cm');
      if (!weight || Number.isNaN(w) || w < 25 || w > 400) return fail('Weight must be 25–400 kg');
    }
    if (step === 2 && goals.length === 0) return fail('Select at least one goal');
    if (step === 3 && prefs.length === 0) return fail('Select at least one preference');
    if (step === 6 && muscles.length === 0) return fail('Pick at least one focus area');
    return true;
  };

  const fail = (msg: string) => {
    setError(msg);
    return false;
  };

  const next = async () => {
    if (!validateStep()) return;
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    const targetMuscleGroups = Array.from(
      new Set(muscles.flatMap((m) => MUSCLE_MAP[m] ?? [m]))
    );
    try {
      const updated = await save.mutateAsync({
        age: Number(age),
        heightCm: Number(height),
        weightKg: Number(weight),
        experienceLevel: experience,
        goals,
        preferences: prefs,
        daysPerWeek: days,
        sessionMinutes: minutes,
        targetMuscleGroups,
      });
      setProfile(updated);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert(
        'Could not save',
        err instanceof ApiClientError ? err.message : 'Something went wrong while saving your profile.'
      );
    }
  };

  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));
  const current = STEPS[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button title="" variant="ghost" size="sm" icon={ArrowLeft} onPress={back} style={{ width: 44, paddingHorizontal: 0 }} />
        <View style={{ flex: 1, marginHorizontal: spacing.sm }}>
          <ProgressBar value={progress} height={6} />
        </View>
        <Text style={typography.caption}>
          {step + 1}/{STEPS.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={typography.title}>{current.title}</Text>
        <Text style={[typography.secondary, { marginTop: 6, marginBottom: spacing.lg }]}>{current.subtitle}</Text>

        {step === 0 && (
          <View>
            <Input label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="29" leftIcon={User} />
            <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="174" leftIcon={Activity} />
            <Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="76" leftIcon={Activity} />
          </View>
        )}

        {step === 1 && (
          <View style={styles.stack}>
            {(
              [
                ['beginner', 'Beginner', 'New or returning after a long break.'],
                ['intermediate', 'Intermediate', 'Training regularly for 6–24 months.'],
                ['advanced', 'Advanced', '2+ years of consistent serious training.'],
              ] as const
            ).map(([value, label, desc]) => (
              <SelectCard
                key={value}
                title={label}
                description={desc}
                selected={experience === value}
                onPress={() => setExperience(value)}
              />
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.wrap}>
            {GOAL_OPTIONS.map((g) => (
              <Chip key={g} label={g} selected={goals.includes(g)} onPress={() => toggle(goals, setGoals, g)} />
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={styles.wrap}>
            {PREF_OPTIONS.map((p) => (
              <Chip key={p} label={p} selected={prefs.includes(p)} onPress={() => toggle(prefs, setPrefs, p)} />
            ))}
          </View>
        )}

        {step === 4 && (
          <View style={styles.wrap}>
            {DAY_OPTIONS.map((d) => (
              <Chip key={d} label={`${d} days`} selected={days === d} onPress={() => setDays(d)} />
            ))}
          </View>
        )}

        {step === 5 && (
          <View style={styles.stack}>
            {TIME_OPTIONS.map((t) => (
              <SelectCard
                key={t}
                title={`${t} minutes`}
                description={t <= 15 ? 'Quick and intense.' : t <= 30 ? 'Efficient full session.' : t <= 45 ? 'Balanced session.' : 'Full training day.'}
                selected={minutes === t}
                onPress={() => setMinutes(t)}
                icon={t <= 15 ? Timer : t <= 45 ? CalendarClock : BicepsFlexed}
              />
            ))}
          </View>
        )}

        {step === 6 && (
          <View style={styles.wrap}>
            {MUSCLE_OPTIONS.map((m) => (
              <Chip key={m} label={m} selected={muscles.includes(m)} onPress={() => toggle(muscles, setMuscles, m)} />
            ))}
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={step === STEPS.length - 1 ? 'Finish setup' : 'Continue'}
          onPress={next}
          loading={save.isPending}
          size="lg"
          iconRight={step === STEPS.length - 1 ? Check : ArrowRight}
          testID="onboarding-next"
        />
      </View>
    </SafeAreaView>
  );
}

function SelectCard({
  title,
  description,
  selected,
  onPress,
  icon: Icon,
}: {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.selectCard,
        {
          backgroundColor: selected ? `${colors.accent}14` : colors.card,
          borderColor: selected ? colors.accent : colors.border,
        },
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {Icon ? (
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={18} color={selected ? colors.accent : colors.textSecondary} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: selected ? colors.accent : colors.text }]}>{title}</Text>
          <Text style={[typography.secondary, { marginTop: 2 }]}>{description}</Text>
        </View>
        {selected ? <Check size={20} color={colors.accent} /> : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  stack: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { color: colors.error, marginTop: spacing.md, fontSize: 13, fontWeight: '600' },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  selectCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
});
