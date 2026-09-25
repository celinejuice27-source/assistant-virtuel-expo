import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { askAgent, HELP_MESSAGE, type Msg } from '@/agent/ai';
import { getStt, silentDuration, speak, stopSpeaking } from '@/agent/voice';
import { AgentAvatar, AgentStage, type AgentState } from '@/components/agent';
import {
  ArrowClockwise,
  CaretDown,
  ClosedCaptioning,
  Keyboard,
  Lifebuoy,
  ListBullets,
  Microphone,
  PaperPlaneRight,
  PencilSimple,
  SpeakerHigh,
  SpeakerSlash,
  Stop,
  Translate,
  X,
} from '@/components/icons';
import { PulseRing, ThinkingDots, Wave } from '@/components/motion';
import { Button, Glass, GlassButton, T, Tag } from '@/components/ui';
import { getLang } from '@/data/langs';
import { getLevel } from '@/data/levels';
import { getScene } from '@/data/scenes';
import type { Word } from '@/data/scripts';
import { useStore } from '@/state/store';
import { alpha, colors, fonts, radii, shadows } from '@/theme/tokens';

const STATE_LABEL: Record<AgentState, string> = {
  idle: 'à vous de parler',
  listening: 'vous écoute…',
  thinking: 'réfléchit…',
  speaking: 'parle…',
};

const HINT: Record<AgentState, string> = {
  idle: 'Touchez le micro pour répondre, ou choisissez une idée',
  listening: 'Parlez, puis touchez à nouveau pour envoyer',
  thinking: 'Un instant…',
  speaking: "Touchez le micro pour l'interrompre",
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function Chat() {
  const params = useLocalSearchParams<{ scene?: string }>();
  const scene = getScene(params.scene);
  const { prefs, finishSession } = useStore();
  const lang = getLang(prefs.lang);
  const level = getLevel(prefs.level);
  const insets = useSafeAreaInsets();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [agentState, setAgentState] = useState<AgentState>('thinking');
  const [mode, setMode] = useState<'voix' | 'texte'>('voix');
  const [input, setInput] = useState('');
  const [capFr, setCapFr] = useState(false);
  const [captions, setCaptions] = useState(prefs.captions);
  const [sound, setSound] = useState(prefs.voiceOut);
  const [showTrans, setShowTrans] = useState(false);
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  /** Compteur de session : les réponses d'une session abandonnée sont ignorées. */
  const sid = useRef(0);
  const msgId = useRef(0);
  const msgsRef = useRef<Msg[]>([]);
  const simIdx = useRef(0);
  const listenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heard = useRef('');
  const soundRef = useRef(sound);
  const ctx = useRef({ lang, level, scene });
  useEffect(() => {
    soundRef.current = sound;
    ctx.current = { lang, level, scene };
  });

  const commit = useCallback((next: Msg[]) => {
    msgsRef.current = next;
    setMsgs(next);
  }, []);

  const clearTimers = () => {
    if (listenTimer.current) clearTimeout(listenTimer.current);
    if (silentTimer.current) clearTimeout(silentTimer.current);
    listenTimer.current = silentTimer.current = null;
  };

  /** L'agent lit sa réplique (ou simule la durée si le son est coupé), puis repasse en idle. */
  const speakOut = useCallback((text: string) => {
    const my = sid.current;
    const done = () => {
      if (sid.current === my) setAgentState((s) => (s === 'speaking' ? 'idle' : s));
    };
    setAgentState('speaking');
    if (soundRef.current) {
      speak(text, ctx.current.lang, ctx.current.level.id, done);
    } else {
      silentTimer.current = setTimeout(done, silentDuration(text));
    }
  }, []);

  const agentTurn = useCallback(
    async (history: Msg[]) => {
      const my = sid.current;
      setAgentState('thinking');
      const r = await askAgent(ctx.current, history);
      if (sid.current !== my) return;
      const next = [...history];
      // La correction porte sur le dernier message utilisateur.
      const lastUser = next.map((m) => m.role).lastIndexOf('user');
      if (lastUser >= 0) next[lastUser] = { ...next[lastUser], corr: r.correction };
      next.push({ id: ++msgId.current, role: 'agent', t: r.reply, fr: r.translation, sugg: r.suggestions });
      commit(next);
      if (r.words.length) {
        setSessionWords((ws) => [...ws, ...r.words.filter((w) => !ws.some((x) => x.w === w.w))]);
      }
      speakOut(r.reply);
    },
    [commit, speakOut],
  );

  // Démarrage de la scène (salutation de l'agent) ; on invalide la session en quittant l'écran.
  useEffect(() => {
    sid.current += 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lancement unique de la scène au montage
    agentTurn([]);
    return () => {
      sid.current += 1;
      clearTimers();
      stopSpeaking();
      getStt()?.ExpoSpeechRecognitionModule.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const send = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t) return;
      clearTimers();
      stopSpeaking();
      setInput('');
      const history = [...msgsRef.current, { id: ++msgId.current, role: 'user' as const, t }];
      commit(history);
      agentTurn(history);
    },
    [agentTurn, commit],
  );

  // Reconnaissance vocale réelle (build de développement) : on envoie le résultat final.
  useEffect(() => {
    const stt = getStt();
    if (!stt) return;
    const m = stt.ExpoSpeechRecognitionModule;
    const subs = [
      m.addListener('result', (e) => {
        heard.current = e.results[0]?.transcript ?? heard.current;
        if (e.isFinal) {
          const t = heard.current;
          heard.current = '';
          send(t);
        }
      }),
      m.addListener('end', () => setAgentState((s) => (s === 'listening' ? 'idle' : s))),
      m.addListener('error', () => setAgentState((s) => (s === 'listening' ? 'idle' : s))),
    ];
    return () => subs.forEach((s) => s.remove());
  }, [send]);

  const lastAgent = [...msgs].reverse().find((m) => m.role === 'agent');
  const lastUser = [...msgs].reverse().find((m) => m.role === 'user');

  const onMic = async () => {
    if (agentState === 'thinking') return;
    if (agentState === 'speaking') {
      // Interrompre l'agent.
      clearTimers();
      stopSpeaking();
      setAgentState('idle');
      return;
    }
    const stt = getStt();
    if (agentState === 'listening') {
      if (stt) stt.ExpoSpeechRecognitionModule.stop();
      else {
        clearTimers();
        sendSimulated();
      }
      return;
    }
    if (stt) {
      const perm = await stt.ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        setMode('texte');
        return;
      }
      heard.current = '';
      setAgentState('listening');
      stt.ExpoSpeechRecognitionModule.start({ lang: lang.voice, interimResults: true, continuous: false });
    } else {
      // Écoute simulée (Expo Go / web) : après 2 s, on envoie la suggestion suivante en alternant.
      setAgentState('listening');
      listenTimer.current = setTimeout(sendSimulated, 2000);
    }
  };

  function sendSimulated() {
    const sugg = [...msgsRef.current].reverse().find((m) => m.role === 'agent')?.sugg ?? [];
    const pick = sugg.length ? sugg[simIdx.current++ % sugg.length] : '';
    if (pick) send(pick);
    else setAgentState('idle');
  }

  const replay = () => {
    if (!lastAgent || agentState === 'thinking' || agentState === 'listening') return;
    clearTimers();
    speakOut(lastAgent.t);
  };

  const toggleSound = () => {
    if (sound) {
      stopSpeaking();
      if (agentState === 'speaking') setAgentState('idle');
    }
    setSound(!sound);
  };

  const end = () => {
    sid.current += 1;
    clearTimers();
    stopSpeaking();
    const users = msgsRef.current.filter((m) => m.role === 'user');
    finishSession({
      scene: scene.id,
      seconds: Math.round((Date.now() - t0) / 1000),
      replies: users.length,
      corrections: users.filter((m) => m.corr).map((m) => ({ wrong: m.t, fix: m.corr! })),
      words: sessionWords,
    });
    router.replace({ pathname: '/recap', params: { scene: scene.id } });
  };

  const close = () => {
    sid.current += 1;
    clearTimers();
    stopSpeaking();
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  };

  const showCorrection = prefs.liveCorr && !!lastUser?.corr && agentState !== 'thinking';
  const showChips = agentState !== 'thinking' && agentState !== 'listening' && !!lastAgent?.sugg?.length;
  const elapsed = Math.max(0, Math.floor((now - t0) / 1000));

  return (
    <View style={styles.root}>
      <AgentStage state={agentState} />
      <LinearGradient
        pointerEvents="none"
        colors={[alpha(colors.bg, 0.75), alpha(colors.bg, 0), alpha(colors.bg, 0), alpha(colors.bg, 0.88), colors.bg]}
        locations={[0, 0.16, 0.42, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={[alpha(colors.bg, 0.55), alpha(colors.bg, 0)]}
        locations={[0, 0.18]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Barre du haut */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <GlassButton icon={CaretDown} label="Retour à l'accueil" onPress={close} />
        <View style={{ flex: 1, gap: 4 }}>
          <Tag label={`${lang.agent} · ${lang.city}`} style={{ backgroundColor: alpha(colors.bg, 0.55) }} />
          <T numberOfLines={1} style={styles.sceneLine}>
            {scene.title} · <T style={styles.timer}>{fmt(elapsed)}</T>
          </T>
        </View>
        <Button kind="secondary" compact label="Terminer" onPress={end} style={{ backgroundColor: alpha(colors.bg, 0.55) }} />
      </View>

      {/* Colonne d'actions */}
      <View style={[styles.actions, { top: insets.top + 96 }]}>
        <GlassButton icon={Translate} label="Traduire" active={capFr} onPress={() => setCapFr((v) => !v)} />
        <GlassButton icon={sound ? SpeakerHigh : SpeakerSlash} label={sound ? 'Couper le son' : 'Activer le son'} onPress={toggleSound} />
        <GlassButton icon={ArrowClockwise} label="Réécouter" onPress={replay} />
        <GlassButton icon={ClosedCaptioning} label="Sous-titres" active={captions} onPress={() => setCaptions((v) => !v)} />
        <GlassButton icon={ListBullets} label="Transcription" onPress={() => setShowTrans(true)} />
      </View>

      {/* Pile du bas */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        {showCorrection && lastUser?.corr ? (
          <Glass opacity={0} style={[styles.toast, shadows.sm]}>
            <View style={styles.toastIcon}>
              <PencilSimple size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T style={styles.wrong}>{lastUser.t}</T>
              <T style={styles.fixed}>{lastUser.corr.corrected}</T>
              {lastUser.corr.why ? <T style={styles.why}>{lastUser.corr.why}</T> : null}
            </View>
          </Glass>
        ) : null}

        <View style={styles.status}>
          <AgentAvatar state={agentState} />
          <T style={styles.statusText}>
            {lang.agent} {STATE_LABEL[agentState]}
          </T>
          {agentState === 'speaking' ? <Wave /> : null}
        </View>

        {agentState === 'thinking' ? (
          <ThinkingDots />
        ) : captions && lastAgent ? (
          <View style={{ gap: 6 }}>
            <T style={styles.caption}>{lastAgent.t}</T>
            {capFr && lastAgent.fr ? <T style={styles.captionFr}>{lastAgent.fr}</T> : null}
          </View>
        ) : null}

        {showChips ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
            {lastAgent!.sugg!.map((s) => (
              <Pressable key={s} onPress={() => send(s)} accessibilityRole="button">
                {({ pressed }) => (
                  <Glass style={[styles.chip, pressed && { borderColor: colors.accent }]}>
                    <T style={[styles.chipText, pressed && { color: colors.accent300 }]}>{s}</T>
                  </Glass>
                )}
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {mode === 'voix' ? (
          <View style={{ gap: 8, alignItems: 'center' }}>
            <View style={styles.controls}>
              <GlassButton icon={Keyboard} label="Écrire" onPress={() => setMode('texte')} />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={agentState === 'listening' ? "Arrêter l'écoute" : 'Parler'}
                onPress={onMic}
                style={styles.micWrap}>
                {agentState === 'listening' ? <PulseRing size={68} /> : null}
                <View style={[styles.mic, agentState === 'listening' && { backgroundColor: alpha(colors.accent, 0.22) }]}>
                  {agentState === 'listening' ? (
                    <Stop size={26} weight="fill" color={colors.accent200} />
                  ) : (
                    <Microphone size={28} weight="fill" color={colors.accent200} />
                  )}
                </View>
              </Pressable>
              <GlassButton
                icon={Lifebuoy}
                label="Aide en français"
                onPress={() => agentState !== 'thinking' && send(HELP_MESSAGE)}
              />
            </View>
            <T style={styles.hint}>{HINT[agentState]}</T>
          </View>
        ) : (
          <View style={styles.textRow}>
            <GlassButton icon={Microphone} label="Mode voix" onPress={() => setMode('voix')} />
            <Glass style={styles.inputWrap}>
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={`Écrivez en ${lang.inName}…`}
                placeholderTextColor={colors.neutral600}
                style={styles.input}
                returnKeyType="send"
                onSubmitEditing={() => agentState !== 'thinking' && send(input)}
                autoFocus
              />
            </Glass>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Envoyer"
              disabled={agentState === 'thinking' || !input.trim()}
              onPress={() => send(input)}
              style={({ pressed }) => [styles.sendBtn, pressed && { backgroundColor: alpha(colors.accent, 0.22) }]}>
              <PaperPlaneRight size={20} weight="fill" color={colors.accent300} />
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>

      <TranscriptSheet visible={showTrans} onClose={() => setShowTrans(false)} msgs={msgs} bottomInset={insets.bottom} />
    </View>
  );
}

function TranscriptSheet({
  visible,
  onClose,
  msgs,
  bottomInset,
}: {
  visible: boolean;
  onClose: () => void;
  msgs: Msg[];
  bottomInset: number;
}) {
  const scroll = useRef<ScrollView>(null);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.veil} onPress={onClose} accessibilityLabel="Fermer la transcription" />
      <View style={[styles.sheet, shadows.lg, { paddingBottom: bottomInset + 12 }]}>
        <View style={styles.sheetHead}>
          <T variant="label" style={{ fontSize: 17, flex: 1 }}>
            Transcription
          </T>
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Fermer" hitSlop={10} style={styles.close}>
            <X size={20} color={colors.text} />
          </Pressable>
        </View>
        <ScrollView
          ref={scroll}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
          {msgs.map((m) =>
            m.role === 'agent' ? (
              <Pressable key={m.id} onPress={() => setOpen((o) => ({ ...o, [m.id]: !o[m.id] }))} style={{ maxWidth: '88%', gap: 4 }}>
                <T style={{ fontSize: 15, lineHeight: 22 }}>{m.t}</T>
                {open[m.id] && m.fr ? <T style={{ fontSize: 13, lineHeight: 19, color: colors.accent300 }}>{m.fr}</T> : null}
              </Pressable>
            ) : (
              <View key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '82%', alignItems: 'flex-end', gap: 4 }}>
                <View style={styles.userBubble}>
                  <T style={[{ fontSize: 15, lineHeight: 21 }, m.corr && styles.strike]}>{m.t}</T>
                </View>
                {m.corr ? <T style={{ fontSize: 13, lineHeight: 19, color: colors.accent300 }}>{m.corr.corrected}</T> : null}
              </View>
            ),
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  top: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  sceneLine: { fontSize: 12, color: colors.neutral300 },
  timer: { fontFamily: fonts.mono, fontSize: 11, fontWeight: '500', letterSpacing: 1.1, color: colors.neutral300 },
  actions: { position: 'absolute', right: 16, gap: 10 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, gap: 12 },
  toast: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: radii.lg,
    padding: 12,
    backgroundColor: alpha(colors.surface, 0.88),
  },
  toastIcon: { paddingTop: 2 },
  wrong: { fontSize: 12, lineHeight: 17, color: colors.neutral500, textDecorationLine: 'line-through' },
  fixed: { fontSize: 14, lineHeight: 20, color: colors.accent300, fontFamily: fonts.medium },
  why: { fontSize: 12, lineHeight: 17, color: colors.neutral400 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { fontSize: 13, color: colors.neutral300 },
  caption: { fontFamily: fonts.medium, fontSize: 20, lineHeight: 20 * 1.32, paddingRight: 8 },
  captionFr: { fontSize: 14, lineHeight: 20, color: colors.accent300 },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    paddingHorizontal: 14,
    height: 36,
    justifyContent: 'center',
  },
  chipText: { fontSize: 13 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  micWrap: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  mic: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(colors.bg, 0.55),
  },
  hint: { fontSize: 12, color: colors.neutral500, textAlign: 'center' },
  textRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWrap: { flex: 1, height: 44, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.divider, justifyContent: 'center' },
  input: { color: colors.text, fontFamily: fonts.regular, fontSize: 15, paddingHorizontal: 16, height: 44 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  veil: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: alpha(colors.neutral900, 0.5) },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', height: 44 },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
  userBubble: {
    backgroundColor: colors.accent900,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  strike: { textDecorationLine: 'line-through', color: colors.neutral400 },
});
