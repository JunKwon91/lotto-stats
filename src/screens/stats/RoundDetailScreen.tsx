// ============================================================================
// RoundDetailScreen — 회차 상세 (헤더 + Hero + 등수별 표 + 요약 슬롯)
// ============================================================================
//
// { round } 파라미터로 진입해 해당 회차의 당첨 결과를 보여준다.
// 데이터는 useLottoData의 전체 목록에서 drawNo로 찾는다(별도 fetch 없음).
// 헤더·Hero(회차·날짜·당첨번호)·등수별 당첨 표·요약 슬롯(총당첨자수·총당첨금액)까지
// RoundDetail 전 섹션을 담는다.
// ============================================================================

import { Star, Trophy } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { ErrorView, LoadingView } from '@/components/feedback';
import { SubHeader } from '@/components/layout';
import { LottoBall, LottoBallSet, PrizeTable } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { RoundDetailScreenProps } from '@/navigation/types';
import { formatCount, formatWonCompact } from '@/utils/formatCurrency';

// "2026-07-04" → "2026.07.04"
function formatDate(iso: string): string {
  return iso.replace(/-/g, '.');
}

// 로딩/에러/미발견 상태 영역 (헤더 아래).
const StateArea = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
`;

const LabelRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BallColumn = styled.View`
  align-items: center;
`;

const BonusRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

// 당첨 결과 요약 섹션 헤더 (Trophy + 제목).
const SectionHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.xl}px;
`;

// Outlined 카드 스펙(surface.container + border.subtle 1px, radius 16) 공용 베이스.
// 요약 하위 카드들은 이 위에 margin-top(md)으로 균등 간격을 둔다.
const OutlinedCard = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border.subtle};
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

// 1등 당첨 유형 카드 (자동/수동/반자동).
const MethodCard = styled(OutlinedCard)`
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const MethodRow = styled.View`
  flex-direction: row;
`;

const MethodCol = styled.View`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

// 총 판매액 카드 (라벨 좌 / 값 우, 풀폭).
const SalesCard = styled(OutlinedCard)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

// 요약 2슬롯 (총당첨자수·총당첨금액) — 나란히 균등 폭.
const SummaryRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

// 개별 슬롯 — Outlined 스펙 + 세로 라벨/값.
const Slot = styled(OutlinedCard)`
  flex: 1;
  margin-top: 0px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export default function RoundDetailScreen({ route }: RoundDetailScreenProps) {
  const { round } = route.params;
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  const roundData = data?.data.find(r => r.drawNo === round);
  const firstWinMethod = roundData?.firstWinMethod;
  const hasPrizes = !!roundData?.prizes?.length;
  const hasTotals =
    roundData?.totalWinners != null || roundData?.totalPrize != null;
  const hasSummary =
    hasPrizes ||
    hasTotals ||
    roundData?.totalSales != null ||
    firstWinMethod != null;

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader
        title={`${round}회 상세`}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="즐겨찾기"
            hitSlop={8}
          >
            <Star size={24} color={theme.colors.text.secondary} />
          </Pressable>
        }
      />

      {!roundData ? (
        <StateArea>
          {!data ? (
            isError ? (
              <ErrorView
                title="데이터를 불러오지 못했어요"
                description="네트워크를 확인하고 다시 시도해 주세요."
                action={{ label: '다시 시도', onPress: () => refetch() }}
              />
            ) : (
              <LoadingView message="회차 정보를 불러오는 중..." />
            )
          ) : (
            <Text variant="bodyBase" color="muted">
              {round}회 정보를 찾을 수 없어요.
            </Text>
          )}
        </StateArea>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.containerMargin,
            paddingBottom: theme.spacing.xl,
          }}
        >
          {/* Hero — 회차 당첨번호 */}
          <Card>
            <LabelRow>
              <Text variant="labelCaps" color="accent">
                당첨 결과
              </Text>
              <Text variant="labelCaps" color="muted">
                {formatDate(roundData.date)}
              </Text>
            </LabelRow>

            <Text
              variant="headlineMd"
              style={{ marginTop: theme.spacing.md, textAlign: 'center' }}
            >
              {round}회 당첨번호
            </Text>

            <BallColumn style={{ marginTop: theme.spacing.md }}>
              <LottoBallSet numbers={roundData.numbers} size="md" />
              <BonusRow style={{ marginTop: theme.spacing.md }}>
                <Text variant="bodyBase" color="muted">
                  +
                </Text>
                <LottoBall number={roundData.bonusNo} size="md" />
              </BonusRow>
            </BallColumn>
          </Card>

          {/* 당첨 결과 요약 섹션 */}
          {hasSummary && (
            <>
              <SectionHeader>
                <Trophy size={20} color={theme.colors.ball.yellow} />
                <Text variant="headlineMd">당첨 결과 요약</Text>
              </SectionHeader>

              {/* 1등 당첨 유형 — 262회차부터 제공(이전 회차는 숨김) */}
              {firstWinMethod && (
                <MethodCard>
                  <Text variant="labelCaps" color="muted">
                    1등 당첨 유형
                  </Text>
                  <MethodRow>
                    <MethodCol>
                      <Text variant="headlineMd">{firstWinMethod.auto}</Text>
                      <Text variant="labelCaps" color="muted">
                        자동
                      </Text>
                    </MethodCol>
                    <MethodCol>
                      <Text variant="headlineMd">{firstWinMethod.manual}</Text>
                      <Text variant="labelCaps" color="muted">
                        수동
                      </Text>
                    </MethodCol>
                    <MethodCol>
                      <Text variant="headlineMd">
                        {firstWinMethod.semiAuto}
                      </Text>
                      <Text variant="labelCaps" color="muted">
                        반자동
                      </Text>
                    </MethodCol>
                  </MethodRow>
                </MethodCard>
              )}

              {/* 등수별 당첨 결과 */}
              {hasPrizes && (
                <PrizeTable
                  prizes={roundData.prizes!}
                  style={{ marginTop: theme.spacing.md }}
                />
              )}

              {/* 총 판매액 */}
              {roundData.totalSales != null && (
                <SalesCard>
                  <Text variant="labelCaps" color="muted">
                    총 판매액
                  </Text>
                  <Text variant="headlineMd">
                    {formatWonCompact(roundData.totalSales)}
                  </Text>
                </SalesCard>
              )}

              {/* 총 당첨자 수 · 총 당첨금액 */}
              {hasTotals && (
                <SummaryRow>
                  <Slot>
                    <Text variant="labelCaps" color="muted">
                      총 당첨자 수
                    </Text>
                    <Text variant="headlineMd">
                      {roundData.totalWinners != null
                        ? `${formatCount(roundData.totalWinners)}명`
                        : '—'}
                    </Text>
                  </Slot>
                  <Slot>
                    <Text variant="labelCaps" color="muted">
                      총 당첨금액
                    </Text>
                    <Text variant="headlineMd">
                      {roundData.totalPrize != null
                        ? formatWonCompact(roundData.totalPrize)
                        : '—'}
                    </Text>
                  </Slot>
                </SummaryRow>
              )}
            </>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}
