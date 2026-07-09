// ============================================================================
// RoundCard — 회차 카드 (회차·날짜·당첨번호)
// ============================================================================
//
// 홈 최근 당첨 내역·RoundList 등에서 공유하는 Filled 카드. 한 회차의 회차 번호·
// 추첨일·당첨번호(LottoBallSet)를 보여준다. onPress가 있으면 카드 전체가 탭
// 영역이 된다(Card는 onPress 미지원 → Pressable 래핑). 주변 여백은 사용하는곳에서
// style로 처리한다
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Text } from '@/components/primitives';
import { Card } from '@/components/surface';
import type { LottoRound } from '@/types/lotto';

import { LottoBallSet } from './LottoBallSet';

// "2026-07-04" → "2026.07.04"
function formatDate(iso: string): string {
  return iso.replace(/-/g, '.');
}

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export interface RoundCardProps {
  /** 표시할 회차 */
  round: LottoRound;
  /** 카드 탭 동작 (없으면 정적 카드) */
  onPress?: () => void;
  /** 컨테이너 외부 스타일 override (주변 여백 등) */
  style?: StyleProp<ViewStyle>;
}

/**
 * 회차 카드
 *
 * @example
 * <RoundCard round={round} onPress={() => navigate('RoundDetail', { round: round.drawNo })} />
 * <RoundCard round={round} />   // 정적
 */
export function RoundCard({ round, onPress, style }: RoundCardProps) {
  const theme = useTheme();

  const card = (
    <Card variant="filled" style={onPress ? undefined : style}>
      <HeaderRow>
        <Text variant="headlineSm">{round.drawNo}회</Text>
        <Text variant="bodySm" color="muted">
          {formatDate(round.date)}
        </Text>
      </HeaderRow>
      <LottoBallSet
        numbers={round.numbers}
        bonusNo={round.bonusNo}
        style={{ marginTop: theme.spacing.md }}
      />
    </Card>
  );

  if (!onPress) return card;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${round.drawNo}회 상세`}
      style={style}
    >
      {card}
    </Pressable>
  );
}
