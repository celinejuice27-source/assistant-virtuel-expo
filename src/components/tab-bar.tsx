import type { BottomTabBarProps } from 'expo-router/tabs';
import { Cards, House, MaskHappy, UserCircle, type Icon } from 'phosphor-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { alpha, colors, fonts } from '@/theme/tokens';

const ICONS: Record<string, Icon> = { home: House, scenes: MaskHappy, vocab: Cards, profil: UserCircle };

/** Barre d'onglets : 4 colonnes de 56 px, capsule accent sur l'onglet actif. */
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const IconCmp = ICONS[route.name] ?? House;
        const label = descriptors[route.key].options.title ?? route.name;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !e.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.tab}>
            <View style={[styles.capsule, focused && styles.capsuleOn]}>
              <IconCmp size={20} weight={focused ? 'fill' : 'regular'} color={focused ? colors.accent300 : colors.neutral500} />
            </View>
            <Text style={[styles.label, { color: focused ? colors.accent300 : colors.neutral500 }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.divider, backgroundColor: colors.bg },
  tab: { flex: 1, height: 56, alignItems: 'center', justifyContent: 'center', gap: 2 },
  capsule: { width: 56, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  capsuleOn: { borderWidth: 1, borderColor: colors.accent, backgroundColor: alpha(colors.accent, 0.1) },
  label: { fontSize: 11, fontFamily: fonts.medium },
});
