// ============================================================================
// LottoStats 테마 정합 진입점
// ============================================================================
//
// 라이브러리(@junkwon91/rn-design-system)의 AppTheme/Colors/lightTheme/
// darkTheme를 베이스로 하고, 로또 도메인 토큰(state.hot/cold, ball,
// typography.ballNumber)을 확장한 LottoTheme/LottoColors/LottoTypography를
// 정의한다
//
// [구조]
//   라이브러리 AppTheme    ← mode/colors/spacing/radius/typography/interaction
//                            colors: ColorsShape(bg/surface/text/border/
//                                                primary/state/overlay)
//   LottoTheme            ← AppTheme의 colors/typography를 도메인 확장
//   LottoColors           ← ColorsShape + state에 hot/cold 추가 + ball
//   LottoTypography       ← 라이브러리 typography + ballNumber
//
// 라이브러리가 styled-components DefaultTheme augmentation을 이미 갖고
// 있으므로, 로또 styled.d.ts는 DefaultTheme를 LottoTheme로 확장한다
//
// [모드 전환]
//   App.tsx의 useColorScheme()으로 isDark 판정 후 lightTheme/darkTheme를
//   ThemeProvider에 주입한다. 베이스 값은 라이브러리(ADR-37/38 반영)를 그대로
//   따른다 — 로또 컨셉이 라이브러리 복제이므로 색 차이 0이다
// ============================================================================

import {
  lightTheme as libLightTheme,
  darkTheme as libDarkTheme,
  type AppTheme,
  type Colors,
} from '@junkwon91/rn-design-system';

import { lottoStateExtension, lottoBallColors } from './colors';
import { lottoTypographyExtension } from './typography';

export type ThemeMode = AppTheme['mode'];

// 로또 확장 Colors — 라이브러리 Colors의 state에 hot/cold 추가 + ball 추가
export interface LottoColors extends Omit<Colors, 'state'> {
  state: Colors['state'] & typeof lottoStateExtension;
  ball: typeof lottoBallColors;
}

// 로또 확장 Typography — 라이브러리 typography에 도메인 토큰 ballNumber 추가
export type LottoTypography = AppTheme['typography'] &
  typeof lottoTypographyExtension;

// 로또 확장 AppTheme — colors/typography만 도메인 확장, 나머지(spacing/radius/
// interaction)는 라이브러리 그대로
export interface LottoTheme extends Omit<AppTheme, 'colors' | 'typography'> {
  colors: LottoColors;
  typography: LottoTypography;
}

// 페이지 배경은 surface.base로 맞춘다. 라이브러리 canvas는 Light에서 회색이라
// 흰 배경과 어긋나 덮어쓴다(Dark는 값이 같아 그대로)
export const lightTheme: LottoTheme = {
  ...libLightTheme,
  colors: {
    ...libLightTheme.colors,
    bg: { ...libLightTheme.colors.bg, canvas: libLightTheme.colors.surface.base },
    state: { ...libLightTheme.colors.state, ...lottoStateExtension },
    ball: lottoBallColors,
  },
  typography: { ...libLightTheme.typography, ...lottoTypographyExtension },
};

export const darkTheme: LottoTheme = {
  ...libDarkTheme,
  colors: {
    ...libDarkTheme.colors,
    bg: { ...libDarkTheme.colors.bg, canvas: libDarkTheme.colors.surface.base },
    state: { ...libDarkTheme.colors.state, ...lottoStateExtension },
    ball: lottoBallColors,
  },
  typography: { ...libDarkTheme.typography, ...lottoTypographyExtension },
};

// 라이브러리 타입 재-export — 컴포넌트가 @/theme에서 한 번에 가져갈 수 있도록
export type { AppTheme, Colors };
