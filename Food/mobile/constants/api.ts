import Constants from 'expo-constants';

/**
 * API base URL resolution:
 * 1. EXPO_PUBLIC_API_URL environment variable (recommended)
 * 2. app.json > extra.apiBaseUrl
 * 3. Android emulator: 10.0.2.2, otherwise localhost
 */
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const fromExtra = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
  if (fromExtra) return fromExtra.replace(/\/$/, '');
  return 'http://10.0.2.2:5000';
}

export const API_BASE_URL = resolveBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;
