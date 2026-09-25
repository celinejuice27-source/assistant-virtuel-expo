import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

import type { Lang } from '@/data/langs';
import type { LevelId } from '@/data/levels';

/** Lit une réplique avec la voix de la langue cible. `onEnd` est appelé une seule fois. */
export function speak(text: string, lang: Lang, level: LevelId, onEnd: () => void) {
  let done = false;
  const end = () => {
    if (done) return;
    done = true;
    onEnd();
  };
  Speech.stop();
  Speech.speak(text, {
    language: lang.voice,
    rate: level === 'debutant' ? 0.85 : 1,
    onDone: end,
    onStopped: end,
    onError: end,
  });
}

export function stopSpeaking() {
  Speech.stop();
}

/** Durée d'affichage de l'état « parle » quand le son est coupé. */
export function silentDuration(text: string) {
  return Math.min(5200, Math.max(1600, text.length * 45));
}

/**
 * Reconnaissance vocale (expo-speech-recognition). Le module natif n'existe
 * pas dans Expo Go : on le charge paresseusement et on renvoie null s'il
 * manque, l'écran de conversation simule alors l'écoute. Sur le web (aperçu),
 * l'écoute est toujours simulée : l'API Web Speech varie selon les navigateurs
 * et le micro est souvent refusé dans une page intégrée.
 */
type SttModule = typeof import('expo-speech-recognition');
let stt: SttModule | null | undefined;

export function getStt(): SttModule | null {
  if (stt !== undefined) return stt;
  if (Platform.OS === 'web') return (stt = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-speech-recognition') as SttModule;
    stt = mod.ExpoSpeechRecognitionModule?.isRecognitionAvailable?.() ? mod : null;
  } catch {
    stt = null;
  }
  return stt;
}
