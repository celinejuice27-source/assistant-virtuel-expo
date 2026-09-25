import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CoverImage } from '@/components/agent';
import { CaretRight, Cards, Fire, Phone } from '@/components/icons';
import { GoalRing, ProgressBar, Screen } from '@/components/layout';
import { Card, Kicker, SectionTitle, T, Tag } from '@/components/ui';
import { getLang } from '@/data/langs';
import { getLevel } from '@/data/levels';
import { SCENES } from '@/data/scenes';
import { useStore } from '@/state/store';
import { alpha, colors, fonts, radii, space } from '@/theme/tokens';

const startScene = (scene: string) => router.push({ pathname: '/chat', params: { scene } });

export default function Home() {
  const { prefs } = useStore();
  const lang = getLang(prefs.lang);
  const level = getLevel(prefs.level);
  const hello = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir';
  const left = Math.max(0, prefs.goal - prefs.minutesToday);
  const toReview = prefs.saved.filter((w) => w.lang === lang.code).length;

  return (
    <Screen edges={{ top: true }}>
      <View style={styles.header}>
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="small" style={{ color: colors.neutral500 }}>
            {hello} Morel
          </T>
          <T variant="title">Prêt à parler {lang.inName} ?</T>
        </View>
        <View style={styles.streak} accessibilityLabel={`Série de ${prefs.streak} jours`}>
          <Fire size={16} weight="fill" color={colors.accent400} />
          <T style={styles.streakText}>{prefs.streak} j</T>
        </View>
      </View>

      <Card style={styles.goalCard}>
        <GoalRing value={prefs.minutesToday / prefs.goal}>
          <T style={styles.ringValue}>{prefs.minutesToday}</T>
          <T style={styles.ringUnit}>min</T>
        </GoalRing>
        <View style={{ flex: 1, gap: 8 }}>
          <T variant="label">
            {left > 0 ? `${left} min pour l'objectif du jour` : 'Objectif du jour atteint'}
          </T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Tag label={level.tag} accent />
            <T variant="caption">{prefs.xp} % vers le niveau suivant</T>
          </View>
          <ProgressBar value={prefs.xp} />
        </View>
      </Card>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Appeler ${lang.agent}`}
        onPress={() => startScene('libre')}
        style={({ pressed }) => [styles.call, pressed && { opacity: 0.9 }]}>
        <CoverImage name="call" x={0.3} y={0.22} />
        <LinearGradient
          colors={[alpha(colors.bg, 0), alpha(colors.bg, 0.92)]}
          locations={[0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.callBody}>
          <View style={{ flex: 1, gap: 4 }}>
            <Kicker style={{ color: colors.neutral300 }}>Conversation libre</Kicker>
            <T style={styles.callTitle}>Appeler {lang.agent}</T>
            <T variant="small" style={{ color: colors.neutral300 }}>
              Parlez de votre journée, {prefs.goal} min
            </T>
          </View>
          <View style={styles.phone}>
            <Phone size={22} weight="fill" color={colors.accent300} />
          </View>
        </View>
      </Pressable>

      <View style={styles.rowHead}>
        <SectionTitle>Jeux de rôle</SectionTitle>
        <Pressable onPress={() => router.navigate('/scenes')} hitSlop={10}>
          <T style={{ color: colors.accent300, fontSize: 13, fontFamily: fonts.medium }}>Tout voir</T>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -space.screen }}
        contentContainerStyle={{ paddingHorizontal: space.screen, gap: 8 }}>
        {SCENES.filter((s) => s.id !== 'libre').map((s) => (
          <Pressable key={s.id} onPress={() => startScene(s.id)} style={styles.sceneCard}>
            <View style={styles.sceneIcon}>
              <s.icon size={20} color={colors.accent300} />
            </View>
            <T style={styles.sceneTitle} numberOfLines={2}>
              {s.title}
            </T>
            <T variant="caption">
              {s.level} · {s.minutes} min
            </T>
          </Pressable>
        ))}
      </ScrollView>

      <Pressable onPress={() => router.navigate('/vocab')} style={styles.review}>
        <Cards size={20} color={colors.accent300} />
        <T variant="label" style={{ flex: 1 }}>
          {toReview} mot{toReview > 1 ? 's' : ''} à revoir
        </T>
        <CaretRight size={18} color={colors.neutral500} />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 10,
    height: 30,
  },
  streakText: { fontSize: 13, fontFamily: fonts.medium },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringValue: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 20 },
  ringUnit: { fontSize: 10, lineHeight: 12, color: colors.neutral500 },
  call: { height: 250, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surface },
  callBody: { position: 'absolute', left: 16, right: 16, bottom: 16, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  callTitle: { fontFamily: fonts.medium, fontSize: 22, lineHeight: 26, letterSpacing: -0.3 },
  phone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: alpha(colors.bg, 0.55),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sceneCard: { width: 132, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 12, gap: 6 },
  sceneIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.accent900,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sceneTitle: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18, minHeight: 36 },
  review: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    height: 56,
  },
});
