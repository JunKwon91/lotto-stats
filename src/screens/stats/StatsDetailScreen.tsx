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
  getCoOccurrenceMatrix,
  getConsecutiveDistribution,
  getLastDigitDistribution,
  getNumberGaps,
  getOddEvenDistribution,
  getRangeDistribution,
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

// 가로 % 바 (구간·연속 공용)
const BarRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const BarLabel = styled.View`
  width: 64px;
`;

const BarTrack = styled.View`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.surface.containerHighest};
  overflow: hidden;
`;

const BarFill = styled.View`
  height: 6px;
  border-radius: 3px;
`;

const BarPct = styled.View`
  width: 40px;
  align-items: flex-end;
`;

// 연속 발생률 리드 수치 (Figma엔 자리가 없어 부제 아래에 둔다)
const LeadStat = styled.View`
  flex-direction: row;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

// 동반 출현 히트맵 — 축 라벨 + 9×9 셀 격자 (순수 View)
const Matrix = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const MatrixLine = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

// 좌상단 코너 + 좌측 행 라벨 (고정 폭 — 열 정렬 기준)
const AxisCell = styled.View`
  width: 24px;
  align-items: center;
`;

const CellsLine = styled.View`
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const ColLabelCell = styled.View`
  flex: 1;
  align-items: center;
`;

const Cell = styled.View<{ $track: boolean; $intensity: number }>`
  flex: 1;
  height: 24px;
  border-radius: ${({ theme }) => theme.radius.sm}px;
  background-color: ${({ theme, $track }) =>
    $track ? theme.colors.surface.containerHighest : theme.colors.primary.action};
  opacity: ${({ $track, $intensity }) => ($track ? 1 : $intensity)};
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
    const ranges = getRangeDistribution(scoped);
    const consecutive = getConsecutiveDistribution(scoped);
    // 6연속은 실데이터상 없음 — Figma대로 2~5만 두되, 발생하면 그 행만 추가로 노출
    const runBuckets = consecutive.buckets.filter(
      b => b.length <= 5 || b.count > 0,
    );
    const lastDigit = getLastDigitDistribution(scoped);
    // 최빈 끝수 — 동점이면 낮은 digit 유지(reduce가 첫 최댓값을 지킴)
    const digitMode = lastDigit.reduce(
      (best, d) => (d.count > best.count ? d : best),
      lastDigit[0],
    );

    const coocc = getCoOccurrenceMatrix(scoped, 9);
    // 가장 많이 함께 나온 조합 + 0보다 큰 count의 최솟값(강도 min-max 스트레치용)
    // 상삼각만 훑어 대칭 중복 제거
    let maxPair = { a: 0, b: 0, count: 0 };
    let coMin = Infinity;
    for (let i = 0; i < coocc.numbers.length; i++) {
      for (let j = i + 1; j < coocc.numbers.length; j++) {
        const c = coocc.counts[i][j];
        if (c > maxPair.count) {
          maxPair = { a: coocc.numbers[i], b: coocc.numbers[j], count: c };
        }
        if (c > 0 && c < coMin) coMin = c;
      }
    }
    if (!Number.isFinite(coMin)) coMin = 0;

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

    return {
      total,
      freq,
      sum,
      cold,
      oddRatio,
      mode,
      trendSums,
      ranges,
      consecutive,
      runBuckets,
      lastDigit,
      digitMode,
      coocc,
      maxPair,
      coMin,
    };
  }, [data?.data, range]);

  const barData = stats.freq.map((f, i) => ({
    label: String(f.number),
    value: f.count,
    highlighted: i === 0,
  }));

  const lastDigitBars = stats.lastDigit.map(d => ({
    label: String(d.digit),
    value: d.count,
    highlighted: d.digit === stats.digitMode.digit,
  }));

  const oddPct = Math.round(stats.oddRatio * 100);
  const evenPct = 100 - oddPct;
  const centerLabel = stats.mode
    ? `${stats.mode.oddCount}:${6 - stats.mode.oddCount}`
    : '—';

  const withRunPct = Math.round(stats.consecutive.withRunRatio * 100);
  const digitModePct = (stats.digitMode.ratio * 100).toFixed(1);

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
                    color: theme.colors.surface.containerHighest,
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
                    backgroundColor: theme.colors.surface.containerHighest,
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

          {/* 구간별 분포 */}
          <SectionCard>
            <Text variant="headlineMd">구간별 분포</Text>
            <Text variant="bodySm" color="secondary">
              1~45번을 5개 구간으로 나눠 출현 빈도를 비교합니다.
            </Text>
            {stats.ranges.map(b => (
              <BarRow key={b.label}>
                <BarLabel>
                  <Text variant="bodySm" color="muted">
                    {b.label}
                  </Text>
                </BarLabel>
                <BarTrack>
                  <BarFill
                    style={{
                      width: `${b.ratio * 100}%`,
                      backgroundColor: theme.colors.ball[b.ball],
                    }}
                  />
                </BarTrack>
                <BarPct>
                  <Text variant="bodySm">{Math.round(b.ratio * 100)}%</Text>
                </BarPct>
              </BarRow>
            ))}
          </SectionCard>

          {/* 연속 번호 출현 */}
          <SectionCard>
            <Text variant="headlineMd">연속 번호 출현</Text>
            <Text variant="bodySm" color="secondary">
              두 개 이상의 연속된 번호가 동시에 나온 비율입니다.
            </Text>
            <LeadStat>
              <Text variant="headlineMd" color="accent">
                {withRunPct}%
              </Text>
              <Text variant="bodySm" color="muted">
                전체 회차 중 연속 번호 포함
              </Text>
            </LeadStat>
            {stats.runBuckets.map(b => (
              <BarRow key={b.length}>
                <BarLabel>
                  <Text variant="bodySm" color="muted">
                    {b.length}연속
                  </Text>
                </BarLabel>
                <BarTrack>
                  <BarFill
                    style={{
                      width: `${b.ratio * 100}%`,
                      backgroundColor: theme.colors.state.cold,
                    }}
                  />
                </BarTrack>
                <BarPct>
                  <Text variant="bodySm">{Math.round(b.ratio * 100)}%</Text>
                </BarPct>
              </BarRow>
            ))}
          </SectionCard>

          {/* 끝수 분포 */}
          <SectionCard>
            <Text variant="headlineMd">끝수 분포</Text>
            <Text variant="bodySm" color="secondary">
              각 번호의 일의 자리(0~9)별 출현 분포입니다.
            </Text>
            <LeadStat>
              <Text variant="headlineMd" color="accent">
                끝수 {stats.digitMode.digit}
              </Text>
              <Text variant="bodySm" color="muted">
                최빈 · {digitModePct}%
              </Text>
            </LeadStat>
            <BarChart data={lastDigitBars} />
          </SectionCard>

          {/* 동반 출현 매트릭스 */}
          <SectionCard>
            <Text variant="headlineMd">동반 출현 매트릭스</Text>
            <Text variant="bodySm" color="secondary">
              두 번호가 함께 출현한 횟수의 강도를 색으로 표현합니다.
            </Text>
            <LeadStat>
              <Text variant="headlineMd" color="accent">
                {stats.maxPair.a}·{stats.maxPair.b}
              </Text>
              <Text variant="bodySm" color="muted">
                가장 많이 함께 · {stats.maxPair.count}회
              </Text>
            </LeadStat>
            <Matrix>
              {/* 상단 헤더행 — 빈 코너 + 열 번호 */}
              <MatrixLine>
                <AxisCell />
                <CellsLine>
                  {stats.coocc.numbers.map(n => (
                    <ColLabelCell key={n}>
                      <Text variant="labelSm" color="muted">
                        {n}
                      </Text>
                    </ColLabelCell>
                  ))}
                </CellsLine>
              </MatrixLine>
              {/* 각 행 — 행 번호 + 9개 셀 */}
              {stats.coocc.numbers.map((rowNum, i) => (
                <MatrixLine key={rowNum}>
                  <AxisCell>
                    <Text variant="labelSm" color="muted">
                      {rowNum}
                    </Text>
                  </AxisCell>
                  <CellsLine>
                    {stats.coocc.numbers.map((colNum, j) => {
                      const count = stats.coocc.counts[i][j];
                      // 대각선(자기 자신)과 0회는 중립 트랙
                      const isTrack = i === j || count === 0;
                      // 강도 = min-max 스트레치. 상위 번호끼리는 다 자주 동반해
                      // count/max면 압축되므로, 값 범위를 [0.2, 1]로 펼쳐 차이를 드러낸다
                      const span = stats.coocc.max - stats.coMin;
                      const intensity =
                        span > 0
                          ? 0.2 + (0.8 * (count - stats.coMin)) / span
                          : 1;
                      return (
                        <Cell
                          key={colNum}
                          $track={isTrack}
                          $intensity={intensity}
                          accessible={!isTrack}
                          accessibilityLabel={
                            isTrack
                              ? undefined
                              : `${rowNum}번과 ${colNum}번 ${count}회`
                          }
                        />
                      );
                    })}
                  </CellsLine>
                </MatrixLine>
              ))}
            </Matrix>
          </SectionCard>
        </ScrollView>
      )}
    </Screen>
  );
}
