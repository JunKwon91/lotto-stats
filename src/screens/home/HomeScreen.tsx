// ============================================================================
// HomeScreen — 홈 (최신 회차 Hero + 데이터 연결)
// ============================================================================
//
// useLottoData(캐시 우선)로 최신 회차를 받아 Hero Card에 표시한다.
//   - 회차/날짜, 당첨번호 6 + 보너스(LottoBall), 1등 총 당첨금, 상세보기
//   - 1등 총 당첨금 = prizes[0].winners × prizes[0].prizePerWinner
// 최근 당첨 내역·분석 카드는 다음 단계에서 붙인다.
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components/native';

import { Button } from '@/components/action';
import { ErrorView, LoadingView } from '@/components/feedback';
import { LottoBall } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { LottoRound } from '@/types/lotto';

// 원화 천단위 콤마 (Hermes Intl 의존 없이 안전).
function formatWon(amount: number): string {
  return '₩' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// "2026-07-04" → "2026.07.04"
function formatDate(iso: string): string {
  return iso.replace(/-/g, '.');
}

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BallRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const DividerLine = styled.View`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.border.divider};
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const MetricRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const MetricCol = styled.View`
  gap: 4px;
`;

export default function HomeScreen() {
  const navigation = useNavigation();
  const { data, isError, refetch } = useLottoData();

  // 최신 회차 — latestRound 항목 우선, 없으면 정렬된 마지막 항목.
  const rounds = data?.data ?? [];
  const latest: LottoRound | undefined =
    rounds.find(r => r.drawNo === data?.latestRound) ?? rounds[rounds.length - 1];

  // 캐시·fetch 모두 데이터 없음 → 로딩/에러 처리.
  if (!latest) {
    return (
      <Screen>
        {isError ? (
          <ErrorView
            title="데이터를 불러오지 못했어요"
            description="네트워크를 확인하고 다시 시도해 주세요."
            action={{ label: '다시 시도', onPress: () => refetch() }}
          />
        ) : (
          <LoadingView message="로또 데이터를 불러오는 중..." />
        )}
      </Screen>
    );
  }

  const firstPrize = latest.prizes?.[0];
  const firstPrizeTotal = firstPrize
    ? firstPrize.winners * firstPrize.prizePerWinner
    : undefined;

  return (
    <Screen scroll>
      <Card>
        <HeaderRow>
          <Text variant="headlineMd">{latest.drawNo}회 당첨결과</Text>
          <Text variant="bodySm" color="muted">
            {formatDate(latest.date)}
          </Text>
        </HeaderRow>

        <BallRow>
          {latest.numbers.map(n => (
            <LottoBall key={n} number={n} />
          ))}
          <Text variant="bodyBase" color="muted">
            +
          </Text>
          <LottoBall number={latest.bonusNo} />
        </BallRow>

        <DividerLine />

        <MetricRow>
          <MetricCol>
            <Text variant="labelCaps" color="muted">
              1등 총 당첨금
            </Text>
            <Text variant="headlineMd">
              {firstPrizeTotal != null ? formatWon(firstPrizeTotal) : '—'}
            </Text>
          </MetricCol>
          <Button
            label="상세보기"
            size="sm"
            onPress={() =>
              navigation.navigate('RoundDetail', { round: latest.drawNo })
            }
          />
        </MetricRow>
      </Card>
    </Screen>
  );
}
