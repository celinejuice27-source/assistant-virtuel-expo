import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoverImage } from '@/components/agent';
import { Button, T, Tag } from '@/components/ui';
import { useStore } from '@/state/store';
import { alpha, colors, space } from '@/theme/tokens';

const HELLOS = ['Hola', 'Ciao', 'Hallo', 'こんにちは'];

export default function Welcome() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { set } = useStore();
  const heroH = height * 0.62;

  return (
    <View style={styles.root}>
      <View style={{ height: heroH, overflow: 'hidden' }}>
                <CoverImage name="call" x={0.3} y={0.15} />
        <LinearGradient
          colors={[alpha(colors.bg, 0), alpha(colors.bg, 0), colors.bg]}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.tags}>
          <Tag label="Hello" accent />
          {HELLOS.map((h) => (
            <Tag key={h} label={h} />
          ))}
        </View>
        <T variant="hero">Parlez une nouvelle langue. Pour de vrai.</T>
        <T variant="small" style={{ fontSize: 15, lineHeight: 22 }}>
          Un agent vidéo qui ne vous parle que dans la langue choisie. Il vous écoute, vous corrige et traduit à la demande.
        </T>
        <View style={{ flex: 1 }} />
        <Button label="Commencer" onPress={() => router.push('/langue')} />
        <Button
          kind="ghost"
          label="J'ai déjà un compte"
          onPress={() => {
            set({ onboarded: true });
            router.replace('/home');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: space.screen, gap: 14, marginTop: -40 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
