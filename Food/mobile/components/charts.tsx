import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Path, Line, Circle, Text as SvgText, Polyline } from 'react-native-svg';
import { colors, typography, spacing } from '../constants/theme';

const SCREEN_W = Dimensions.get('window').width;

/* ------------------------------- Bar chart ------------------------------- */

export function BarChart({
  data,
  height = 160,
  labelEvery = 7,
  valueFormatter = (v: number) => String(v),
  title,
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  labelEvery?: number;
  valueFormatter?: (v: number) => string;
  title?: string;
}) {
  const width = SCREEN_W - spacing.md * 4;
  const chartH = height - 24;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = Math.max(1, data.length);
  const slot = width / n;
  const barW = Math.max(4, Math.min(28, slot * 0.6));

  return (
    <View>
      {title ? <Text style={styles.chartTitle}>{title}</Text> : null}
      <Svg width={width} height={height}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <Line
            key={f}
            x1={0}
            y1={chartH - chartH * f}
            x2={width}
            y2={chartH - chartH * f}
            stroke={colors.chartGrid}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}
        {data.map((d, i) => {
          const h = max === 0 ? 0 : (d.value / max) * (chartH - 8);
          const x = i * slot + (slot - barW) / 2;
          return (
            <Rect
              key={`${d.label}-${i}`}
              x={x}
              y={chartH - h}
              width={barW}
              height={Math.max(d.value > 0 ? 3 : 0, h)}
              rx={Math.min(4, barW / 2)}
              fill={d.value > 0 ? colors.accent : colors.card}
              opacity={d.value > 0 ? 1 : 0.6}
            />
          );
        })}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <SvgText
              key={`lbl-${i}`}
              x={i * slot + slot / 2}
              y={height - 6}
              fill={colors.textSecondary}
              fontSize={9}
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          ) : null
        )}
        <Line x1={0} y1={chartH} x2={width} y2={chartH} stroke={colors.border} strokeWidth={1} />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={styles.chartNote}>Max: {valueFormatter(max)}</Text>
        <Text style={styles.chartNote}>Total: {valueFormatter(data.reduce((a, d) => a + d.value, 0))}</Text>
      </View>
    </View>
  );
}

/* ------------------------------ Line chart ------------------------------- */

export function LineChart({
  points,
  height = 170,
  unit = '',
  title,
  yFormatter,
}: {
  points: Array<{ label: string; value: number }>;
  height?: number;
  unit?: string;
  title?: string;
  yFormatter?: (v: number) => string;
}) {
  const width = SCREEN_W - spacing.md * 4;
  const chartH = height - 30;
  const padY = 16;
  const values = points.map((p) => p.value);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 1;
  const range = max - min || 1;

  const coords = points.map((p, i) => ({
    x: points.length === 1 ? width / 2 : (i / (points.length - 1)) * width,
    y: padY + chartH - padY * 2 - ((p.value - min) / range) * (chartH - padY * 2),
  }));

  const line = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const area =
    coords.length > 0
      ? `M0,${chartH} L${coords.map((c) => `${c.x},${c.y}`).join(' L')} L${width},${chartH} Z`
      : '';

  const fmt = yFormatter ?? ((v: number) => `${v}${unit}`);

  return (
    <View>
      {title ? <Text style={styles.chartTitle}>{title}</Text> : null}
      <Svg width={width} height={height}>
        {[0, 0.5, 1].map((f) => (
          <Line
            key={f}
            x1={0}
            y1={padY + (chartH - padY * 2) * f}
            x2={width}
            y2={padY + (chartH - padY * 2) * f}
            stroke={colors.chartGrid}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
        ))}
        {area ? <Path d={area} fill={colors.accent} opacity={0.12} /> : null}
        {coords.length > 1 ? (
          <Polyline
            points={line}
            fill="none"
            stroke={colors.accent}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={3.5} fill={colors.background} stroke={colors.accent} strokeWidth={2} />
        ))}
        {points.length > 0 && (
          <>
            <SvgText x={4} y={12} fill={colors.textSecondary} fontSize={10}>
              {fmt(max)}
            </SvgText>
            <SvgText x={4} y={chartH + 2} fill={colors.textSecondary} fontSize={10}>
              {fmt(min)}
            </SvgText>
          </>
        )}
        <Line x1={0} y1={chartH} x2={width} y2={chartH} stroke={colors.border} strokeWidth={1} />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={styles.chartNote}>{points[0]?.label ?? ''}</Text>
        <Text style={styles.chartNote}>{points[points.length - 1]?.label ?? ''}</Text>
      </View>
    </View>
  );
}

/* ---------------------------- Weekly heatmap ----------------------------- */

export function WeekDots({ days }: { days: Array<{ label: string; value: number }> }) {
  return (
    <View style={styles.weekRow}>
      {days.map((d, i) => {
        const active = d.value > 0;
        return (
          <View key={i} style={{ alignItems: 'center', flex: 1 }}>
            <View
              style={[
                styles.weekDot,
                {
                  backgroundColor: active ? colors.accent : colors.backgroundSecondary,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={{ color: active ? '#101114' : colors.textSecondary, fontWeight: '800', fontSize: 12 }}>
                {active ? d.value : ''}
              </Text>
            </View>
            <Text style={styles.weekLabel}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  chartTitle: { ...typography.h3, marginBottom: spacing.sm },
  chartNote: { ...typography.caption },
  weekRow: { flexDirection: 'row', gap: 6 },
  weekDot: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
});
