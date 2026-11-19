import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Bell,
  LogOut,
  Trash2,
  KeyRound,
  LifeBuoy,
  Trophy,
  Target,
} from 'lucide-react-native';
import { Button, Card, Input, Divider, SectionHeader, Badge } from '../components/ui';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthStore } from '../store/auth';
import { authApi, profileApi } from '../services/endpoints';

export default function SettingsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const refreshMe = useAuthStore((s) => s.refreshMe);

  const [showPassword, setShowPassword] = useState(params.tab === 'password');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const changePassword = async () => {
    setPwError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('Fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await authApi.changePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      Alert.alert('Password updated', 'Use your new password next time you sign in.');
    } catch (err) {
      setPwError((err as Error).message);
    } finally {
      setSavingPw(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your profile, workouts and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileApi.deleteMe();
              await logout(false);
              router.replace('/(auth)/login');
            } catch (err) {
              Alert.alert('Error', (err as Error).message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={typography.h1}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}>
        {/* Account */}
        <SectionHeader title="Account" />
        <Card style={{ padding: 0 }}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/edit-profile')}>
            <View style={styles.menuIcon}>
              <User size={17} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.body}>Edit profile</Text>
              <Text style={typography.caption}>{user?.email}</Text>
            </View>
            <Badge label={user?.role ?? 'user'} color={user?.role === 'admin' ? colors.warning : colors.accent} small />
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.menuRow} onPress={() => setShowPassword((v) => !v)}>
            <View style={styles.menuIcon}>
              <KeyRound size={17} color={colors.accent} />
            </View>
            <Text style={[typography.body, { flex: 1 }]}>Change password</Text>
            <ChevronRight size={18} color={colors.textSecondary} style={{ transform: [{ rotate: showPassword ? '90deg' : '0deg' }] }} />
          </TouchableOpacity>
          {showPassword ? (
            <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md }}>
              <Input label="Current password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder="••••••••" />
              <Input label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder="Min 8 characters" />
              <Input label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Repeat new password" />
              {pwError ? <Text style={styles.error}>{pwError}</Text> : null}
              <Button
                title="Update password"
                onPress={() => void changePassword()}
                loading={savingPw}
                testID="update-password"
                style={{ marginTop: 4 }}
              />
            </View>
          ) : null}
        </Card>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <Card style={{ padding: 0 }}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/notifications')}>
            <View style={styles.menuIcon}>
              <Bell size={17} color={colors.accent} />
            </View>
            <Text style={[typography.body, { flex: 1 }]}>Notifications</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/goals')}>
            <View style={styles.menuIcon}>
              <Target size={17} color={colors.accent} />
            </View>
            <Text style={[typography.body, { flex: 1 }]}>Goals</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/records')}>
            <View style={styles.menuIcon}>
              <Trophy size={17} color={colors.accent} />
            </View>
            <Text style={[typography.body, { flex: 1 }]}>Personal records</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/help')}>
            <View style={styles.menuIcon}>
              <LifeBuoy size={17} color={colors.accent} />
            </View>
            <Text style={[typography.body, { flex: 1 }]}>Help & support</Text>
            <ChevronRight size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Danger zone */}
        <SectionHeader title="Danger zone" />
        <Button title="Log out" variant="secondary" icon={LogOut} onPress={confirmLogout} testID="settings-logout" />
        <Button title="Delete account" variant="danger" icon={Trash2} onPress={confirmDelete} style={{ marginTop: spacing.sm }} testID="delete-account" />

        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.lg }]}>FitTrack v1.0.0</Text>
      </ScrollView>
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: `${colors.accent}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: colors.error, fontSize: 13, marginBottom: 8 },
});
