// ============================================================================
// LottoBall — 한국 로또 6/45 번호 볼
// ============================================================================
//
// 번호(1~45)를 받아 번호대별 색상과 대비 텍스트 색을 자동 적용한 원형 볼
// 색·타이포는 도메인 토큰(colors.ball / typography.ballNumber)만 사용한다
//   1~10 yellow / 11~20 blue / 21~30 red / 31~40 gray / 41~45 green
//   텍스트: yellow·gray·green → onLight, blue·red → onDark
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

export type BallColorKey = 'yellow' | 'blue' | 'red' | 'gray' | 'green';
type BallColor = BallColorKey;

// 볼 지름(px) — Figma sm 36 / md 40.
const SIZE_PX = { sm: 36, md: 40 } as const;

// 번호대 → 색 구간 (오름차순 경계)
const COLOR_RANGES: readonly { max: number; color: BallColor }[] = [
  { max: 10, color: 'yellow' },
  { max: 20, color: 'blue' },
  { max: 30, color: 'red' },
  { max: 40, color: 'gray' },
  { max: 45, color: 'green' },
];

// 흰 텍스트를 쓰는 볼 색 (그 외는 어두운 텍스트)
const ON_DARK_COLORS: readonly BallColor[] = ['blue', 'red'];

// 번호 → 볼 색 키. 범위(1~45) 밖이면 gray로 폴백하고 개발 모드에서 경고
function ballColorFor(n: number): BallColor {
  if (!Number.isInteger(n) || n < 1 || n > 45) {
    if (__DEV__) {
      console.warn(`LottoBall: 로또 번호는 1~45여야 합니다 (받은 값: ${n})`);
    }
    return 'gray';
  }
  return COLOR_RANGES.find(r => n <= r.max)!.color;
}

const Circle = styled.View<{ $diameter: number; $color: BallColor }>`
  width: ${({ $diameter }) => $diameter}px;
  height: ${({ $diameter }) => $diameter}px;
  border-radius: ${({ $diameter }) => $diameter / 2}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $color }) => theme.colors.ball[$color]};
`;

const BallNumber = styled.Text<{ $onDark: boolean }>`
  font-family: ${({ theme }) => theme.typography.ballNumber.fontFamily};
  font-size: ${({ theme }) => theme.typography.ballNumber.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.ballNumber.fontWeight};
  line-height: ${({ theme }) => theme.typography.ballNumber.lineHeight}px;
  text-align: center;
  color: ${({ theme, $onDark }) =>
    $onDark ? theme.colors.ball.onDark : theme.colors.ball.onLight};
`;

export interface LottoBallProps {
  /** 로또 번호 (1~45). 번호대에 따라 색이 자동 결정된다 */
  number: number;
  /** 볼 지름 — sm 36px / md 40px. @default 'sm' */
  size?: 'sm' | 'md';
  /** 컨테이너 외부 스타일 override */
  style?: StyleProp<ViewStyle>;
}

/**
 * 한국 로또 6/45 번호 볼
 *
 * @example
 * <LottoBall number={6} />            // 36px yellow 볼
 * <LottoBall number={28} size="md" /> // 40px red 볼
 */
export function LottoBall({ number, size = 'sm', style }: LottoBallProps) {
  const color = ballColorFor(number);
  const onDark = ON_DARK_COLORS.includes(color);
  return (
    <Circle
      $diameter={SIZE_PX[size]}
      $color={color}
      style={style}
      accessible
      accessibilityLabel={`로또 번호 ${number}`}
    >
      <BallNumber $onDark={onDark}>{number}</BallNumber>
    </Circle>
  );
}
