// LottoStats color tokens — aligned with Figma Variables (file 0YQttqpYf0Bk6dIiVVcnLa).
// Two-tier system: primitives (raw slate scales) → semantic (role-based aliases).

const primitives = {
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1D2027',
    850: '#191B23',
    900: '#0F172A',
    950: '#0B0E15',
  },
  slateDark: {
    200: '#E1E2EC',
    300: '#C2C6D6',
    500: '#8C909F',
    700: '#424754',
    780: '#272A31',
    800: '#1D2027',
    850: '#191B23',
    900: '#10131A',
    950: '#0B0E15',
  },
  brand: {
    primaryLight: '#3B82F6',
    primaryDark: '#ADC6FF',
    secondary: '#4CD7F6',
    tertiary: '#FFB786',
  },
  state: {
    hot: '#EF4444',
    cold: '#06B6D4',
    success: '#22C55E',
    warning: '#F59E0B',
    errorLight: '#DC2626',
    errorDark: '#FFB4AB',
  },
  ball: {
    yellow: '#FBBF24',
    blue: '#3B82F6',
    red: '#EF4444',
    gray: '#94A3B8',
    green: '#22C55E',
    onLight: '#0F172A',
    onDark: '#FFFFFF',
  },
} as const;

export interface ColorsShape {
  bg: { canvas: string; sectionMain: string; sectionSub: string };
  surface: { dim: string; container: string; containerLow: string; containerHigh: string };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    primaryInverse: string;
    secondaryInverse: string;
  };
  border: { default: string; subtle: string; strong: string };
  primary: { action: string; onAction: string; container: string; onContainer: string };
  state: { hot: string; cold: string; success: string; warning: string; error: string };
  ball: {
    yellow: string;
    blue: string;
    red: string;
    gray: string;
    green: string;
    onLight: string;
    onDark: string;
  };
}

export const lightColors: ColorsShape = {
  bg: {
    canvas: primitives.slate[50],
    sectionMain: primitives.slateDark[900],
    sectionSub: primitives.slate[950],
  },
  surface: {
    dim: primitives.slate[100],
    container: primitives.slate[50],
    containerLow: primitives.slate[50],
    containerHigh: primitives.slate[100],
  },
  text: {
    primary: primitives.slate[900],
    secondary: primitives.slate[700],
    muted: primitives.slate[500],
    primaryInverse: primitives.slateDark[200],
    secondaryInverse: primitives.slateDark[300],
  },
  border: {
    default: primitives.slate[300],
    subtle: primitives.slate[200],
    strong: primitives.slate[400],
  },
  primary: {
    action: primitives.brand.primaryLight,
    onAction: '#FFFFFF',
    container: '#DBEAFE',
    onContainer: '#1E3A8A',
  },
  state: {
    hot: primitives.state.hot,
    cold: primitives.state.cold,
    success: primitives.state.success,
    warning: primitives.state.warning,
    error: primitives.state.errorLight,
  },
  ball: primitives.ball,
};

export const darkColors: ColorsShape = {
  bg: {
    canvas: primitives.slateDark[900],
    sectionMain: primitives.slate[50],
    sectionSub: primitives.slate[100],
  },
  surface: {
    dim: primitives.slateDark[900],
    container: primitives.slateDark[800],
    containerLow: primitives.slateDark[850],
    containerHigh: primitives.slateDark[780],
  },
  text: {
    primary: primitives.slateDark[200],
    secondary: primitives.slateDark[300],
    muted: primitives.slateDark[500],
    primaryInverse: primitives.slate[900],
    secondaryInverse: primitives.slate[700],
  },
  border: {
    default: primitives.slateDark[700],
    subtle: primitives.slateDark[780],
    strong: primitives.slateDark[500],
  },
  primary: {
    action: primitives.brand.primaryDark,
    onAction: primitives.slate[900],
    container: '#4D8EFF',
    onContainer: '#00285D',
  },
  state: {
    hot: primitives.state.hot,
    cold: primitives.state.cold,
    success: primitives.state.success,
    warning: primitives.state.warning,
    error: primitives.state.errorDark,
  },
  ball: primitives.ball,
};

export type Colors = ColorsShape;
