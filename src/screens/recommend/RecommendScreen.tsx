// ============================================================================
// RecommendScreen — 번호 추천 알고리즘 (Recommend 탭)
// ============================================================================
//
// 다섯 알고리즘(Hot/Cold/패턴/균형/랜덤) 중 하나와 세트 개수(1~5)를 고르고
// "번호 생성"을 누르면 utils/algorithms로 조합을 뽑는다. Hot/Cold는 전체 회차를
// 기준으로 가중하므로 rounds 전량을 넘긴다(통계 화면의 최근 100회와 다르다).
// 알고리즘이나 개수를 바꾸면 이전 결과를 무효화해, 화면과 결과가 항상 맞물린다
// ============================================================================

import {
  Flame,
  type LucideIcon,
  Scale,
  Shuffle,
  Snowflake,
  Star,
  TrendingUp,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button } from '@/components/action';
import { SegmentedControl } from '@/components/display';
import type { SegmentedControlSegment } from '@/components/display';
import { ErrorView, LoadingView } from '@/components/feedback';
import { OptionCard } from '@/components/input';
import { AppHeader } from '@/components/layout';
import { LottoBallSet } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import { generateRecommendation, type RecommendType } from '@/utils/algorithms';

type IconTone = 'hot' | 'cold' | 'accent';

interface AlgorithmOption {
  key: RecommendType;
  title: string;
  desc: string;
  Icon: LucideIcon;
  tone: IconTone;
}

const ALGORITHMS: AlgorithmOption[] = [
  {
    key: 'hot',
    title: 'Hot 번호 추천',
    desc: '최근 출현 빈도가 높은 번호 중심',
    Icon: Flame,
    tone: 'hot',
  },
  {
    key: 'cold',
    title: 'Cold 번호 추천',
    desc: '장기간 미출현한 번호 위주 추출',
    Icon: Snowflake,
    tone: 'cold',
  },
  {
    key: 'pattern',
    title: '패턴 분석',
    desc: '연속 번호 및 구간 분포 패턴',
    Icon: TrendingUp,
    tone: 'accent',
  },
  {
    key: 'balanced',
    title: '균형 배치',
    desc: '홀짝·합계 균형',
    Icon: Scale,
    tone: 'accent',
  },
  {
    key: 'random',
    title: '랜덤 생성',
    desc: '순수 확률 기반 자동 생성',
    Icon: Shuffle,
    tone: 'accent',
  },
];

// 결과 카드 헤더 — 선택 알고리즘에 따라 바뀐다
const RESULT_LABEL: Record<RecommendType, string> = {
  hot: 'Hot 번호 기반 조합',
  cold: 'Cold 번호 기반 조합',
  pattern: '패턴 분석 기반 조합',
  balanced: '균형 배치 기반 조합',
  random: '랜덤 조합',
};

type CountKey = '1' | '2' | '3' | '4' | '5';
const COUNT_SEGMENTS: SegmentedControlSegment<CountKey>[] = (
  ['1', '2', '3', '4', '5'] as CountKey[]
).map(value => ({ value, label: value }));

const TitleBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-top: ${({ theme }) => theme.spacing.md}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const OptionList = styled.View`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const Block = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const ResultHeader = styled.View`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

const ResultRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SetLabel = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const HintCard = styled(Card)`
  align-items: center;
`;

const Disclaimer = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
`;

const StateArea = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
`;

export default function RecommendScreen() {
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  const [algorithm, setAlgorithm] = useState<RecommendType>('hot');
  const [count, setCount] = useState<CountKey>('1');
  const [results, setResults] = useState<number[][] | null>(null);

  const rounds = data?.data;
  const canGenerate = rounds != null && rounds.length > 0;

  const toneColor = (tone: IconTone) => {
    if (tone === 'hot') return theme.colors.state.hot;
    if (tone === 'cold') return theme.colors.state.cold;
    return theme.colors.primary.action;
  };

  // 선택이 바뀌면 이전 결과를 버린다 — 화면 상태와 결과가 어긋나지 않게
  const selectAlgorithm = (key: RecommendType) => {
    setAlgorithm(key);
    setResults(null);
  };

  const selectCount = (value: CountKey) => {
    setCount(value);
    setResults(null);
  };

  const handleGenerate = () => {
    if (!canGenerate) return;
    setResults(generateRecommendation(algorithm, rounds, Number(count)));
  };

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
            <LoadingView message="데이터를 불러오는 중..." />
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
            <Text variant="displayLg">번호 추천 알고리즘</Text>
            <Text variant="bodySm" color="muted">
              정교한 통계 분석을 통해 최적의 번호 조합을 제안합니다.
            </Text>
          </TitleBlock>

          {/* 알고리즘 선택 */}
          <OptionList>
            {ALGORITHMS.map(({ key, title, desc, Icon, tone }) => (
              <OptionCard
                key={key}
                selected={key === algorithm}
                title={title}
                description={desc}
                icon={<Icon size={22} color={toneColor(tone)} />}
                onPress={() => selectAlgorithm(key)}
              />
            ))}
          </OptionList>

          {/* 세트 개수 */}
          <Block>
            <Text variant="labelLg" color="secondary">
              세트 개수
            </Text>
            <SegmentedControl
              segments={COUNT_SEGMENTS}
              value={count}
              onChange={selectCount}
            />
          </Block>

          {/* 번호 생성 */}
          <Block>
            <Button
              label={results ? '다시 생성' : '번호 생성'}
              size="lg"
              fullWidth
              disabled={!canGenerate}
              onPress={handleGenerate}
            />
          </Block>

          {/* 결과 */}
          {results ? (
            <Block>
              <ResultHeader>
                <Text variant="labelCaps" color="accent">
                  이번 회차 추천
                </Text>
                <Text variant="headlineMd">{RESULT_LABEL[algorithm]}</Text>
              </ResultHeader>
              {results.map((set, i) => (
                <Card key={i} variant="filled">
                  {results.length > 1 && (
                    <SetLabel>
                      <Text variant="labelSm" color="muted">
                        세트 {i + 1}
                      </Text>
                    </SetLabel>
                  )}
                  <ResultRow>
                    <LottoBallSet numbers={set} size="md" />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="즐겨찾기"
                      hitSlop={8}
                      onPress={() => {}}
                    >
                      <Star size={22} color={theme.colors.text.secondary} />
                    </Pressable>
                  </ResultRow>
                </Card>
              ))}
            </Block>
          ) : (
            <Block>
              <HintCard>
                <Text variant="bodySm" color="muted">
                  번호 생성 버튼을 눌러 조합을 확인하세요.
                </Text>
              </HintCard>
            </Block>
          )}

          <Disclaimer>
            <Text variant="bodySm" color="muted">
              통계 기반으로 생성된 조합이며 당첨을 보장하지 않습니다.
            </Text>
          </Disclaimer>
        </ScrollView>
      )}
    </Screen>
  );
}
