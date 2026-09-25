import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { useState } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { PulseRing } from '@/components/motion';
import { colors } from '@/theme/tokens';

export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const AGENT_IMAGES = {
  call: require('../../assets/agent/agent-call.png'),
  portrait: require('../../assets/agent/agent-portrait.png'),
  wide: require('../../assets/agent/agent-wide.png'),
  avatar: require('../../assets/agent/agent-avatar.png'),
  smile: require('../../assets/agent/agent-smile.png'),
  listen: require('../../assets/agent/agent-listen.png'),
  speak: require('../../assets/agent/agent-speak.png'),
  think: require('../../assets/agent/agent-think.png'),
};

/** Dimensions intrinsèques des portraits, pour le recadrage « cover ». */
const SIZES = {
  call: [754, 1580],
  portrait: [1050, 2140],
  wide: [725, 1199],
} as const;

/**
 * Image plein cadre équivalente à `object-fit: cover; object-position: x y`
 * (calcul explicite : fiable sur iOS, Android et web).
 */
export function CoverImage({
  name,
  x = 0.5,
  y = 0.5,
  style,
}: {
  name: keyof typeof SIZES;
  x?: number;
  y?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [iw, ih] = SIZES[name];
  let img = null;
  if (box) {
    const s = Math.max(box.w / iw, box.h / ih);
    const dw = iw * s;
    const dh = ih * s;
    img = (
      <Image
        source={AGENT_IMAGES[name]}
        style={{ position: 'absolute', width: dw, height: dh, left: (box.w - dw) * x, top: (box.h - dh) * y }}
      />
    );
  }
  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }, style]}
      onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {img}
    </View>
  );
}

const FACE: Record<AgentState, keyof typeof AGENT_IMAGES> = {
  idle: 'smile',
  listening: 'listen',
  thinking: 'think',
  speaking: 'speak',
};

/**
 * Boucles vidéo par état (9:16, 1080 × 1920, 25 i/s) à fournir pour la
 * production, par ex. `speaking: require('../../assets/agent/emma-speak.mp4')`.
 * Tant qu'elles sont absentes, le portrait fixe est affiché.
 */
export const AGENT_VIDEOS: Partial<Record<AgentState, VideoSource>> = {};

/** Avatar rond de 32 px dont l'expression suit l'état de l'agent. */
export function AgentAvatar({ state, size = 32 }: { state: AgentState; size?: number }) {
  const active = state === 'speaking' || state === 'listening';
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {active ? <PulseRing size={size} /> : null}
      <Image
        source={AGENT_IMAGES[FACE[state]]}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: active ? 1.5 : 0,
          borderColor: colors.accent,
        }}
      />
    </View>
  );
}

function AgentVideo({ source }: { source: VideoSource }) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />;
}

/** Fond plein écran : boucle vidéo de l'état courant si disponible, sinon le portrait. */
export function AgentStage({ state }: { state: AgentState }) {
  const video = AGENT_VIDEOS[state] ?? AGENT_VIDEOS.idle;
  if (video) return <AgentVideo key={state} source={video} />;
  return <CoverImage name="call" x={0.3} y={0.15} />;
}
