// ============================================================================
// StatisticsScreen — 통계 요약 대시보드 (Statistics 탭)
// ============================================================================
//
// 최근 100회차를 기준으로 HOT/COLD·번호별 출현 빈도·홀짝 비율·합계 분포를
// 요약해 보여준다. 집계는 utils/statistics의 순수 함수에 위임하고, 화면은
// 100회 slice해 넘긴다. 더 깊은 지표는 "전체 통계 보기"로 StatsDetail 진입
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { Flame, Snowflake } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { BarChart, DonutChart } from '@/components/charts';
import { ErrorView, LoadingView } from '@/components/feedback';
import { AppHeader } from '@/components/layout';
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

const RANGE = 100;

const StateArea = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
`;

const TitleBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const HotColdRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const HotColdHeader = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const BallRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const SectionCard = styled(Card)`
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const DonutWrap = styled.View`
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const LegendRow = styled.View`
  flex-direction: row;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.lg}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
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

const SumRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

const SumLabel = styled.View`
  width: 64px;
`;

const SumTrack = styled.View`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.surface.containerHighest};
  overflow: hidden;
`;

const SumFill = styled.View`
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.colors.primary.action};
`;

const SumPct = styled.View`
  width: 40px;
  align-items: flex-end;
`;

const CTAColumn = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export default function StatisticsScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  const stats = useMemo(() => {
    const sorted = [...(data?.data ?? [])].sort((a, b) => b.drawNo - a.drawNo);
    const recent = sorted.slice(0, RANGE);
    const total = recent.length;

    const hot = getTopNumbers(recent, 3);
    const cold = [...getNumberGaps(recent)]
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3);
    const freq = getTopNumbers(recent, 10);
    const oddEven = getOddEvenDistribution(recent);
    const sum = getSumDistribution(recent);

    // 홀수 비율 = Σ(홀수개수 × 회차수) / (6 × 전체 회차)
    const oddNumbers = oddEven.reduce((acc, b) => acc + b.oddCount * b.count, 0);
    const oddRatio = total > 0 ? oddNumbers / (6 * total) : 0;
    // 중앙 표기 = 가장 흔한 홀짝 구성
    const mode = [...oddEven].sort((a, b) => b.count - a.count)[0];

    return { total, hot, cold, freq, sum, oddRatio, mode };
  }, [data?.data]);

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
      <AppHeader />

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
            paddingBottom: theme.spacing.xl,
          }}
        >
          <TitleBlock>
            <Text variant="displayLg">통계 분석</Text>
            <Text variant="bodySm" color="muted">
              최근 {RANGE}회차 데이터를 기반으로 정밀 분석한 결과입니다.
            </Text>
          </TitleBlock>

          {/* HOT / COLD */}
          <HotColdRow>
            <Card style={{ flex: 1 }}>
              <HotColdHeader>
                <Flame size={16} color={theme.colors.state.hot} />
                <Text variant="labelCaps" color="muted">
                  HOT
                </Text>
              </HotColdHeader>
              <BallRow>
                {stats.hot.map(h => (
                  <LottoBall key={h.number} number={h.number} size="sm" />
                ))}
              </BallRow>
            </Card>
            <Card style={{ flex: 1 }}>
              <HotColdHeader>
                <Snowflake size={16} color={theme.colors.state.cold} />
                <Text variant="labelCaps" color="muted">
                  COLD
                </Text>
              </HotColdHeader>
              <BallRow>
                {stats.cold.map(c => (
                  <LottoBall key={c.number} number={c.number} size="sm" />
                ))}
              </BallRow>
            </Card>
          </HotColdRow>

          {/* 번호별 출현 빈도 */}
          <SectionCard>
            <Text variant="headlineMd">번호별 출현 빈도</Text>
            <View style={{ marginTop: theme.spacing.md }}>
              <BarChart data={barData} />
            </View>
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

          {/* 번호 합계 분포 */}
          <SectionCard>
            <Text variant="headlineMd">번호 합계 분포</Text>
            {stats.sum.buckets.map(b => (
              <SumRow key={b.label}>
                <SumLabel>
                  <Text variant="bodySm" color="muted">
                    {b.label}
                  </Text>
                </SumLabel>
                <SumTrack>
                  <SumFill style={{ width: `${b.ratio * 100}%` }} />
                </SumTrack>
                <SumPct>
                  <Text variant="bodySm">{Math.round(b.ratio * 100)}%</Text>
                </SumPct>
              </SumRow>
            ))}
          </SectionCard>

          {/* 분석 더 보기 */}
          <SectionCard>
            <CTAColumn>
              <Text variant="headlineMd">분석 더 보기</Text>
              <Text variant="bodySm" color="muted">
                더 많은 통계 지표를 확인하세요.
              </Text>
              <Button
                label="전체 통계 보기"
                size="sm"
                onPress={() =>
                  navigation.navigate('StatsDetail', { type: 'frequency' })
                }
              />
            </CTAColumn>
          </SectionCard>
        </ScrollView>
      )}
    </Screen>
  );
}
