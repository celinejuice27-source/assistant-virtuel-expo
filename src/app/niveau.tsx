import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingHeader, Screen } from '@/components/layout';
import { Button, Radio, SectionTitle, selectable, T, Tag } from '@/components/ui';
import { getLang } from '@/data/langs';
import { GOALS, LEVELS, type Goal, type LevelId } from '@/data/levels';
import { useStore } from '@/state/store';
import { colors, fonts, radii } from '@/theme/tokens';

export default function Niveau() {
  const { prefs, set } = useStore();
  const lang = getLang(prefs.lang);
  const [level, setLevel] = useState<LevelId>(prefs.level);
  const [goal, setGoal] = useState<Goal>(prefs.goal);

  return (
    <Screen
      footer={
        <Button
          label="Continuer"
          onPress={() => {
            set({ level, goal });
            router.push('/agent');
          }}
        />
      }>
      <OnboardingHeader step={2} />
      <T variant="title">Où en êtes-vous en {lang.inName} ?</T>
      <T variant="small" style={{ marginTop: -6 }}>
        {lang.agent} adaptera son débit, son vocabulaire et ses corrections.
      </T>
      <View style={{ gap: 8 }}>
        {LEVELS.map((l) => {
          const on = l.id === level;
          return (
            <Pressable
              key={l.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setLevel(l.id)}
              style={[styles.card, selectable(on)]}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.cardHead}>
                  <T variant="label">{l.label}</T>
                  <Tag label={l.cefr} accent={on} />
                </View>
                <T variant="small">{l.desc}</T>
              </View>
              <Radio on={on} />
            </Pressable>
          );
        })}
      </View>
      <SectionTitle style={{ marginTop: 8 }}>Objectif quotidien</SectionTitle>
      <View style={styles.grid}>
        {GOALS.map((g) => {
          const on = g === goal;
          return (
            <Pressable
              key={g}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setGoal(g)}
              style={[styles.goal, selectable(on)]}>
              <T style={[styles.goalText, on && { color: colors.accent300 }]}>{g} min</T>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radii.lg, borderWidth: 1, padding: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grid: { flexDirection: 'row', gap: 8 },
  goal: { flex: 1, height: 48, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  goalText: { fontFamily: fonts.medium, fontSize: 14 },
});
