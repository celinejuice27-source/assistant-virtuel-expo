import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingHeader, Screen } from '@/components/layout';
import { Button, Radio, selectable, T } from '@/components/ui';
import { LANGS, type LangCode } from '@/data/langs';
import { useStore } from '@/state/store';
import { colors, fonts, radii } from '@/theme/tokens';

export default function Langue() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const fromProfil = from === 'profil';
  const { prefs, set } = useStore();
  const [lang, setLang] = useState<LangCode>(prefs.lang);

  const submit = () => {
    set({ lang });
    if (fromProfil) router.back();
    else router.push('/niveau');
  };

  return (
    <Screen footer={<Button label={fromProfil ? 'Enregistrer' : 'Continuer'} onPress={submit} />}>
      <OnboardingHeader step={1} />
      <T variant="title">Quelle langue voulez-vous parler ?</T>
      <T variant="small" style={{ marginTop: -6 }}>
        Votre agent ne s’adressera à vous que dans cette langue.
      </T>
      <View style={{ gap: 8 }}>
        {LANGS.map((l) => {
          const on = l.code === lang;
          return (
            <Pressable
              key={l.code}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => setLang(l.code)}
              style={[styles.row, selectable(on)]}>
              <View style={styles.code}>
                <T style={styles.codeText}>{l.code.toUpperCase()}</T>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="label">
                  {l.name} · {l.native}
                </T>
                <T variant="caption">
                  avec {l.agent} · {l.city}
                </T>
              </View>
              <Radio on={on} />
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  code: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: { fontFamily: fonts.mono, fontSize: 12, fontWeight: '500', letterSpacing: 1.2, color: colors.accent300 },
});
