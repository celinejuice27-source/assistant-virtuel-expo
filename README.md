# Parla — assistant virtuel (Expo)

Application React Native + Expo (TypeScript) pour apprendre une langue en conversant avec un agent
virtuel au visage réaliste. Implémentation du handoff de design « Parla » (système Nocturne, thème sombre).

## Démarrer

```bash
npm install
npx expo start          # puis « a » pour Android, « i » pour iOS, « w » pour le web
```

Dans **Expo Go**, tout fonctionne sauf la reconnaissance vocale (module natif) : l'écoute est alors
simulée (après 2 s, la suggestion suivante est envoyée, en alternant correcte / fautive).
Pour la vraie reconnaissance vocale, faites un build de développement :

```bash
npx expo run:android    # ou : npx eas-cli@latest build --profile development
```

## Agent IA (Claude)

Sans configuration, l'agent suit un script hors ligne de 4 tours par langue (`src/data/scripts.ts`).
Pour brancher Claude (Haiku 4.5, `max_tokens` 600), lancez le proxy : la clé API reste côté serveur.

```bash
cd server && npm install
ANTHROPIC_API_KEY=sk-ant-... npm start          # http://localhost:8787/chat
```

Puis, à la racine, copiez `.env.example` en `.env` et relancez `npx expo start`.
Le prompt système est construit dans `src/agent/ai.ts` ; en cas d'erreur réseau, l'app repasse sur le script hors ligne.

## Structure

| Dossier | Contenu |
|---|---|
| `src/app/` | Écrans (Expo Router) : `welcome`, `langue`, `niveau`, `agent`, `(tabs)/home · scenes · vocab · profil`, `chat`, `recap` |
| `src/components/` | UI Nocturne (boutons, tags, verre, interrupteurs), animations (pulse, onde, points), agent (avatar d'état, fond vidéo/image), barre d'onglets |
| `src/agent/` | Prompt + appel IA + repli hors ligne (`ai.ts`), TTS `expo-speech` et STT `expo-speech-recognition` (`voice.ts`) |
| `src/data/` | Langues/agents, niveaux, scènes, scripts hors ligne |
| `src/state/store.tsx` | Préférences et progression persistées (AsyncStorage) + récap de session |
| `src/theme/tokens.ts` | Tokens de design (couleurs, rayons, espacements, ombres, polices) |
| `assets/agent/` | Portraits et expressions de l'agent |
| `server/` | Proxy Node vers l'API Claude (SDK officiel) |

## Vidéo de l'agent

Les boucles vidéo par état (repos, écoute, parle, réfléchit — 9:16, 1080 × 1920, 25 i/s) ne sont pas encore
produites. Déposez-les dans `assets/agent/` et référencez-les dans `AGENT_VIDEOS` (`src/components/agent.tsx`) :
`expo-video` les jouera en fond de la conversation à la place du portrait fixe.

## Vérifications

```bash
npm run typecheck
npm run lint
```
