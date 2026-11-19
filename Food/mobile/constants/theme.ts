export const colors = {
  background: '#101114',
  backgroundSecondary: '#1B1D22',
  card: '#24272E',
  cardElevated: '#2C3038',
  accent: '#B7F34A',
  accentDim: '#8FCB35',
  text: '#FFFFFF',
  textSecondary: '#A0A4AD',
  success: '#36C98F',
  warning: '#FFB547',
  error: '#FF5C64',
  border: '#32363F',
  overlay: 'rgba(16, 17, 20, 0.85)',
  chartGrid: '#2A2E36',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  h3: { fontSize: 17, fontWeight: '600' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  secondary: { fontSize: 14, fontWeight: '400' as const, color: colors.textSecondary },
  caption: { fontSize: 12, fontWeight: '500' as const, color: colors.textSecondary },
  metric: { fontSize: 32, fontWeight: '800' as const, color: colors.text },
} as const;
