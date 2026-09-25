import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { ArrowLeft } from '@/components/icons';
import { colors, space } from '@/theme/tokens';

/** Page défilante avec pied fixe optionnel (CTA). */
export function Screen({
  children,
  footer,
  scroll = true,
  contentStyle,
  edges = { top: true, bottom: true },
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: { top?: boolean; bottom?: boolean };
}) {
  const insets = useSafeAreaInsets();
  const pad = [styles.content, { paddingTop: (edges.top ? insets.top : 0) + 12 }, contentStyle];
  return (
    <View style={[styles.root, { paddingBottom: edges.bottom && !footer ? insets.bottom : 0 }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={pad} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[pad, { flex: 1 }]}>{children}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { paddingBottom: (edges.bottom ? insets.bottom : 0) + 16 }]}>{footer}</View>
      ) : null}
    </View>
  );
}

/** En-tête d'onboarding : retour + 3 barres de progression de 3 px. */
export function OnboardingHeader({ step }: { step: 1 | 2 | 3 }) {
  return (
    <View style={styles.obHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Retour"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))}
        hitSlop={8}
        style={styles.back}>
        <ArrowLeft size={22} color={colors.text} />
      </Pressable>
      <View style={styles.bars}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.bar, { backgroundColor: i <= step ? colors.accent : colors.neutral800 }]} />
        ))}
      </View>
    </View>
  );
}

/** Anneau d'objectif (accent sur neutral-800). */
export function GoalRing({ value, size = 64, children }: { value: number; size?: number; children?: ReactNode }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.neutral800} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export function ProgressBar({ value, style }: { value: number; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space.screen, paddingBottom: 24, gap: 16 },
  footer: { paddingHorizontal: space.screen, paddingTop: 12, gap: 4, backgroundColor: colors.bg },
  obHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 44, marginBottom: 8 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginLeft: -10 },
  bars: { flex: 1, flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: 3, borderRadius: 2 },
  track: { height: 3, borderRadius: 2, backgroundColor: colors.neutral800, overflow: 'hidden' },
  fill: { height: 3, backgroundColor: colors.accent },
});
