import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { CoverImage } from '@/components/agent';
import { OnboardingHeader, Screen } from '@/components/layout';
import { Button, Glass, T, Tag } from '@/components/ui';
import { getLang } from '@/data/langs';
import { getLevel } from '@/data/levels';
import { useStore } from '@/state/store';
import { alpha, colors, fonts, radii } from '@/theme/tokens';

export default function Agent() {
  const { prefs, set } = useStore();
  const lang = getLang(prefs.lang);
  const level = getLevel(prefs.level);
  const [showFr, setShowFr] = useState(false);

  const finish = (next: 'chat' | 'home') => {
    set({ onboarded: true });
    router.dismissAll();
    router.replace('/home');
    if (next === 'chat') router.push({ pathname: '/chat', params: { scene: 'libre' } });
  };

  return (
    <Screen
      footer={
        <>
          <Button label="Lancer ma première conversation" onPress={() => finish('chat')} />
          <Button kind="ghost" label="Plus tard" onPress={() => finish('home')} />
        </>
      }>
      <OnboardingHeader step={3} />
      <T variant="title">Voici {lang.agent}, votre partenaire de conversation.</T>
      <View style={styles.card}>
        <CoverImage name="portrait" x={0.3} y={0.2} />
        <LinearGradient
          colors={[alpha(colors.bg, 0), alpha(colors.bg, 0.6)]}
          locations={[0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Tag label={`${lang.agent} · ${lang.city}`} style={styles.tag} />
        <Glass style={styles.panel} opacity={0.6}>
          <T style={styles.hello}>{lang.hello}</T>
          {showFr ? <T style={styles.fr}>{lang.helloFr}</T> : null}
          <Button
            kind="ghost"
            compact
            label={showFr ? 'Masquer la traduction' : 'Traduire en français'}
            onPress={() => setShowFr((v) => !v)}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          />
        </Glass>
      </View>
      <T variant="small">
        {lang.agent} vous parlera au niveau {level.label} ({level.cefr}), vous corrigera en douceur et traduira dès que vous le
        demanderez.
      </T>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { height: 420, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surface },
  tag: { position: 'absolute', top: 12, left: 12, backgroundColor: alpha(colors.bg, 0.6) },
  panel: { position: 'absolute', left: 10, right: 10, bottom: 10, borderRadius: radii.lg, padding: 14, paddingBottom: 4, gap: 6 },
  hello: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  fr: { fontSize: 14, lineHeight: 20, color: colors.accent300 },
});
