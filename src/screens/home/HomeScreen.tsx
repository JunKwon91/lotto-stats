// ============================================================================
// HomeScreen — 홈 (헤더 + 최신 회차 Hero + 최근 당첨 내역 + 번호 분석 안내)
// ============================================================================
//
// 상단 고정 AppHeader 아래로 스크롤 본문:
//   - Hero Card: 최신 회차 당첨결과 + 1등 총 당첨금 + 상세보기
//   - 최근 당첨 내역: 최신 제외 직전 3회차
//   - 번호 분석 안내 카드 → StatsDetail(출현 빈도)
//   1등 총 당첨금 = prizes[0].winners × prizes[0].prizePerWinner
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { ChevronRight } from 'lucide-react-native';
import { ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { ErrorView, LoadingView } from '@/components/feedback';
import { AppHeader } from '@/components/layout';
import { LottoBallSet, RoundCard } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { LottoRound } from '@/types/lotto';
import { formatWon } from '@/utils/formatCurrency';

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
  gap: ${({ theme }) => theme.spacing.md}px;
`;

// 번호 분석 안내 카드 — 카드 전체가 탭 영역(Card는 onPress 미지원 → Pressable 래핑)
const AnalysisCardPress = styled.Pressable`
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

const AnalysisColumn = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

// 로딩/에러 상태 영역 (헤더 아래)
const StateArea = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
`;

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  // drawNo 내림차순 정렬 (data 정렬 보장 없이 안전)
  const sorted = [...(data?.data ?? [])].sort((a, b) => b.drawNo - a.drawNo);
  const latest: LottoRound | undefined =
    sorted.find(r => r.drawNo === data?.latestRound) ?? sorted[0];

  // 최신 제외 직전 3회차
  const recent = latest
    ? sorted.filter(r => r.drawNo !== latest.drawNo).slice(0, 3)
    : [];

  const firstPrize = latest?.prizes?.[0];
  const firstPrizeTotal = firstPrize
    ? firstPrize.winners * firstPrize.prizePerWinner
    : undefined;

  return (
    <Screen edges={['top']} padded={false}>
      <AppHeader />

      {!latest ? (
        <StateArea>
          {isError ? (
            <ErrorView
              title="데이터를 불러오지 못했어요"
              description="네트워크를 확인하고 다시 시도해 주세요."
              action={{ label: '다시 시도', onPress: () => refetch() }}
            />
          ) : (
            <LoadingView message="로또 데이터를 불러오는 중..." />
          )}
        </StateArea>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.containerMargin,
            paddingBottom: theme.spacing.xl,
          }}
        >
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
              <RoundCard
                key={round.drawNo}
                round={round}
                onPress={() =>
                  navigation.navigate('RoundDetail', { round: round.drawNo })
                }
              />
            ))}
          </ListContainer>

          {/* 번호 분석 안내 → StatsDetail(출현 빈도) */}
          <AnalysisCardPress
            onPress={() =>
              navigation.navigate('StatsDetail', { type: 'frequency' })
            }
          >
            <Card>
              <AnalysisColumn>
                <Text variant="labelCaps" color="accent">
                  번호 분석 엔진
                </Text>
                <Text variant="headlineMd">가장 많이 나온 숫자 TOP 5</Text>
                <Text variant="bodySm" color="secondary">
                  최근 100회차 동안 출현 빈도가 가장 높은 행운의 숫자를
                  확인하세요.
                </Text>
              </AnalysisColumn>
            </Card>
          </AnalysisCardPress>
        </ScrollView>
      )}
    </Screen>
  );
}
