import { Platform } from 'react-native';

/** Système « Nocturne » (thème sombre). Source : handoff Parla. */
export const colors = {
  bg: '#161826',
  surface: '#232532',
  text: '#e9e9ed',
  accent: '#9184d9',
  divider: 'rgba(233,233,237,0.16)',
  neutral300: '#cfd3e5',
  neutral400: '#b2b6ca',
  neutral500: '#9397ab',
  neutral600: '#75798c',
  neutral800: '#3f424d',
  neutral900: '#292b31',
  accent100: '#f5f4ff',
  accent200: '#e7e5fe',
  accent300: '#d2cefd',
  accent400: '#b5abfc',
  accent800: '#423a6a',
  accent900: '#2b2741',
} as const;

/** Couleur hex + opacité → rgba. */
export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export const radii = { sm: 4, md: 8, lg: 14, pill: 999 } as const;

export const space = { xs: 2.8, sm: 5.6, md: 8.4, lg: 11.2, xl: 16.8, xxl: 22.4, screen: 20 } as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
} as const;

/** Ombres : liseré + obscurité ambiante (le liseré est rendu par une bordure). */
export const shadows = {
  sm: { borderWidth: 1, borderColor: '#3f424d' },
  md: {
    borderWidth: 1,
    borderColor: '#595d6c',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  lg: {
    borderWidth: 1,
    borderColor: '#9397ab',
    shadowColor: '#000',
    shadowOpacity: 0.65,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;
