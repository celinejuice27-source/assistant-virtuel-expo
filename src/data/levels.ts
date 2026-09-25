export type LevelId = 'debutant' | 'intermediaire' | 'avance';

export type Level = {
  id: LevelId;
  label: string;
  cefr: string;
  /** Tag affiché sur l'accueil. */
  tag: string;
  desc: string;
};

export const LEVELS: Level[] = [
  { id: 'debutant', label: 'Débutant', cefr: 'A1–A2', tag: 'A2', desc: 'Je connais quelques mots et phrases simples.' },
  { id: 'intermediaire', label: 'Intermédiaire', cefr: 'B1–B2', tag: 'B1', desc: 'Je me débrouille dans les situations courantes.' },
  { id: 'avance', label: 'Avancé', cefr: 'C1–C2', tag: 'C1', desc: 'Je veux gagner en aisance et en nuance.' },
];

export const GOALS = [5, 10, 15, 20] as const;
export type Goal = (typeof GOALS)[number];

export function getLevel(id: LevelId): Level {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
