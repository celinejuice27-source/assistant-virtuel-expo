import type { Lang } from '@/data/langs';
import type { Level } from '@/data/levels';
import type { Scene } from '@/data/scenes';
import { SCRIPTS, type Correction, type Word } from '@/data/scripts';

export type Msg = {
  id: number;
  role: 'agent' | 'user';
  t: string;
  /** Traduction française (agent). */
  fr?: string;
  /** Idées de réponse (agent). */
  sugg?: string[];
  /** Correction du message (utilisateur). */
  corr?: Correction | null;
};

export type AgentReply = {
  reply: string;
  translation: string;
  correction: Correction | null;
  suggestions: string[];
  words: Word[];
};

export type AgentContext = { lang: Lang; level: Level; scene: Scene };

export const HELP_MESSAGE = "(En français) Je ne sais pas comment dire ça, tu peux m'aider ?";
const START_MESSAGE = '(Commence la scène : salue-moi et lance la conversation.)';

/** URL du proxy backend (jamais de clé API dans l'app). */
const API_URL = process.env.EXPO_PUBLIC_PARLA_API_URL;

export function buildSystemPrompt({ lang, level, scene }: AgentContext) {
  return `Tu es ${lang.agent}, partenaire de conversation native (${lang.native}, ${lang.city}) dans une app d'apprentissage des langues.
Tu parles UNIQUEMENT en ${lang.native}, même si l'apprenant écrit en français.
Scène : « ${scene.title} » (${scene.role}). Niveau de l'apprenant : ${level.label} (${level.cefr}) — adapte vocabulaire et longueur.
Réponses courtes (1 à 2 phrases), naturelles, qui se terminent par une question.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour :
{"reply":"…","translation":"traduction française","correction":null | {"corrected":"…","why":"explication très courte en français"},
 "suggestions":["réponse correcte","réponse avec une erreur typique d'apprenant francophone"],
 "words":[{"w":"mot utile","fr":"traduction"}]}
La correction porte sur le dernier message de l'apprenant (null s'il est correct ou absent).`;
}

export function toApiMessages(history: Msg[]) {
  const messages = history.map((m) => ({
    role: m.role === 'agent' ? ('assistant' as const) : ('user' as const),
    content: m.t,
  }));
  // L'API attend un premier message utilisateur.
  if (!messages.length || messages[0].role !== 'user') messages.unshift({ role: 'user', content: START_MESSAGE });
  return messages;
}

/** Extrait le JSON entre le premier `{` et le dernier `}`. */
export function parseReply(text: string): AgentReply {
  const raw = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
  if (typeof raw.reply !== 'string' || !raw.reply) throw new Error('Réponse vide');
  const corr = raw.correction;
  return {
    reply: raw.reply,
    translation: typeof raw.translation === 'string' ? raw.translation : '',
    correction:
      corr && typeof corr.corrected === 'string' ? { corrected: corr.corrected, why: String(corr.why ?? '') } : null,
    suggestions: Array.isArray(raw.suggestions) ? raw.suggestions.filter((s: unknown) => typeof s === 'string').slice(0, 3) : [],
    words: Array.isArray(raw.words)
      ? raw.words.filter((w: Word) => w && typeof w.w === 'string' && typeof w.fr === 'string').slice(0, 4)
      : [],
  };
}

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/** Script hors ligne : tour suivant selon le nombre de répliques de l'agent. */
export function offlineReply(ctx: AgentContext, history: Msg[]): AgentReply {
  const script = SCRIPTS[ctx.lang.code];
  const agentTurns = history.filter((m) => m.role === 'agent').length;
  const turn = script[agentTurns % script.length];
  const prev = agentTurns > 0 ? script[(agentTurns - 1) % script.length] : null;
  const lastUser = [...history].reverse().find((m) => m.role === 'user');
  const correction = prev && lastUser && norm(lastUser.t) === norm(prev.bad) ? prev.fix : null;
  return {
    reply: turn.reply,
    translation: turn.fr,
    correction,
    suggestions: [turn.good, turn.bad],
    words: turn.words,
  };
}

/** Demande la réplique suivante à l'IA (via le backend), avec repli hors ligne. */
export async function askAgent(ctx: AgentContext, history: Msg[]): Promise<AgentReply> {
  if (!API_URL) {
    await new Promise((r) => setTimeout(r, 900));
    return offlineReply(ctx, history);
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: buildSystemPrompt(ctx), messages: toApiMessages(history) }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { text?: string };
    return parseReply(data.text ?? '');
  } catch (e) {
    console.warn('[Parla] IA indisponible, repli hors ligne :', e);
    return offlineReply(ctx, history);
  } finally {
    clearTimeout(timer);
  }
}
