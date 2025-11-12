export const colors = {
  primary: {
    DEFAULT: '#14b8a6',
    dark: '#0d9488',
  },
  accent: {
    DEFAULT: '#fbbf24',
    dark: '#f59e0b',
  },
  background: {
    dark: '#1a1a1a',
    light: '#ffffff',
  },
  surface: {
    dark: '#2d2d2d',
    light: '#f3f4f6',
  },
  text: {
    dark: '#f3f4f6',
    light: '#1a1a1a',
    muted: '#9ca3af',
  },
} as const;

export type ColorTheme = 'dark' | 'light';

