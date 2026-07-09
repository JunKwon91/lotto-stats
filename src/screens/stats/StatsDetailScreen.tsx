// ============================================================================
// StatsDetailScreen — 전체 통계 (Statistics 요약의 상위집합)
// ============================================================================
//
// 범위(100회차/30회차/전체)를 골라 빈도·홀짝·합계 추이·미출현을 자세히 본다
// 집계는 utils/statistics의 순수 함수에 위임하고, 화면이 선택 범위만큼 잘라
// 넘긴다(유틸은 범위를 모름). 진입 파라미터 type은 현재 앵커링에 쓰지 않아
// 받기만 한다 — 모든 진입점이 단일 스크롤 화면의 같은 위치로 들어온다
// ============================================================================

import { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import {
  BarChart,
  DonutChart,
  SumTrendChart,
} from '@/components/charts';
import {
  SegmentedControl,
  type SegmentedControlSegment,
} from '@/components/display';
import { ErrorView, LoadingView } from '@/components/feedback';
import { SubHeader } from '@/components/layout';
import { LottoBall } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import {
  getNumberGaps,
  getOddEvenDistribution,
  getSumDistribution,
  getTopNumbers,
} from '@/utils/statistics';

// 범위 선택 — 최근 N회 또는 전체
type RangeKey = '100' | '30' | 'all';

const RANGE_SEGMENTS: SegmentedControlSegment<RangeKey>[] = [
  { value: '100', label: '100회차' },
  { value: '30', label: '30회차' },
  { value: 'all', label: '전체' },
];

// 합계 추이 산점도가 담을 수 있는 최대 점 수. 전체(1231회)는 균등 샘플링해
// 겹침 없이 분포만 보여준다(구간 평균이 아니라 실제 회차를 골라 산포 유지)
const MAX_TREND_DOTS = 40;

function sampleEven(values: number[], max: number): number[] {
  if (values.length <= max) return values;
  const out: number[] = [];
  for (let i = 0; i < max; i++) {
    out.push(values[Math.round((i * (values.length - 1)) / (max - 1))]);
  }
  return out;
}

const StateArea = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
`;

const SectionCard = styled(Card)`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const LegendRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
`;

const LegendItem = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const LegendDot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
`;

const DonutWrap = styled.View`
  align-items: center;
`;

const TrendFooter = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const GapRow = styled.View<{ $divided: boolean }>`
  flex-direction: row;
  align-items: center;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  ${({ theme, $divided }) =>
    $divided
      ? `border-top-width: 1px; border-top-color: ${theme.colors.border.divider};`
      : ''}
`;

const GapLabel = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  flex: 1;
`;

export default function StatsDetailScreen() {
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  const [range, setRange] = useState<RangeKey>('100');

  const stats = useMemo(() => {
    const sorted = [...(data?.data ?? [])].sort((a, b) => b.drawNo - a.drawNo);
    const scoped =
      range === 'all' ? sorted : sorted.slice(0, Number(range));

    const total = scoped.length;
    const freq = getTopNumbers(scoped, 10);
    const oddEven = getOddEvenDistribution(scoped);
    const sum = getSumDistribution(scoped);
    const cold = [...getNumberGaps(scoped)]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);

    // 홀수 비율 = Σ(홀수개수 × 회차수) / (6 × 전체 회차)
    const oddNumbers = oddEven.reduce((acc, b) => acc + b.oddCount * b.count, 0);
    const oddRatio = total > 0 ? oddNumbers / (6 * total) : 0;
    // 중앙 표기 = 가장 흔한 홀짝 구성
    const mode = [...oddEven].sort((a, b) => b.count - a.count)[0];

    // 합계 추이 — 과거→최근 순으로 눕혀 균등 샘플링
    const trendSums = sampleEven(
      [...scoped].reverse().map(r => r.numbers.reduce((a, n) => a + n, 0)),
      MAX_TREND_DOTS,
    );

    return { total, freq, sum, cold, oddRatio, mode, trendSums };
  }, [data?.data, range]);

  const barData = stats.freq.map((f, i) => ({
    label: String(f.number),
    value: f.count,
    highlighted: i === 0,
  }));

  const oddPct = Math.round(stats.oddRatio * 100);
  const evenPct = 100 - oddPct;
  const centerLabel = stats.mode
    ? `${stats.mode.oddCount}:${6 - stats.mode.oddCount}`
    : '—';

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader title="전체 통계" />

      {!data ? (
        <StateArea>
          {isError ? (
            <ErrorView
              title="데이터를 불러오지 못했어요"
              description="네트워크를 확인하고 다시 시도해 주세요."
              action={{ label: '다시 시도', onPress: () => refetch() }}
            />
          ) : (
            <LoadingView message="통계를 계산하는 중..." />
          )}
        </StateArea>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: theme.spacing.containerMargin,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
          }}
        >
          <SegmentedControl
            segments={RANGE_SEGMENTS}
            value={range}
            onChange={setRange}
          />

          {/* 번호별 출현 빈도 */}
          <SectionCard>
            <Text variant="headlineMd">번호별 출현 빈도</Text>
            <BarChart data={barData} />
          </SectionCard>

          {/* 홀짝 비율 */}
          <SectionCard>
            <Text variant="headlineMd">홀짝 비율</Text>
            <DonutWrap>
              <DonutChart
                segments={[
                  { value: stats.oddRatio, color: theme.colors.primary.action },
                  {
                    value: 1 - stats.oddRatio,
                    color: theme.colors.surface.containerHigh,
                  },
                ]}
                size={160}
                thickness={20}
              >
                <Text variant="headlineMd">{centerLabel}</Text>
              </DonutChart>
            </DonutWrap>
            <LegendRow>
              <LegendItem>
                <LegendDot
                  style={{ backgroundColor: theme.colors.primary.action }}
                />
                <Text variant="bodySm" color="muted">
                  홀 ({oddPct}%)
                </Text>
              </LegendItem>
              <LegendItem>
                <LegendDot
                  style={{
                    backgroundColor: theme.colors.surface.containerHigh,
                  }}
                />
                <Text variant="bodySm" color="muted">
                  짝 ({evenPct}%)
                </Text>
              </LegendItem>
            </LegendRow>
          </SectionCard>

          {/* 회차별 합계 추이 */}
          <SectionCard>
            <Text variant="headlineMd">회차별 합계 추이</Text>
            <Text variant="bodySm" color="secondary">
              당첨번호 6개의 합계 변화 — 평균선 대비 분포.
            </Text>
            <SumTrendChart
              sums={stats.trendSums}
              average={stats.sum.average}
            />
            <TrendFooter>
              <Text variant="bodySm" color="muted">
                평균 {Math.round(stats.sum.average)}
              </Text>
              <Text variant="bodySm" color="muted">
                표준편차 ±{Math.round(stats.sum.stdDev)}
              </Text>
            </TrendFooter>
          </SectionCard>

          {/* 번호별 미출현 기간 */}
          <SectionCard>
            <Text variant="headlineMd">번호별 미출현 기간</Text>
            <Text variant="bodySm" color="secondary">
              가장 오랫동안 나오지 않은 번호 Top 5.
            </Text>
            {stats.cold.map((c, i) => (
              <GapRow key={c.number} $divided={i > 0}>
                <GapLabel>
                  <LottoBall number={c.number} size="sm" />
                  <Text variant="bodyBase">{c.number}번</Text>
                </GapLabel>
                <Text
                  variant="numericMd"
                  style={{ color: theme.colors.state.cold }}
                >
                  {c.gap}회
                </Text>
              </GapRow>
            ))}
          </SectionCard>
        </ScrollView>
      )}
    </Screen>
  );
}
