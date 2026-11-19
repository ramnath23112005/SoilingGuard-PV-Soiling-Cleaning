import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, LifeBuoy, Mail, MessageCircle, BookOpen } from 'lucide-react-native';
import { Card, SectionHeader, Badge } from '../components/ui';
import { colors, spacing, typography } from '../constants/theme';

const FAQS = [
  {
    q: 'How do I start a workout?',
    a: 'Open the Workouts tab, pick a program and tap “Start this program”. You can also start a free-form workout from the same screen.',
  },
  {
    q: 'How are personal records detected?',
    a: 'When you complete a set, FitTrack compares weight × reps against your previous best for that exercise. Beat it and a PR is recorded automatically.',
  },
  {
    q: 'Can I edit a set after logging it?',
    a: 'Tap the check icon again to un-complete a set, adjust weight or reps, then re-complete it. Completed sets lock the inputs until uncompleted.',
  },
  {
    q: 'What happens if I close the app mid-workout?',
    a: 'Your active session stays on the server. Reopen the app and the Home tab will offer to resume where you left off.',
  },
  {
    q: 'How is body weight tracked?',
    a: 'Progress tab → Log weight. You can also set a weight-loss or muscle-gain goal and it will update as you log weigh-ins.',
  },
  {
    q: 'Is my data private?',
    a: 'Workouts and metrics are tied to your account only. Admins cannot see your session details, only aggregate stats for platform health.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={typography.h1}>Help & support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: 4, paddingBottom: 40 }}>
        <Card style={{ borderColor: `${colors.accent}44` }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <LifeBuoy size={20} color={colors.accent} />
            <Text style={typography.h3}>Need a hand?</Text>
          </View>
          <Text style={[typography.secondary, { marginTop: 8, lineHeight: 20 }]}>
            Most answers are in the FAQ below. For account issues, reach out and we'll get back within one business day.
          </Text>
        </Card>

        <SectionHeader title="Frequently asked" />
        {FAQS.map((item, i) => {
          const open = openIndex === i;
          return (
            <Card key={item.q} style={{ marginBottom: spacing.sm, padding: 0 }}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => setOpenIndex(open ? null : i)}
                activeOpacity={0.75}
                testID={`faq-${i}`}
              >
                <Text style={[typography.body, { flex: 1, fontWeight: '600' }]}>{item.q}</Text>
                <ChevronDown
                  size={18}
                  color={colors.textSecondary}
                  style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>
              {open ? (
                <Text style={[typography.secondary, { paddingHorizontal: spacing.md, paddingBottom: spacing.md, lineHeight: 20 }]}>
                  {item.a}
                </Text>
              ) : null}
            </Card>
          );
        })}

        <SectionHeader title="Contact" />
        <Card style={{ padding: 0 }}>
          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:support@fittrack.app')}
          >
            <Mail size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={typography.body}>Email support</Text>
              <Text style={typography.caption}>support@fittrack.app</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('https://fittrack.app/help')}>
            <BookOpen size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={typography.body}>Knowledge base</Text>
              <Text style={typography.caption}>fittrack.app/help</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL('https://fittrack.app/feedback')}>
            <MessageCircle size={18} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={typography.body}>Send feedback</Text>
              <Text style={typography.caption}>Ideas & feature requests</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Badge label="FitTrack v1.0.0 · build 2026.10" color={colors.textSecondary} small />
        </View>
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
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.md },
});
