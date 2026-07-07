// ============================================================================
// LottoBallSet — 당첨번호 볼 행 (번호 + 보너스)
// ============================================================================
//
// LottoBall을 가로로 나열한 당첨번호 행. bonusNo가 있으면 "+" 세퍼레이터 뒤에
// 보너스 볼을 붙인다. 볼 행 자체만 렌더하고, 주변 여백은 소비처가 레이아웃으로
// 잡는다(style prop으로 override).
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import { Text } from '@/components/primitives';
import { LottoBall } from './LottoBall';

// 볼 사이 간격(px) — Figma 볼 피치(36 지름 + 6 간격).
const BALL_GAP = 6;

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${BALL_GAP}px;
`;

export interface LottoBallSetProps {
  /** 당첨번호 (보통 6개). */
  numbers: number[];
  /** 보너스 번호. 생략 시 "+"·보너스 볼을 렌더하지 않는다. */
  bonusNo?: number;
  /** 볼 크기 — LottoBall에 전달. @default 'sm' */
  size?: 'sm' | 'md';
  /** 컨테이너 외부 스타일 override (주변 여백 등은 소비처가 지정). */
  style?: StyleProp<ViewStyle>;
}

/**
 * 당첨번호 볼 행.
 *
 * @example
 * <LottoBallSet numbers={[1, 2, 3, 4, 5, 6]} bonusNo={7} />
 * <LottoBallSet numbers={picks} size="md" />   // 보너스 없이 번호만
 */
export function LottoBallSet({
  numbers,
  bonusNo,
  size = 'sm',
  style,
}: LottoBallSetProps) {
  return (
    <Row style={style}>
      {numbers.map(n => (
        <LottoBall key={n} number={n} size={size} />
      ))}
      {bonusNo != null && (
        <>
          <Text variant="bodyBase" color="muted">
            +
          </Text>
          <LottoBall number={bonusNo} size={size} />
        </>
      )}
    </Row>
  );
}
