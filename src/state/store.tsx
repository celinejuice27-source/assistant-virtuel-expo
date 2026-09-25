import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { LangCode } from '@/data/langs';
import type { Goal, LevelId } from '@/data/levels';
import type { SceneId } from '@/data/scenes';
import type { Correction, Word } from '@/data/scripts';

export type SavedWord = Word & { lang: LangCode };

/** Préférences et progression persistées (AsyncStorage). */
export type Prefs = {
  lang: LangCode;
  level: LevelId;
  goal: Goal;
  onboarded: boolean;
  captions: boolean;
  liveCorr: boolean;
  voiceOut: boolean;
  saved: SavedWord[];
  minutesToday: number;
  /** Jour (AAAA-MM-JJ) auquel se rapporte minutesToday. */
  day: string;
  streak: number;
  /** Progression vers le niveau suivant, en %. */
  xp: number;
  sessions: number;
};

/** Résultat d'une session, affiché par l'écran Récap. */
export type Recap = {
  scene: SceneId;
  seconds: number;
  replies: number;
  corrections: { wrong: string; fix: Correction }[];
  words: Word[];
};

const KEY = 'parla:prefs:v1';

const today = () => new Date().toISOString().slice(0, 10);

const DEFAULTS: Prefs = {
  lang: 'en',
  level: 'debutant',
  goal: 10,
  onboarded: false,
  captions: true,
  liveCorr: true,
  voiceOut: true,
  saved: [],
  minutesToday: 0,
  day: today(),
  streak: 5,
  xp: 62,
  sessions: 0,
};

type Store = {
  ready: boolean;
  prefs: Prefs;
  set: (patch: Partial<Prefs>) => void;
  toggleWord: (w: Word) => void;
  isSaved: (w: Word) => boolean;
  recap: Recap | null;
  finishSession: (r: Recap) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [recap, setRecap] = useState<Recap | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
        // Nouveau jour : on remet le compteur de minutes à zéro.
        if (stored.day !== today()) Object.assign(stored, { day: today(), minutesToday: 0 });
        setPrefs(stored);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(prefs)).catch(() => {});
  }, [prefs]);

  const set = useCallback((patch: Partial<Prefs>) => setPrefs((p) => ({ ...p, ...patch })), []);

  const toggleWord = useCallback(
    (w: Word) =>
      setPrefs((p) => {
        const has = p.saved.some((s) => s.lang === p.lang && s.w === w.w);
        const saved = has
          ? p.saved.filter((s) => !(s.lang === p.lang && s.w === w.w))
          : [...p.saved, { ...w, lang: p.lang }];
        return { ...p, saved };
      }),
    [],
  );

  const isSaved = useCallback(
    (w: Word) => prefs.saved.some((s) => s.lang === prefs.lang && s.w === w.w),
    [prefs.saved, prefs.lang],
  );

  const finishSession = useCallback((r: Recap) => {
    setRecap(r);
    setPrefs((p) => {
      const sameDay = p.day === today();
      return {
        ...p,
        day: today(),
        minutesToday: (sameDay ? p.minutesToday : 0) + Math.max(1, Math.round(r.seconds / 60)),
        sessions: p.sessions + 1,
        xp: Math.min(100, p.xp + 3),
      };
    });
  }, []);

  const value = useMemo(
    () => ({ ready, prefs, set, toggleWord, isSaved, recap, finishSession }),
    [ready, prefs, set, toggleWord, isSaved, recap, finishSession],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore doit être utilisé dans <StoreProvider>');
  return s;
}
