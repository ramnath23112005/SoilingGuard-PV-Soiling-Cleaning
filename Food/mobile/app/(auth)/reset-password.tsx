import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, Card } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { authApi } from '../../services/endpoints';
import { ApiClientError } from '../../services/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const [token, setToken] = useState(params.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ token?: string; password?: string; confirm?: string }>({});

  const submit = async () => {
    const next: typeof errors = {};
    if (!token.trim()) next.token = 'Reset token is required';
    if (password.length < 8) next.password = 'At least 8 characters';
    else if (!/[0-9]/.test(password)) next.password = 'Include at least one number';
    if (password !== confirm) next.confirm = 'Passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await authApi.resetPassword(token.trim(), password, confirm);
      setDone(true);
    } catch (err) {
      Alert.alert('Reset failed', err instanceof ApiClientError ? err.message : 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.doneBox}>
          <CheckCircle2 size={54} color={colors.success} />
          <Text style={[typography.h1, { marginTop: spacing.md }]}>Password updated</Text>
          <Text style={[typography.secondary, { textAlign: 'center', marginTop: 8 }]}>
            Your password has been changed. Sign in with your new credentials.
          </Text>
          <Button title="Go to sign in" size="lg" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.lg, minWidth: 220 }} />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[typography.h1, { marginTop: spacing.md }]}>Choose a new password</Text>
        {params.email ? (
          <Text style={[typography.secondary, { marginTop: 6, marginBottom: spacing.lg }]}>For {params.email}</Text>
        ) : (
          <View style={{ height: spacing.lg }} />
        )}

        <Input
          label="Reset token"
          value={token}
          onChangeText={setToken}
          placeholder="Paste the token from your email"
          autoCapitalize="none"
          error={errors.token}
        />
        <Input
          label="New password"
          value={password}
          onChangeText={setPassword}
          placeholder="Min. 8 characters"
          secureTextEntry
          leftIcon={Lock}
          error={errors.password}
        />
        <Input
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repeat new password"
          secureTextEntry
          leftIcon={Lock}
          error={errors.confirm}
        />
        <Button title="Update password" onPress={submit} loading={loading} size="lg" testID="reset-submit" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  doneBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
});
