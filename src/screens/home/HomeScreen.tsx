// ============================================================================
// HomeScreen — 홈 (최신 회차 Hero + 최근 당첨 내역)
// ============================================================================
//
// useLottoData(캐시 우선)로 회차 데이터를 받아:
//   - Hero Card: 최신 회차 당첨결과 + 1등 총 당첨금 + 상세보기
//   - 최근 당첨 내역: 최신 제외 직전 3회차 (회차/날짜 + 당첨번호)
//   1등 총 당첨금 = prizes[0].winners × prizes[0].prizePerWinner
// 번호 분석 카드는 다음 단계에서 붙인다.
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { ErrorView, LoadingView } from '@/components/feedback';
import { LottoBallSet } from '@/components/lotto';
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

const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const SeeAll = styled.Pressable`
  flex-direction: row;
  align-items: center;
  gap: 2px;
`;

const ListContainer = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  // drawNo 내림차순 정렬 (data 정렬 보장 없이 안전).
  const sorted = [...(data?.data ?? [])].sort((a, b) => b.drawNo - a.drawNo);
  const latest: LottoRound | undefined =
    sorted.find(r => r.drawNo === data?.latestRound) ?? sorted[0];

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

  // 최신 제외 직전 3회차.
  const recent = sorted.filter(r => r.drawNo !== latest.drawNo).slice(0, 3);

  const firstPrize = latest.prizes?.[0];
  const firstPrizeTotal = firstPrize
    ? firstPrize.winners * firstPrize.prizePerWinner
    : undefined;

  return (
    <Screen scroll>
      {/* Hero — 최신 회차 */}
      <Card>
        <HeaderRow>
          <Text variant="headlineMd">{latest.drawNo}회 당첨결과</Text>
          <Text variant="bodySm" color="muted">
            {formatDate(latest.date)}
          </Text>
        </HeaderRow>

        <LottoBallSet
          numbers={latest.numbers}
          bonusNo={latest.bonusNo}
          style={{ marginTop: theme.spacing.md }}
        />

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

      {/* 최근 당첨 내역 */}
      <SectionHeader>
        <Text variant="headlineMd">최근 당첨 내역</Text>
        <SeeAll onPress={() => navigation.navigate('RoundList')}>
          <Text variant="bodySm" color="accent">
            전체보기
          </Text>
          <ChevronRight size={16} color={theme.colors.primary.action} />
        </SeeAll>
      </SectionHeader>

      <ListContainer>
        {recent.map(round => (
          <Card key={round.drawNo} variant="filled">
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
        ))}
      </ListContainer>
    </Screen>
  );
}
