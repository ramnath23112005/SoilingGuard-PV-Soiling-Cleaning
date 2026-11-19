import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, User } from 'lucide-react-native';
import { Button, Card, Input, Chip, SectionHeader } from '../components/ui';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthStore } from '../store/auth';
import { profileApi } from '../services/endpoints';

const GENDERS = ['male', 'female', 'other'] as const;
const LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [dob, setDob] = useState(user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
  const [gender, setGender] = useState(user?.gender ?? profile?.preferences?.[0] ?? '');
  const [level, setLevel] = useState(user?.experienceLevel ?? profile?.experienceLevel ?? 'beginner');
  const [height, setHeight] = useState(profile?.heightCm != null ? String(profile.heightCm) : '');
  const [weight, setWeight] = useState(profile?.weightKg != null ? String(profile.weightKg) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setError('');
    if (!fullName.trim()) {
      setError('Name is required.');
      return;
    }
    setSaving(true);
    try {
      const me = await profileApi.updateMe({
        fullName: fullName.trim(),
        dateOfBirth: dob || undefined,
        gender: gender || undefined,
        experienceLevel: level,
      });
      const updatedUser = (me as { user?: typeof user }).user;
      if (updatedUser) setUser(updatedUser);

      const nextProfile = await profileApi.update({
        heightCm: height ? Number(height) : undefined,
        weightKg: weight ? Number(weight) : undefined,
        experienceLevel: level,
      });
      setProfile(nextProfile);

      Alert.alert('Saved', 'Your profile has been updated.');
      router.back();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={typography.h1}>Edit profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}>
        <Card style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <View style={styles.avatar}>
            <User size={36} color={colors.accent} />
          </View>
          <Text style={[typography.h3, { marginTop: spacing.sm }]}>{user?.fullName}</Text>
          <Text style={typography.secondary}>{user?.email}</Text>
        </Card>

        <SectionHeader title="Personal details" />
        <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Your name" />
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" editable={false} />
        <Input label="Date of birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} placeholder="1995-06-15" autoCapitalize="none" />

        <Text style={styles.fieldLabel}>Gender</Text>
        <View style={styles.chipWrap}>
          {GENDERS.map((g) => (
            <Chip key={g} label={g} selected={gender === g} onPress={() => setGender(g === gender ? '' : g)} />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Experience level</Text>
        <View style={styles.chipWrap}>
          {LEVELS.map((l) => (
            <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>

        <SectionHeader title="Body metrics" />
        <Input label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="175" />
        <Input label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" placeholder="72.5" />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Save changes"
          icon={Save}
          onPress={() => void save()}
          loading={saving}
          style={{ marginTop: spacing.sm }}
          testID="save-profile"
        />
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
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.accent}18`,
    borderWidth: 2,
    borderColor: `${colors.accent}44`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { ...typography.secondary, marginBottom: 8, fontWeight: '600' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  error: { color: colors.error, fontSize: 13, marginBottom: 8 },
});
