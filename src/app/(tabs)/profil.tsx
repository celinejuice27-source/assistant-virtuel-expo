import { router } from 'expo-router';
import { CaretRight } from 'phosphor-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout';
import { Kicker, selectable, T, Toggle } from '@/components/ui';
import { getLang } from '@/data/langs';
import { GOALS, LEVELS } from '@/data/levels';
import { useStore, type Prefs } from '@/state/store';
import { colors, fonts, radii } from '@/theme/tokens';

function Choices<V extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { v: V; label: string }[];
  value: V;
  onChange: (v: V) => void;
}) {
  return (
    <View style={styles.choices}>
      {options.map((o) => {
        const on = o.v === value;
        return (
          <Pressable
            key={String(o.v)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(o.v)}
            style={[styles.choice, selectable(on), !on && { backgroundColor: colors.bg }]}>
            <T style={[styles.choiceText, on && { color: colors.accent300 }]}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function Profil() {
  const { prefs, set } = useStore();
  const lang = getLang(prefs.lang);
  const words = prefs.saved.filter((w) => w.lang === lang.code).length;

  const toggles: { key: keyof Prefs & ('liveCorr' | 'captions' | 'voiceOut'); title: string; desc: string }[] = [
    { key: 'liveCorr', title: 'Correction en direct', desc: 'Sinon, les erreurs sont listées en fin de session' },
    { key: 'captions', title: 'Sous-titres', desc: "Afficher le texte de ce que dit l'agent" },
    { key: 'voiceOut', title: "Voix de l'agent", desc: 'Lecture audio par synthèse vocale' },
  ];

  return (
    <Screen edges={{ top: true }}>
      <View style={styles.id}>
        <View style={styles.avatar}>
          <T style={styles.initial}>M</T>
        </View>
        <View style={{ gap: 2 }}>
          <T variant="title" style={{ fontSize: 22 }}>
            Morel
          </T>
          <T variant="caption">Membre depuis septembre 2026</T>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          { v: prefs.sessions, l: 'Sessions' },
          { v: `${prefs.streak} j`, l: 'Série' },
          { v: words, l: 'Mots' },
        ].map((s) => (
          <View key={s.l} style={styles.stat}>
            <T style={styles.statValue}>{s.v}</T>
            <T variant="caption">{s.l}</T>
          </View>
        ))}
      </View>

      <Kicker style={{ marginTop: 8 }}>Apprentissage</Kicker>
      <View style={styles.group}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/langue', params: { from: 'profil' } })}
          style={styles.line}>
          <T variant="label" style={{ flex: 1 }}>
            Langue apprise
          </T>
          <T variant="small">
            {lang.name} · {lang.agent}
          </T>
          <CaretRight size={16} color={colors.neutral500} />
        </Pressable>
        <View style={[styles.line, styles.stack]}>
          <T variant="label">Niveau</T>
          <Choices
            options={LEVELS.map((l) => ({ v: l.id, label: l.label }))}
            value={prefs.level}
            onChange={(level) => set({ level })}
          />
        </View>
        <View style={[styles.line, styles.stack]}>
          <T variant="label">Objectif quotidien</T>
          <Choices options={GOALS.map((g) => ({ v: g, label: `${g} min` }))} value={prefs.goal} onChange={(goal) => set({ goal })} />
        </View>
      </View>

      <Kicker style={{ marginTop: 8 }}>Conversation</Kicker>
      <View style={styles.group}>
        {toggles.map((t) => (
          <View key={t.key} style={styles.line}>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="label">{t.title}</T>
              <T variant="caption">{t.desc}</T>
            </View>
            <Toggle label={t.title} on={prefs[t.key]} onChange={(v) => set({ [t.key]: v })} />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  id: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: fonts.medium, fontSize: 22, color: colors.accent300 },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12, gap: 2 },
  statValue: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 26 },
  group: { gap: 2, borderRadius: radii.lg, overflow: 'hidden', marginTop: -8 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, padding: 14 },
  stack: { flexDirection: 'column', alignItems: 'stretch' },
  choices: { flexDirection: 'row', gap: 6 },
  choice: { flex: 1, height: 36, borderRadius: radii.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  choiceText: { fontSize: 13, fontFamily: fonts.medium },
});
