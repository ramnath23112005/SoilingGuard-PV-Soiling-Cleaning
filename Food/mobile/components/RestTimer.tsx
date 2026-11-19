import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { X, Plus, SkipForward, Timer } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '../constants/theme';
import { Button, Chip } from './ui';

const PRESETS = [30, 45, 60, 90, 120];

function fmt(total: number): string {
  const m = Math.floor(Math.max(0, total) / 60);
  const s = Math.max(0, total) % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Rest timer with wall-clock targets so it stays accurate across
 * background/foreground transitions and app reloads.
 */
export function RestTimer({
  visible,
  initialSeconds = 60,
  onFinish,
  onSkip,
}: {
  visible: boolean;
  initialSeconds?: number;
  onFinish?: () => void;
  onSkip?: () => void;
}) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [selected, setSelected] = useState(initialSeconds);
  const [custom, setCustom] = useState(false);
  const [customMins, setCustomMins] = useState(1);
  const targetRef = useRef<number>(Date.now() + initialSeconds * 1000);
  const finishedRef = useRef(false);

  const schedule = useCallback((seconds: number) => {
    targetRef.current = Date.now() + seconds * 1000;
    setRemaining(seconds);
    finishedRef.current = false;
  }, []);

  useEffect(() => {
    if (!visible) return;
    finishedRef.current = false;
    schedule(initialSeconds);
    setSelected(initialSeconds);
  }, [visible, initialSeconds, schedule]);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const left = Math.ceil((targetRef.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        onFinish?.();
      }
    }, 250);
    return () => clearInterval(id);
  }, [visible, onFinish]);

  const addTime = (sec: number) => {
    targetRef.current += sec * 1000;
    setRemaining(Math.ceil((targetRef.current - Date.now()) / 1000));
    finishedRef.current = false;
  };

  const choose = (sec: number) => {
    setSelected(sec);
    setCustom(false);
    schedule(sec);
  };

  const progress = selected > 0 ? Math.max(0, Math.min(1, remaining / selected)) : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={{ alignItems: 'center' }}>
            <Timer size={26} color={colors.accent} />
            <Text style={styles.title}>Rest time</Text>
            <Text style={styles.clock}>{fmt(remaining)}</Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${progress * 100}%` } as { width: string }]} />
            </View>
          </View>

          {!custom ? (
            <View style={styles.chips}>
              {PRESETS.map((p) => (
                <Chip key={p} label={`${p}s`} selected={selected === p} onPress={() => choose(p)} />
              ))}
              <Chip label="Custom" selected={false} onPress={() => setCustom(true)} color={colors.textSecondary} />
            </View>
          ) : (
            <View style={styles.chips}>
              {[1, 2, 3, 5, 10].map((m) => (
                <Chip
                  key={m}
                  label={`${m} min`}
                  selected={customMins === m}
                  onPress={() => {
                    setCustomMins(m);
                    setSelected(m * 60);
                    schedule(m * 60);
                  }}
                />
              ))}
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => addTime(30)}>
              <Plus size={16} color={colors.text} />
              <Text style={styles.secondaryText}>30s</Text>
            </TouchableOpacity>
            <Button
              title="Skip rest"
              variant="primary"
              icon={SkipForward}
              onPress={onSkip}
              style={{ flex: 1 }}
              testID="skip-rest"
            />
            <TouchableOpacity style={styles.closeBtn} onPress={onSkip}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { ...typography.h3, marginTop: spacing.sm },
  clock: { fontSize: 56, fontWeight: '800', color: colors.accent, marginVertical: spacing.sm, fontVariant: ['tabular-nums'] },
  track: { height: 6, backgroundColor: colors.card, borderRadius: 3, width: '100%', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', marginTop: spacing.lg },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: { color: colors.text, fontWeight: '700' },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
