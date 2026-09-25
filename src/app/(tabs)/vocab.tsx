import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, T, Tag } from '@/components/ui';
import { getLang } from '@/data/langs';
import { useStore } from '@/state/store';
import { colors, radii } from '@/theme/tokens';

/** Maîtrise (0–3) dérivée de la longueur du mot : placeholder en attendant la révision espacée. */
const mastery = (w: string) => (w.length % 3) + 1;

export default function Vocab() {
  const { prefs } = useStore();
  const lang = getLang(prefs.lang);
  const words = prefs.saved.filter((w) => w.lang === lang.code);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <Screen
      edges={{ top: true }}
      footer={
        words.length ? (
          <Button
            label={`Réviser ces mots avec ${lang.agent}`}
            onPress={() => router.push({ pathname: '/chat', params: { scene: 'libre' } })}
          />
        ) : undefined
      }>
      <View style={styles.head}>
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="title">Vocabulaire</T>
          <T variant="small">
            {words.length} mot{words.length > 1 ? 's' : ''} en {lang.inName}
          </T>
        </View>
        <Tag label={lang.code.toUpperCase()} accent />
      </View>
      {words.length === 0 ? (
        <T variant="small" style={{ color: colors.neutral500 }}>
          Aucun mot pour l’instant. Ajoutez-en depuis le récap d’une session.
        </T>
      ) : null}
      <View style={{ gap: 8 }}>
        {words.map((w) => {
          const shown = open[w.w];
          const m = mastery(w.w);
          return (
            <Pressable
              key={w.w}
              accessibilityRole="button"
              accessibilityHint="Affiche la traduction"
              onPress={() => setOpen((o) => ({ ...o, [w.w]: !o[w.w] }))}
              style={styles.row}>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="label">{w.w}</T>
                {shown ? (
                  <T style={{ fontSize: 13, color: colors.accent300 }}>{w.fr}</T>
                ) : (
                  <T style={{ fontSize: 13, color: colors.neutral600 }}>Touchez pour voir la traduction</T>
                )}
              </View>
              <View style={styles.dots} accessibilityLabel={`Maîtrise ${m} sur 3`}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: i < m ? colors.accent : colors.neutral800 }]} />
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: 14 },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
