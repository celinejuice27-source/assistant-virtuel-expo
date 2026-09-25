import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme/tokens';

function useLoop(factory: (v: Animated.Value) => Animated.CompositeAnimation, deps: unknown[] = []) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    v.setValue(0);
    const anim = Animated.loop(factory(v));
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return v;
}

/** Anneau qui pulse : 1,4 s ease-out, scale 1 → 1,55, opacité 0,55 → 0. */
export function PulseRing({ size, color = colors.accent, style }: { size: number; color?: string; style?: StyleProp<ViewStyle> }) {
  const v = useLoop((a) => Animated.timing(a, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
        },
        style,
      ]}
    />
  );
}

function WaveBar({ duration }: { duration: number }) {
  const v = useLoop(
    (a) =>
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    [duration],
  );
  return (
    <Animated.View
      style={[wave.bar, { transform: [{ scaleY: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }] }]}
    />
  );
}

/** Onde de 5 barres 2 × 14 px pendant que l'agent parle. */
export function Wave() {
  return (
    <View style={wave.row}>
      {[350, 490, 420, 630, 560].map((d, i) => (
        <WaveBar key={i} duration={d} />
      ))}
    </View>
  );
}

const wave = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 14 },
  bar: { width: 2, height: 14, borderRadius: 1, backgroundColor: colors.accent300 },
});

function Dot({ delay }: { delay: number }) {
  const v = useLoop((a) =>
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(a, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.delay(400 - delay),
    ]),
  );
  return <Animated.View style={[dots.dot, { opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }) }]} />;
}

/** 3 points clignotants (1,2 s, décalés de 0,2 s). */
export function ThinkingDots() {
  return (
    <View style={dots.row} accessibilityLabel="réfléchit">
      {[0, 200, 400].map((d) => (
        <Dot key={d} delay={d} />
      ))}
    </View>
  );
}

const dots = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text },
});
