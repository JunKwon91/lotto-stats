import { lightColors, darkColors, type Colors } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';

export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  colors: Colors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  radius,
  typography,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radius,
  typography,
};

export { lightColors, darkColors, spacing, radius, typography };
