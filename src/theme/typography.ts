// Manrope (display/headlines/ball-numbers) + Inter (body/labels).
// Note: fonts must be linked via react-native.config.js + iOS Info.plist + android assets to render.

export const typography = {
  displayLg: {
    fontFamily: 'Manrope',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
  },
  headlineMd: {
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  bodyBase: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySm: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  labelCaps: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
  ballNumber: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700' as const,
    lineHeight: 15,
  },
} as const;

export type Typography = typeof typography;
