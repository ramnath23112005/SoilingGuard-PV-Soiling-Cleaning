import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dumbbell, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/auth';
import { ApiClientError } from '../../services/api';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password);
      router.replace('/');
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Unable to log in right now.';
      Alert.alert('Sign in failed', msg);
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.logoBox}>
            <View style={styles.logoIcon}>
              <Dumbbell size={34} color={colors.accent} strokeWidth={2.4} />
            </View>
            <Text style={styles.brand}>FitTrack</Text>
            <Text style={styles.tagline}>Smart training. Real progress.</Text>
          </View>

          <Text style={[typography.h1, { marginBottom: spacing.lg }]}>Welcome back</Text>

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
                testID="login-email"
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
                placeholder="Your password"
                secureTextEntry={!showPassword}
                leftIcon={Lock}
                error={errors.password?.message}
                testID="login-password"
              />
            )}
          />

          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.showRow}>
            {showPassword ? <EyeOff size={15} color={colors.textSecondary} /> : <Eye size={15} color={colors.textSecondary} />}
            <Text style={styles.showText}>{showPassword ? 'Hide password' : 'Show password'}</Text>
          </TouchableOpacity>

          <Button title="Sign in" onPress={onSubmit} loading={isSubmitting} size="lg" iconRight={ArrowRight} testID="login-submit" />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'center', marginTop: spacing.md }}>
            <Text style={styles.link}>Forgot password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={typography.secondary}>New to FitTrack? </Text>
            <Link href="/(auth)/register" replace>
              <Text style={styles.link}>Create an account</Text>
            </Link>
          </View>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Dev account</Text>
            <Text style={styles.demoText}>demo@fittrack.app · Demo123!</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, flexGrow: 1, justifyContent: 'center' },
  logoBox: { alignItems: 'center', marginBottom: spacing.xl },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: `${colors.accent}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: `${colors.accent}44`,
  },
  brand: { fontSize: 30, fontWeight: '900', color: colors.text, letterSpacing: -0.8 },
  tagline: { ...typography.secondary, marginTop: 4 },
  showRow: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginBottom: spacing.md, marginTop: -6 },
  showText: { color: colors.textSecondary, fontSize: 13 },
  link: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  demoBox: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  demoTitle: { fontSize: 11, fontWeight: '800', color: colors.warning, textTransform: 'uppercase', letterSpacing: 1 },
  demoText: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
