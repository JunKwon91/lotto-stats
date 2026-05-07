// 4px base unit. Aligned with DESIGN.md spacing scale.

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  containerMargin: 16,
  gutter: 12,
  stackSm: 8,
  stackMd: 16,
  stackLg: 24,
} as const;

export const radius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
