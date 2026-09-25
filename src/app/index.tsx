import { Redirect } from 'expo-router';

import { useStore } from '@/state/store';

export default function Index() {
  const { prefs } = useStore();
  return <Redirect href={prefs.onboarded ? '/home' : '/welcome'} />;
}
