export type LangCode = 'en' | 'es' | 'it' | 'de' | 'ja' | 'pt';

export type Lang = {
  code: LangCode;
  /** Nom en français (« Anglais »). */
  name: string;
  /** Nom natif (« English »), utilisé aussi dans le prompt. */
  native: string;
  /** Nom avec article/préposition pour les phrases (« en anglais »). */
  inName: string;
  agent: string;
  city: string;
  voice: string;
  hello: string;
  helloFr: string;
};

export const LANGS: Lang[] = [
  {
    code: 'en',
    name: 'Anglais',
    native: 'English',
    inName: 'anglais',
    agent: 'Emma',
    city: 'Londres',
    voice: 'en-GB',
    hello: "Hi, I'm Emma! From now on, we'll only speak English together. Ready?",
    helloFr: "Salut, je suis Emma ! À partir de maintenant, on ne parlera qu'anglais ensemble. Prêt ?",
  },
  {
    code: 'es',
    name: 'Espagnol',
    native: 'Español',
    inName: 'espagnol',
    agent: 'Lucía',
    city: 'Madrid',
    voice: 'es-ES',
    hello: '¡Hola, soy Lucía! A partir de ahora, solo hablaremos en español. ¿Listo?',
    helloFr: "Salut, je suis Lucía ! À partir de maintenant, on ne parlera qu'espagnol. Prêt ?",
  },
  {
    code: 'it',
    name: 'Italien',
    native: 'Italiano',
    inName: 'italien',
    agent: 'Giulia',
    city: 'Rome',
    voice: 'it-IT',
    hello: 'Ciao, sono Giulia! Da adesso parleremo solo in italiano. Pronto?',
    helloFr: "Salut, je suis Giulia ! À partir de maintenant, on ne parlera qu'italien. Prêt ?",
  },
  {
    code: 'de',
    name: 'Allemand',
    native: 'Deutsch',
    inName: 'allemand',
    agent: 'Lena',
    city: 'Berlin',
    voice: 'de-DE',
    hello: 'Hallo, ich bin Lena! Ab jetzt sprechen wir nur noch Deutsch miteinander. Bereit?',
    helloFr: "Salut, je suis Lena ! À partir de maintenant, on ne parlera qu'allemand ensemble. Prêt ?",
  },
  {
    code: 'ja',
    name: 'Japonais',
    native: '日本語',
    inName: 'japonais',
    agent: 'Yui',
    city: 'Tokyo',
    voice: 'ja-JP',
    hello: 'こんにちは、ユイです！これからは日本語だけで話しましょう。準備はいいですか？',
    helloFr: "Bonjour, je suis Yui ! À partir de maintenant, on ne parlera qu'en japonais. Prêt ?",
  },
  {
    code: 'pt',
    name: 'Portugais',
    native: 'Português',
    inName: 'portugais',
    agent: 'Inês',
    city: 'Lisbonne',
    voice: 'pt-PT',
    hello: 'Olá, eu sou a Inês! A partir de agora, só vamos falar português. Preparado?',
    helloFr: "Salut, je suis Inês ! À partir de maintenant, on ne parlera que portugais. Prêt ?",
  },
];

export function getLang(code: LangCode): Lang {
  return LANGS.find((l) => l.code === code) ?? LANGS[0];
}
