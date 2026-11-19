import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import { colors, radius, typography } from '../constants/theme';

/**
 * Exercise demonstration video with loading, play/pause, resume and error states.
 * Falls back to a poster image when the source fails.
 */
export function ExerciseVideo({ uri, posterUri }: { uri: string; posterUri?: string }) {
  const [error, setError] = useState(false);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(true);

  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') setReady(true);
      if (payload.status === 'error') setError(true);
    });
    return () => sub.remove();
  }, [player]);

  if (error) {
    return (
      <View style={[styles.wrap, styles.center]}>
        <Text style={[typography.secondary, { textAlign: 'center', paddingHorizontal: 16 }]}>
          Demo video unavailable. {posterUri ? 'Showing reference image instead.' : 'Check your connection.'}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setError(false);
            setReady(false);
            try {
              player.replace(uri);
              player.play();
            } catch {
              setError(true);
            }
          }}
          style={styles.retryBtn}
        >
          <RotateCcw size={16} color={colors.accent} />
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
      />
      {!ready ? (
        <View style={[styles.center, StyleSheet.absoluteFill]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
      <TouchableOpacity
        style={styles.controls}
        onPress={() => {
          if (paused) {
            player.play();
            setPaused(false);
          } else {
            player.pause();
            setPaused(true);
          }
        }}
      >
        {paused ? <Play size={22} color="#fff" fill="#fff" /> : <Pause size={22} color="#fff" fill="#fff" />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000', borderRadius: radius.lg, overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  controls: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16,17,20,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accent,
    marginTop: 4,
  },
  retryText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
});
