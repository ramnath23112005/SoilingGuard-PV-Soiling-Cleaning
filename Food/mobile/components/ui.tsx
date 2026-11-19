import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
  ScrollView,
  KeyboardTypeOptions,
  DimensionValue,
} from 'react-native';
import { colors, spacing, radius, typography } from '../constants/theme';
import { LucideIcon } from 'lucide-react-native';

/* --------------------------------- Button -------------------------------- */

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  style,
  testID,
}: ButtonProps) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const bg: Record<string, string> = {
    primary: colors.accent,
    secondary: colors.card,
    ghost: 'transparent',
    danger: colors.error,
    outline: 'transparent',
  };
  const fg: Record<string, string> = {
    primary: '#101114',
    secondary: colors.text,
    ghost: colors.accent,
    danger: '#FFFFFF',
    outline: colors.accent,
  };
  const height = size === 'sm' ? 36 : size === 'lg' ? 56 : 48;
  const fontSize = size === 'sm' ? 13 : size === 'lg' ? 17 : 15;

  return (
    <TouchableOpacity
      testID={testID}
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.button,
        {
          backgroundColor: bg[variant],
          borderColor: variant === 'outline' ? colors.accent : variant === 'secondary' ? colors.border : 'transparent',
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          height,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} size="small" />
      ) : (
        <View style={styles.buttonInner}>
          {Icon && <Icon size={size === 'sm' ? 15 : 18} color={fg[variant]} strokeWidth={2.2} />}
          <Text style={[styles.buttonText, { color: fg[variant], fontSize, marginLeft: Icon ? 8 : 0 }]}>{title}</Text>
          {IconRight && <IconRight size={size === 'sm' ? 15 : 18} color={fg[variant]} strokeWidth={2.2} style={{ marginLeft: 8 }} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

/* ---------------------------------- Card --------------------------------- */

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ---------------------------------- Input -------------------------------- */

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  editable?: boolean;
  leftIcon?: LucideIcon;
  testID?: string;
  onBlur?: () => void;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'sentences',
  multiline = false,
  editable = true,
  leftIcon: LeftIcon,
  testID,
  onBlur,
}: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: error ? colors.error : focused ? colors.accent : colors.border,
            backgroundColor: colors.backgroundSecondary,
            alignItems: multiline ? 'flex-start' : 'center',
            minHeight: multiline ? 96 : 50,
          },
        ]}
      >
        {LeftIcon && <LeftIcon size={18} color={focused ? colors.accent : colors.textSecondary} style={{ marginRight: 10 }} />}
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          style={[styles.input, multiline && { textAlignVertical: 'top', paddingTop: 12, height: 90 }]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

/* --------------------------------- Badge --------------------------------- */

export function Badge({ label, color = colors.accent, small = false }: { label: string; color?: string; small?: boolean }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22`, borderColor: `${color}55`, paddingVertical: small ? 2 : 4, paddingHorizontal: small ? 8 : 10 }]}>
      <Text style={[styles.badgeText, { color, fontSize: small ? 10 : 12 }]}>{label}</Text>
    </View>
  );
}

/* ------------------------------- ProgressBar ----------------------------- */

export function ProgressBar({ value, height = 8, color = colors.accent, track = colors.card }: { value: number; height?: number; color?: string; track?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={{ height, backgroundColor: track, borderRadius: height, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%` as DimensionValue, backgroundColor: color, borderRadius: height, height: '100%' }} />
    </View>
  );
}

/* -------------------------------- Skeleton -------------------------------- */

export function Skeleton({ width = '100%', height = 16, style }: { width?: DimensionValue; height?: number; style?: ViewStyle }) {
  const [opacity, setOpacity] = useState(0.4);
  React.useEffect(() => {
    let mounted = true;
    const pulse = () => {
      if (!mounted) return;
      setOpacity((o) => (o === 0.4 ? 0.85 : 0.4));
    };
    const interval = setInterval(pulse, 700);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);
  return <View style={[{ width, height, backgroundColor: colors.card, borderRadius: 8, opacity }, style]} />;
}

export function CardSkeleton() {
  return (
    <View style={[styles.card, { gap: 10 }]}>
      <Skeleton width="60%" height={18} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
      <Skeleton width="40%" height={28} />
    </View>
  );
}

/* ------------------------------ Empty / Error ---------------------------- */

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionTitle,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.stateContainer}>
      <View style={styles.stateIcon}>
        <Icon size={34} color={colors.accent} strokeWidth={1.8} />
      </View>
      <Text style={[typography.h2, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[typography.secondary, { textAlign: 'center', marginTop: spacing.sm, lineHeight: 21 }]}>{message}</Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} style={{ marginTop: spacing.lg, minWidth: 200 }} />
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.stateContainer}>
      <Text style={[typography.h3, { color: colors.error, textAlign: 'center' }]}>Something went wrong</Text>
      <Text style={[typography.secondary, { textAlign: 'center', marginTop: spacing.sm }]}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} style={{ marginTop: spacing.lg, minWidth: 160 }} /> : null}
    </View>
  );
}

/* ------------------------------ SectionHeader ---------------------------- */

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={typography.h2}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

/* ---------------------------------- Chip --------------------------------- */

export function Chip({
  label,
  selected = false,
  onPress,
  color = colors.accent,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? `${color}22` : colors.card,
          borderColor: selected ? color : colors.border,
        },
      ]}
    >
      <Text style={{ color: selected ? color : colors.textSecondary, fontSize: 13, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
}

/* -------------------------------- StatTile ------------------------------- */

export function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  color = colors.accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
}) {
  return (
    <View style={styles.statTile}>
      <View style={[styles.statIcon, { backgroundColor: `${color}1F` }]}>
        <Icon size={18} color={color} strokeWidth={2.2} />
      </View>
      <Text style={styles.statValue}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* --------------------------------- Divider ------------------------------- */

export const Divider = ({ style }: { style?: ViewStyle }) => <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;

/* -------------------------- Scrollable filter row ------------------------ */

export function ChipRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[{ gap: spacing.sm, paddingVertical: 2 }, style]}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontWeight: '700', letterSpacing: 0.2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: { ...typography.secondary, marginBottom: 6, fontWeight: '600', color: colors.textSecondary },
  inputWrapper: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 },
  badge: {
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontWeight: '700', textTransform: 'capitalize' },
  stateContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: spacing.lg },
  stateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${colors.accent}18`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  sectionAction: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statTile: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    minWidth: 100,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statUnit: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
