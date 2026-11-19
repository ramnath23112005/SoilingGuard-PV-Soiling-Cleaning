import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, ArrowRight, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Chip } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/auth';
import { ApiClientError } from '../../services/api';

const schema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(80),
    email: z.string().trim().toLowerCase().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Must include a letter')
      .regex(/[0-9]/, 'Must include a number'),
    confirmPassword: z.string(),
    dateOfBirth: z.string().optional(),
    experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [dob, setDob] = useState('');
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        dateOfBirth: dob || undefined,
        experienceLevel: experience,
      });
      router.replace('/onboarding');
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Registration failed. Try again.';
      Alert.alert('Could not register', msg);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Link href="/(auth)/login" replace style={{ marginBottom: spacing.md }}>
            <View style={styles.backRow}>
              <ChevronLeft size={20} color={colors.textSecondary} />
              <Text style={typography.secondary}>Back to sign in</Text>
            </View>
          </Link>

          <Text style={typography.h1}>Create account</Text>
          <Text style={[typography.secondary, { marginTop: 4, marginBottom: spacing.lg }]}>
            Start tracking workouts in under a minute.
          </Text>

          <Controller
            control={control}
            name="fullName"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Alex Strong"
                autoCapitalize="words"
                leftIcon={User}
                error={errors.fullName?.message}
                testID="register-name"
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={Mail}
                error={errors.email?.message}
                testID="register-email"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Min. 8 characters"
                secureTextEntry
                leftIcon={Lock}
                error={errors.password?.message}
                testID="register-password"
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Confirm password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Repeat password"
                secureTextEntry
                leftIcon={Lock}
                error={errors.confirmPassword?.message}
                testID="register-confirm"
              />
            )}
          />

          <Input label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1996-06-15" keyboardType="numbers-and-punctuation" autoCapitalize="none" />

          <Text style={[typography.secondary, { marginBottom: 8, fontWeight: '600' }]}>Fitness experience</Text>
          <View style={styles.chipRow}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <Chip
                key={level}
                label={level}
                selected={experience === level}
                onPress={() => setExperience(level)}
                color={level === 'beginner' ? colors.success : level === 'intermediate' ? colors.warning : colors.error}
              />
            ))}
          </View>

          <Button
            title="Create account"
            onPress={onSubmit}
            loading={isSubmitting}
            size="lg"
            iconRight={ArrowRight}
            style={{ marginTop: spacing.lg }}
            testID="register-submit"
          />

          <Text style={[typography.secondary, { textAlign: 'center', marginTop: spacing.md, fontSize: 12 }]}>
            By continuing you agree to store your fitness data securely on FitTrack servers.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: 48 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  chipRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
});
