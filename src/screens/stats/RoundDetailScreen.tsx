// ============================================================================
// RoundDetailScreen — 회차 상세 (커스텀 헤더 + Hero Card)
// ============================================================================
//
// { round } 파라미터로 진입해 해당 회차의 당첨 결과를 보여준다.
// 데이터는 useLottoData의 전체 목록에서 drawNo로 찾는다(별도 fetch 없음).
// 이 조각은 헤더 + Hero(회차·날짜·당첨번호)까지. 등수별 표·요약 슬롯은 후속.
// ============================================================================

import { Star } from 'lucide-react-native';
import { Pressable, ScrollView } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { ErrorView, LoadingView } from '@/components/feedback';
import { SubHeader } from '@/components/layout';
import { LottoBall, LottoBallSet } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Card, Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { RoundDetailScreenProps } from '@/navigation/types';

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

export default function RoundDetailScreen({ route }: RoundDetailScreenProps) {
  const { round } = route.params;
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  const roundData = data?.data.find(r => r.drawNo === round);

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
        </ScrollView>
      )}
    </Screen>
  );
}
