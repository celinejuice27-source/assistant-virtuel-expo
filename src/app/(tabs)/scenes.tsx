import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { T, Tag } from '@/components/ui';
import { SCENES } from '@/data/scenes';
import { colors, radii } from '@/theme/tokens';

export default function Scenes() {
  return (
    <Screen edges={{ top: true }}>
      <T variant="title">Scènes</T>
      <T variant="small" style={{ marginTop: -6 }}>
        Choisissez une situation : votre agent joue le rôle.
      </T>
      <View style={{ gap: 8 }}>
        {SCENES.map((s) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/chat', params: { scene: s.id } })}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
            <View style={styles.icon}>
              <s.icon size={22} color={colors.accent300} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="label">{s.title}</T>
              <T variant="caption">{s.role}</T>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Tag label={s.level} accent />
              <T variant="caption">{s.minutes} min</T>
            </View>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.accent900,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
