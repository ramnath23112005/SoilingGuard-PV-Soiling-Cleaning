import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ChevronLeft, Send } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { authApi } from '../../services/endpoints';
import { ApiClientError } from '../../services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim().toLowerCase())) {
      setError('Enter a valid email address');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(res.devResetToken ?? null);
    } catch (err) {
      Alert.alert('Error', err instanceof ApiClientError ? err.message : 'Could not process the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Button
          title="Back"
          variant="ghost"
          size="sm"
          icon={ChevronLeft}
          onPress={() => router.back()}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
        />

        <Text style={[typography.h1, { marginTop: spacing.md }]}>Reset password</Text>
        <Text style={[typography.secondary, { marginTop: 6, marginBottom: spacing.lg }]}>
          Enter the email you registered with and we&apos;ll send a reset token.
        </Text>

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={Mail}
          error={error ?? undefined}
        />
        <Button title="Send reset link" onPress={submit} loading={loading} icon={Send} size="lg" testID="forgot-submit" />

        {sent ? (
          <Card style={{ marginTop: spacing.lg, borderColor: colors.success }}>
            <Text style={[typography.h3, { color: colors.success }]}>Reset token generated</Text>
            <Text style={[typography.secondary, { marginTop: 6 }]}>
              In production this arrives by email. In development mode use this token on the next screen:
            </Text>
            <Text style={styles.token} selectable>
              {sent}
            </Text>
            <Button
              title="Enter new password"
              variant="secondary"
              onPress={() =>
                router.push({ pathname: '/(auth)/reset-password', params: { token: sent, email } })
              }
              style={{ marginTop: spacing.sm }}
            />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  token: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    color: colors.accent,
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
});
