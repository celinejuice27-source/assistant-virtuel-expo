import type { Icon } from 'phosphor-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';

import { alpha, colors, fonts, radii, shadows } from '@/theme/tokens';

/* ---------- Texte ---------- */

type Variant = 'body' | 'small' | 'caption' | 'title' | 'hero' | 'mono' | 'label';

export function T({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[text.base, text[variant], style]} />;
}

const text = StyleSheet.create({
  base: { color: colors.text, fontFamily: fonts.regular },
  body: { fontSize: 15, lineHeight: 15 * 1.5 },
  small: { fontSize: 13, lineHeight: 13 * 1.45, color: colors.neutral400 },
  caption: { fontSize: 12, lineHeight: 12 * 1.45, color: colors.neutral500 },
  label: { fontSize: 15, lineHeight: 15 * 1.35, fontFamily: fonts.medium },
  title: { fontSize: 25, lineHeight: 25 * 1.12, letterSpacing: -0.015 * 25, fontFamily: fonts.medium },
  hero: { fontSize: 32, lineHeight: 32 * 1.08, letterSpacing: -0.02 * 32, fontFamily: fonts.medium },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.neutral500,
  },
});

/* ---------- Boutons ---------- */

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  kind?: 'primary' | 'secondary' | 'ghost';
  icon?: Icon;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function Button({ label, kind = 'primary', icon: IconCmp, style, compact, ...rest }: ButtonProps) {
  const fg = kind === 'secondary' ? colors.text : kind === 'ghost' ? colors.accent300 : colors.accent300;
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        btn.base,
        compact && btn.compact,
        kind === 'primary' && btn.primary,
        kind === 'secondary' && btn.secondary,
        kind === 'ghost' && btn.ghost,
        kind !== 'ghost' && pressed && { backgroundColor: alpha(colors.accent, 0.22) },
        kind === 'ghost' && pressed && { opacity: 0.7 },
        style,
      ]}>
      {IconCmp ? <IconCmp size={18} color={fg} /> : null}
      <Text numberOfLines={1} style={[btn.label, compact && { fontSize: 13 }, { color: fg }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const btn = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  compact: { height: 34, paddingHorizontal: 12 },
  primary: { borderWidth: 1, borderColor: colors.accent },
  secondary: { borderWidth: 1, borderColor: colors.divider },
  ghost: { height: 40 },
  label: { fontFamily: fonts.medium, fontSize: 15 },
});

/* ---------- Tags ---------- */

export function Tag({ label, accent, style }: { label: string; accent?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[tag.base, { backgroundColor: accent ? colors.accent800 : colors.neutral800 }, style]}>
      <Text style={[tag.label, { color: accent ? colors.accent100 : colors.neutral300 }]}>{label}</Text>
    </View>
  );
}

const tag = StyleSheet.create({
  base: { borderRadius: radii.pill, paddingHorizontal: 9, paddingVertical: 3, alignSelf: 'flex-start' },
  label: { fontSize: 11, lineHeight: 15, fontFamily: fonts.medium },
});

/* ---------- Verre ---------- */

/** Flou 10 px : backdrop-filter sur le web, BlurView sur iOS, simple voile sur Android. */
const webBlur = Platform.OS === 'web' ? ({ backdropFilter: 'blur(10px)' } as ViewStyle) : null;

/** Fond « verre » : bg à 55 % + flou. */
export function Glass({ style, children, opacity = 0.55 }: { style?: StyleProp<ViewStyle>; children?: ReactNode; opacity?: number }) {
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: alpha(colors.bg, opacity) }, webBlur, style]}>
      {Platform.OS === 'ios' ? <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /> : null}
      {children}
    </View>
  );
}

export function GlassButton({
  icon: IconCmp,
  onPress,
  active,
  label,
  size = 44,
  iconSize = 20,
}: {
  icon: Icon;
  onPress?: () => void;
  active?: boolean;
  label: string;
  size?: number;
  iconSize?: number;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
      {({ pressed }) => (
        <Glass
          style={[
            { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' },
            shadows.sm,
            active && { borderColor: colors.accent, backgroundColor: alpha(colors.accent, 0.18) },
            pressed && { opacity: 0.75 },
          ]}>
          <IconCmp size={iconSize} color={active ? colors.accent300 : colors.text} weight={active ? 'fill' : 'regular'} />
        </Glass>
      )}
    </Pressable>
  );
}

/* ---------- Sélection ---------- */

export function Radio({ on }: { on: boolean }) {
  return (
    <View style={[sel.radio, on && { borderColor: colors.accent }]}>
      {on ? <View style={sel.radioDot} /> : null}
    </View>
  );
}

/** Style d'une option sélectionnable : fond accent à 10 %, bordure accent. */
export function selectable(on: boolean): ViewStyle {
  return on
    ? { backgroundColor: alpha(colors.accent, 0.1), borderColor: colors.accent }
    : { backgroundColor: colors.surface, borderColor: 'transparent' };
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  const [x] = useState(() => new Animated.Value(on ? 1 : 0));
  useEffect(() => {
    Animated.timing(x, { toValue: on ? 1 : 0, duration: 150, useNativeDriver: true }).start();
  }, [on, x]);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel={label}
      onPress={() => onChange(!on)}
      hitSlop={10}
      style={[sel.switch, on ? { borderColor: colors.accent, backgroundColor: alpha(colors.accent, 0.18) } : null]}>
      <Animated.View
        style={[
          sel.knob,
          { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [0, 16] }) }] },
          on && { backgroundColor: colors.accent },
        ]}
      />
    </Pressable>
  );
}

const sel = StyleSheet.create({
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  switch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 3,
    justifyContent: 'center',
  },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.neutral500 },
});

/* ---------- Divers ---------- */

export function SectionTitle({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <T style={[{ fontSize: 17, fontFamily: fonts.medium, lineHeight: 22 }, style]}>{children}</T>;
}

export function Kicker({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <T variant="mono" style={style}>
      {children}
    </T>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: colors.surface, borderRadius: radii.lg, padding: 16 }, style]}>{children}</View>;
}
