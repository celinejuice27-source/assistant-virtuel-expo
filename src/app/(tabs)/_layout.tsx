import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="scenes" options={{ title: 'Scènes' }} />
      <Tabs.Screen name="vocab" options={{ title: 'Vocabulaire' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
