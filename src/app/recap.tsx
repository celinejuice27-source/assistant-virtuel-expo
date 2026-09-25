import { router } from 'expo-router';
import { CheckCircle, PlusCircle } from 'phosphor-react-native';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Button, Kicker, SectionTitle, T } from '@/components/ui';
import { getLang } from '@/data/langs';
import { getScene } from '@/data/scenes';
import { useStore } from '@/state/store';
import { colors, fonts, radii, shadows } from '@/theme/tokens';

export default function Recap() {
  const { prefs, recap, toggleWord, isSaved } = useStore();
  const lang = getLang(prefs.lang);
  const r = recap ?? { scene: 'libre' as const, seconds: 0, replies: 0, corrections: [], words: [] };
  const scene = getScene(r.scene);
  const precision = r.replies ? Math.round(100 * (1 - r.corrections.length / r.replies)) : 100;
  const duration = `${Math.floor(r.seconds / 60)}:${String(r.seconds % 60).padStart(2, '0')}`;

  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button
            kind="secondary"
            label="Rejouer"
            style={{ flex: 1 }}
            onPress={() => router.replace({ pathname: '/chat', params: { scene: scene.id } })}
          />
          <Button label="Terminer" style={{ flex: 1 }} onPress={() => router.replace('/home')} />
        </View>
      }>
      <Kicker style={{ marginTop: 12 }}>
        {scene.title} · {lang.agent}
      </Kicker>
      <T variant="title">Bien joué, session terminée.</T>

      <View style={styles.stats}>
        {[
          { v: duration, l: 'Durée' },
          { v: String(r.replies), l: 'Répliques' },
          { v: `${Math.max(0, precision)} %`, l: 'Précision' },
        ].map((s) => (
          <View key={s.l} style={styles.stat}>
            <T style={styles.statValue}>{s.v}</T>
            <T variant="caption">{s.l}</T>
          </View>
        ))}
      </View>

      <SectionTitle style={{ marginTop: 8 }}>Corrections</SectionTitle>
      {r.corrections.length === 0 ? (
        <T variant="small">Aucune erreur relevée. Impeccable.</T>
      ) : (
        <View style={{ gap: 8 }}>
          {r.corrections.map((c, i) => (
            <View key={i} style={[styles.corr, shadows.sm]}>
              <T style={styles.wrong}>{c.wrong}</T>
              <T style={styles.fixed}>{c.fix.corrected}</T>
              {c.fix.why ? <T variant="caption" style={{ color: colors.neutral400 }}>{c.fix.why}</T> : null}
            </View>
          ))}
        </View>
      )}

      <SectionTitle style={{ marginTop: 8 }}>Nouveaux mots</SectionTitle>
      {r.words.length === 0 ? <T variant="small">Pas de nouveau mot cette fois-ci.</T> : null}
      <View style={{ gap: 8 }}>
        {r.words.map((w) => {
          const saved = isSaved(w);
          return (
            <View key={w.w} style={styles.word}>
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="label">{w.w}</T>
                <T variant="caption">{w.fr}</T>
              </View>
              <Button
                kind="ghost"
                compact
                icon={saved ? CheckCircle : PlusCircle}
                label={saved ? 'Ajouté' : 'Ajouter'}
                onPress={() => toggleWord(w)}
              />
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12, gap: 2 },
  statValue: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 26 },
  corr: { borderRadius: radii.lg, padding: 14, gap: 4 },
  wrong: { fontSize: 13, color: colors.neutral500, textDecorationLine: 'line-through' },
  fixed: { fontSize: 15, color: colors.accent300, fontFamily: fonts.medium },
  word: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, paddingLeft: 14, paddingRight: 4, paddingVertical: 10 },
});
