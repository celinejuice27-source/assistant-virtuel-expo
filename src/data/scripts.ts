import type { LangCode } from './langs';

export type Word = { w: string; fr: string };
export type Correction = { corrected: string; why: string };

/**
 * Tour de script hors ligne : la réplique de l'agent, sa traduction,
 * une suggestion correcte, une suggestion fautive et sa correction.
 */
export type ScriptTurn = {
  reply: string;
  fr: string;
  good: string;
  bad: string;
  fix: Correction;
  words: Word[];
};

/**
 * Repli hors ligne : 4 tours par langue, utilisés quand le backend IA
 * n'est pas configuré ou ne répond pas.
 */
export const SCRIPTS: Record<LangCode, ScriptTurn[]> = {
  en: [
    {
      reply: "Hi! I'm Emma. How are you doing today?",
      fr: "Salut ! Je suis Emma. Comment ça va aujourd'hui ?",
      good: "I'm fine, thanks. I'm a bit tired.",
      bad: 'I am fine, I have tired.',
      fix: { corrected: "I'm fine, I'm tired.", why: 'En anglais, on « est » fatigué : be tired, pas have.' },
      words: [{ w: 'tired', fr: 'fatigué' }],
    },
    {
      reply: 'Oh, why are you tired? Did you work a lot today?',
      fr: "Oh, pourquoi es-tu fatigué ? Tu as beaucoup travaillé aujourd'hui ?",
      good: 'Yes, I worked all day at the office.',
      bad: 'Yes, I have worked all the day.',
      fix: { corrected: 'Yes, I worked all day.', why: 'Action terminée aujourd’hui : prétérit ; et « all day » sans « the ».' },
      words: [{ w: 'all day', fr: 'toute la journée' }],
    },
    {
      reply: 'That sounds exhausting! What do you like to do to relax?',
      fr: "Ça a l'air épuisant ! Qu'est-ce que tu aimes faire pour te détendre ?",
      good: 'I like reading and listening to music.',
      bad: 'I like read books.',
      fix: { corrected: 'I like reading books.', why: 'Après « like », on utilise la forme en -ing (ou to + verbe).' },
      words: [{ w: 'to relax', fr: 'se détendre' }],
    },
    {
      reply: 'Nice! What kind of music do you listen to?',
      fr: "Sympa ! Quel genre de musique écoutes-tu ?",
      good: 'I mostly listen to jazz and pop.',
      bad: 'I listen jazz.',
      fix: { corrected: 'I listen to jazz.', why: 'On dit « listen to » : la préposition est obligatoire.' },
      words: [{ w: 'mostly', fr: 'surtout' }],
    },
  ],
  es: [
    {
      reply: '¡Hola! Soy Lucía. ¿Qué tal estás hoy?',
      fr: "Salut ! Je suis Lucía. Comment vas-tu aujourd'hui ?",
      good: 'Estoy bien, gracias. Un poco cansado.',
      bad: 'Soy bien, gracias.',
      fix: { corrected: 'Estoy bien, gracias.', why: 'Pour un état passager, on utilise « estar », pas « ser ».' },
      words: [{ w: 'cansado', fr: 'fatigué' }],
    },
    {
      reply: '¿Y por qué estás cansado? ¿Has trabajado mucho?',
      fr: 'Et pourquoi es-tu fatigué ? Tu as beaucoup travaillé ?',
      good: 'Sí, he trabajado todo el día.',
      bad: 'Sí, he trabajado toda la día.',
      fix: { corrected: 'Sí, he trabajado todo el día.', why: '« Día » est masculin malgré son -a final : el día.' },
      words: [{ w: 'todo el día', fr: 'toute la journée' }],
    },
    {
      reply: '¡Qué pesado! ¿Qué te gusta hacer para descansar?',
      fr: "Quelle fatigue ! Qu'est-ce que tu aimes faire pour te reposer ?",
      good: 'Me gusta leer y escuchar música.',
      bad: 'Yo gusto leer.',
      fix: { corrected: 'Me gusta leer.', why: '« Gustar » se construit avec le pronom : me gusta (ça me plaît).' },
      words: [{ w: 'descansar', fr: 'se reposer' }],
    },
    {
      reply: '¡Genial! ¿Qué tipo de música escuchas?',
      fr: 'Génial ! Quel genre de musique écoutes-tu ?',
      good: 'Escucho sobre todo pop y flamenco.',
      bad: 'Escucho a la música pop.',
      fix: { corrected: 'Escucho música pop.', why: 'Pas de « a » devant un complément qui n’est pas une personne.' },
      words: [{ w: 'sobre todo', fr: 'surtout' }],
    },
  ],
  it: [
    {
      reply: 'Ciao! Sono Giulia. Come stai oggi?',
      fr: "Salut ! Je suis Giulia. Comment vas-tu aujourd'hui ?",
      good: 'Sto bene, grazie. Sono un po’ stanco.',
      bad: 'Sono bene, grazie.',
      fix: { corrected: 'Sto bene, grazie.', why: 'Pour dire comment on va, on utilise « stare » : sto bene.' },
      words: [{ w: 'stanco', fr: 'fatigué' }],
    },
    {
      reply: 'Perché sei stanco? Hai lavorato molto?',
      fr: 'Pourquoi es-tu fatigué ? Tu as beaucoup travaillé ?',
      good: 'Sì, ho lavorato tutto il giorno.',
      bad: 'Sì, sono lavorato tutto il giorno.',
      fix: { corrected: 'Sì, ho lavorato tutto il giorno.', why: '« Lavorare » se conjugue avec l’auxiliaire « avere ».' },
      words: [{ w: 'tutto il giorno', fr: 'toute la journée' }],
    },
    {
      reply: 'Che fatica! Cosa ti piace fare per rilassarti?',
      fr: "Quelle fatigue ! Qu'est-ce que tu aimes faire pour te détendre ?",
      good: 'Mi piace leggere e ascoltare musica.',
      bad: 'Io piaccio leggere.',
      fix: { corrected: 'Mi piace leggere.', why: '« Piacere » se construit avec le pronom : mi piace (ça me plaît).' },
      words: [{ w: 'rilassarsi', fr: 'se détendre' }],
    },
    {
      reply: 'Bello! Che tipo di musica ascolti?',
      fr: 'Chouette ! Quel genre de musique écoutes-tu ?',
      good: 'Ascolto soprattutto jazz e musica italiana.',
      bad: 'Ascolto alla musica jazz.',
      fix: { corrected: 'Ascolto musica jazz.', why: '« Ascoltare » est transitif direct : pas de préposition.' },
      words: [{ w: 'soprattutto', fr: 'surtout' }],
    },
  ],
  de: [
    {
      reply: 'Hallo! Ich bin Lena. Wie geht es dir heute?',
      fr: "Salut ! Je suis Lena. Comment vas-tu aujourd'hui ?",
      good: 'Mir geht es gut, danke. Ich bin ein bisschen müde.',
      bad: 'Ich geht es gut, danke.',
      fix: { corrected: 'Mir geht es gut, danke.', why: 'Tournure au datif : « es geht mir » (ça me va).' },
      words: [{ w: 'müde', fr: 'fatigué' }],
    },
    {
      reply: 'Warum bist du müde? Hast du viel gearbeitet?',
      fr: 'Pourquoi es-tu fatigué ? Tu as beaucoup travaillé ?',
      good: 'Ja, ich habe den ganzen Tag gearbeitet.',
      bad: 'Ja, ich habe gearbeitet den ganzen Tag.',
      fix: { corrected: 'Ja, ich habe den ganzen Tag gearbeitet.', why: 'Le participe passé se place en fin de phrase.' },
      words: [{ w: 'den ganzen Tag', fr: 'toute la journée' }],
    },
    {
      reply: 'Wie anstrengend! Was machst du gern zur Entspannung?',
      fr: "Comme c'est fatigant ! Qu'aimes-tu faire pour te détendre ?",
      good: 'Ich lese gern und höre Musik.',
      bad: 'Ich gern lese.',
      fix: { corrected: 'Ich lese gern.', why: 'Le verbe conjugué est en 2ᵉ position ; « gern » vient après.' },
      words: [{ w: 'die Entspannung', fr: 'la détente' }],
    },
    {
      reply: 'Schön! Welche Musik hörst du am liebsten?',
      fr: 'Super ! Quelle musique préfères-tu écouter ?',
      good: 'Ich höre am liebsten Jazz.',
      bad: 'Ich höre am liebsten die Jazz.',
      fix: { corrected: 'Ich höre am liebsten Jazz.', why: 'Pas d’article devant un genre musical pris en général.' },
      words: [{ w: 'am liebsten', fr: 'de préférence' }],
    },
  ],
  ja: [
    {
      reply: 'こんにちは！ユイです。今日は元気ですか？',
      fr: "Bonjour ! Je suis Yui. Tu vas bien aujourd'hui ?",
      good: 'はい、元気です。ちょっと疲れています。',
      bad: 'はい、元気ます。',
      fix: { corrected: 'はい、元気です。', why: '« 元気 » est un nom : on utilise です, pas ます.' },
      words: [{ w: '疲れています (tsukarete imasu)', fr: 'être fatigué' }],
    },
    {
      reply: 'どうして疲れていますか？たくさん働きましたか？',
      fr: 'Pourquoi es-tu fatigué ? Tu as beaucoup travaillé ?',
      good: 'はい、一日中働きました。',
      bad: 'はい、一日中働きます。',
      fix: { corrected: 'はい、一日中働きました。', why: 'Action passée : forme ました, pas ます.' },
      words: [{ w: '一日中 (ichinichijū)', fr: 'toute la journée' }],
    },
    {
      reply: '大変でしたね！リラックスするために何をするのが好きですか？',
      fr: "C'était dur ! Qu'aimes-tu faire pour te détendre ?",
      good: '本を読むのが好きです。',
      bad: '本を読むが好きです。',
      fix: { corrected: '本を読むのが好きです。', why: 'Il faut nominaliser le verbe avec の avant が好き.' },
      words: [{ w: '好き (suki)', fr: 'aimer' }],
    },
    {
      reply: 'いいですね！どんな本を読みますか？',
      fr: 'Sympa ! Quel genre de livres lis-tu ?',
      good: '小説をよく読みます。',
      bad: '小説がよく読みます。',
      fix: { corrected: '小説をよく読みます。', why: 'Le complément d’objet prend la particule を, pas が.' },
      words: [{ w: '小説 (shōsetsu)', fr: 'roman' }],
    },
  ],
  pt: [
    {
      reply: 'Olá! Sou a Inês. Como estás hoje?',
      fr: "Salut ! Je suis Inês. Comment vas-tu aujourd'hui ?",
      good: 'Estou bem, obrigado. Um pouco cansado.',
      bad: 'Sou bem, obrigado.',
      fix: { corrected: 'Estou bem, obrigado.', why: 'Pour un état passager, on utilise « estar », pas « ser ».' },
      words: [{ w: 'cansado', fr: 'fatigué' }],
    },
    {
      reply: 'Porque estás cansado? Trabalhaste muito?',
      fr: 'Pourquoi es-tu fatigué ? Tu as beaucoup travaillé ?',
      good: 'Sim, trabalhei o dia todo.',
      bad: 'Sim, tenho trabalhado hoje o dia todo.',
      fix: { corrected: 'Sim, trabalhei o dia todo.', why: 'Action ponctuelle terminée : pretérito perfeito (trabalhei).' },
      words: [{ w: 'o dia todo', fr: 'toute la journée' }],
    },
    {
      reply: 'Que cansativo! O que gostas de fazer para relaxar?',
      fr: "Comme c'est fatigant ! Qu'aimes-tu faire pour te détendre ?",
      good: 'Gosto de ler e de ouvir música.',
      bad: 'Gosto ler.',
      fix: { corrected: 'Gosto de ler.', why: '« Gostar » est toujours suivi de la préposition « de ».' },
      words: [{ w: 'relaxar', fr: 'se détendre' }],
    },
    {
      reply: 'Que bom! Que tipo de música ouves?',
      fr: 'Super ! Quel genre de musique écoutes-tu ?',
      good: 'Ouço sobretudo fado e pop.',
      bad: 'Eu ouvo fado.',
      fix: { corrected: 'Eu ouço fado.', why: '« Ouvir » est irrégulier : eu ouço.' },
      words: [{ w: 'sobretudo', fr: 'surtout' }],
    },
  ],
};
