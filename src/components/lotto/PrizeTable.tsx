// ============================================================================
// PrizeTable — 등수별 당첨 결과 표 (1~5등)
// ============================================================================
//
// 각 행: 등수 배지 · 1인당 당첨금액 · 당첨인원. 이월 회차처럼 당첨자가 없는
// 등수(winners=0)는 금액을 "—", 인원을 "당첨자 없음"으로 표시한다.
// 컨테이너는 라이브러리 Card가 아니라 Outlined 스펙에 맞춘 프레임으로 둔다
// (구분선을 카드 가장자리까지 그리고 행이 자체 padding을 갖도록, ADR-10).
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import { Text } from '@/components/primitives';
import type { LottoPrize } from '@/types/lotto';
import { formatCount, formatWon } from '@/utils/formatCurrency';

import { RankBadge } from './RankBadge';

const TableCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  overflow: hidden;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  padding-left: ${({ theme }) => theme.spacing.lg}px;
  padding-right: ${({ theme }) => theme.spacing.lg}px;
`;

const Row = styled.View<{ $divider?: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
  border-bottom-width: ${({ $divider }) => ($divider ? 1 : 0)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border.subtle};
`;

const RankCol = styled.View`
  width: 40px;
  align-items: flex-start;
`;

const PrizeCol = styled.View`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

const WinnersCol = styled.View`
  margin-left: ${({ theme }) => theme.spacing.sm}px;
  align-items: flex-end;
`;

export interface PrizeTableProps {
  /** 회차의 등수별 당첨 결과. */
  prizes: LottoPrize[];
  /** 컨테이너 외부 스타일 override (여백 등). */
  style?: StyleProp<ViewStyle>;
}

/**
 * 등수별 당첨 결과 표.
 *
 * @example
 * <PrizeTable prizes={round.prizes} />
 */
export function PrizeTable({ prizes, style }: PrizeTableProps) {
  const rows = [...prizes].sort((a, b) => a.rank - b.rank);

  return (
    <TableCard style={style}>
      <HeaderRow>
        <RankCol>
          <Text variant="labelCaps" color="muted">
            순위
          </Text>
        </RankCol>
        <PrizeCol>
          <Text variant="labelCaps" color="muted">
            1인당 당첨금액
          </Text>
        </PrizeCol>
        <WinnersCol>
          <Text variant="labelCaps" color="muted">
            당첨인원
          </Text>
        </WinnersCol>
      </HeaderRow>

      {rows.map((p, i) => {
        const noWinner = p.winners === 0;
        return (
          <Row key={p.rank} $divider={i < rows.length - 1}>
            <RankCol>
              <RankBadge rank={p.rank} />
            </RankCol>
            <PrizeCol>
              <Text variant="numericMd" color={noWinner ? 'muted' : 'primary'}>
                {noWinner ? '—' : formatWon(p.prizePerWinner)}
              </Text>
            </PrizeCol>
            <WinnersCol>
              <Text variant="bodySm" color={noWinner ? 'muted' : 'primary'}>
                {noWinner ? '당첨자 없음' : `${formatCount(p.winners)}명`}
              </Text>
            </WinnersCol>
          </Row>
        );
      })}
    </TableCard>
  );
}
