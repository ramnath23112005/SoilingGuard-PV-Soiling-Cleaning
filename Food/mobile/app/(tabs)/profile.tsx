import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Target,
  Trophy,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Pencil,
  ShieldCheck,
  Activity,
} from 'lucide-react-native';
import { Card, Button, Badge, SectionHeader, Divider } from '../../components/ui';
import { colors, spacing, typography } from '../../constants/theme';
import { useAuthStore } from '../../store/auth';
import { useProgressOverview, useNotifications } from '../../hooks/queries';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const logout = useAuthStore((s) => s.logout);
  const overviewQ = useProgressOverview(30);

  const age = user?.dateOfBirth
    ? Math.max(0, new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear())
    : profile?.age ?? '—';

  const initials = (user?.fullName ?? 'A')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          void logout().then(() => router.replace('/(auth)/login'));
        },
      },
    ]);
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete account',
      'This permanently removes your profile, workouts, goals and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            try {
              const { profileApi } = await import('../../services/endpoints');
              await profileApi.deleteMe();
              const { clearTokens } = await import('../../services/api');
              await clearTokens();
              useAuthStore.setState({ status: 'unauthenticated', user: null, profile: null });
              router.replace('/(auth)/register');
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.title}>Profile</Text>

        {/* Identity card */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={typography.h2} numberOfLines={1}>
                {user?.fullName}
              </Text>
              <Text style={typography.secondary} numberOfLines={1}>
                {user?.email}
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                <Badge label={profile?.experienceLevel ?? user?.experienceLevel ?? 'beginner'} color={colors.accent} small />
                <Badge label={`${overviewQ.data?.workouts.totalCount ?? 0} workouts`} color={colors.success} small />
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
              <Pencil size={17} color={colors.accent} />
            </TouchableOpacity>
          </View>
          <Divider style={{ marginVertical: spacing.md }} />
          <View style={styles.infoGrid}>
            <InfoCell label="Age" value={String(age)} />
            <InfoCell label="Height" value={profile?.heightCm ? `${profile.heightCm} cm` : '—'} />
            <InfoCell label="Weight" value={profile?.weightKg ? `${profile.weightKg} kg` : '—'} />
            <InfoCell label="Days/week" value={profile?.daysPerWeek ? `${profile.daysPerWeek}` : '—'} />
            <InfoCell label="Session" value={profile?.sessionMinutes ? `${profile.sessionMinutes} min` : '—'} />
            <InfoCell label="Streak" value={`${overviewQ.data?.streak ?? 0}d`} />
          </View>
        </Card>

        {/* Goals summary */}
        <SectionHeader title="My goals" actionLabel="Manage" onAction={() => router.push('/goals')} />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Target size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={typography.h3} numberOfLines={1}>
                {overviewQ.data?.activeGoals?.[0]?.title ?? profile?.goals?.[0] ?? 'Set a fitness goal'}
              </Text>
              <Text style={typography.secondary}>
                {overviewQ.data?.activeGoals?.length ?? 0} active goal(s)
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </View>
        </Card>

        {/* Menu */}
        <SectionHeader title="Settings" />
        <Card style={{ padding: 0 }}>
          <MenuRow icon={Trophy} label="Personal records" onPress={() => router.push('/records')} />
          <Divider />
          <MenuRow icon={Bell} label="Notifications" onPress={() => router.push('/notifications')} badge={String(useAuthUnread())} />
          <Divider />
          <MenuRow icon={Settings} label="Settings & privacy" onPress={() => router.push('/settings')} />
          <Divider />
          <MenuRow icon={ShieldCheck} label="Change password" onPress={() => router.push('/settings?tab=password')} />
          <Divider />
          <MenuRow icon={Activity} label="Help & support" onPress={() => router.push('/help')} />
          <Divider />
          <MenuRow icon={HelpCircle} label="About FitTrack" onPress={() => router.push('/help')} />
        </Card>

        <Button title="Log out" variant="secondary" icon={LogOut} onPress={confirmLogout} style={{ marginTop: spacing.lg }} testID="profile-logout" />
        <Button title="Delete account" variant="ghost" onPress={confirmDelete} style={{ marginTop: spacing.sm }} />

        <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.md }]}>FitTrack v1.0.0 · demo build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function useAuthUnread(): number {
  const notifQ = useNotifications(1);
  return notifQ.data?.meta?.unread ?? 0;
}

function MenuRow({
  icon: Icon,
  label,
  onPress,
  badge,
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuRow} activeOpacity={0.7}>
      <View style={styles.menuIcon}>
        <Icon size={17} color={colors.accent} />
      </View>
      <Text style={[typography.body, { flex: 1, fontWeight: '600' }]}>{label}</Text>
      {badge && badge !== '0' ? <Badge label={badge} color={colors.error} small /> : null}
      <ChevronRight size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={typography.caption}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md, paddingBottom: 48 },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 22,
    backgroundColor: `${colors.accent}22`,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '900', color: colors.accent },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  infoCell: { width: '33.33%', paddingVertical: 6 },
  infoValue: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.md, paddingVertical: 14 },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: `${colors.accent}16`,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
