import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';

/** Central entry: routes based on auth + onboarding status. */
export default function Index() {
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') return <Redirect href="/(auth)/login" />;
  if (!profile?.onboardingCompleted) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
