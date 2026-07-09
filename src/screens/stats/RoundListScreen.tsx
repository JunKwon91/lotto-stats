// ============================================================================
// RoundListScreen — 전체 회차 목록 (검색 + 정렬 + 연도 그룹 + FlashList)
// ============================================================================
//
// useLottoData의 전 회차를 정렬(최신순/오래된순)해 FlashList로 렌더한다
// 검색어가 없으면 연도별로 그룹핑(연도 헤더 + 회차 카드)하고, 검색 중에는
// 결과가 여러 연도에 흩어지므로 그룹을 풀고 평탄한 회차 목록만 보여준다
// 연도 헤더와 회차 카드는 하나의 배열로 합쳐 getItemType으로 이종 행을 구분한다
// (FlashList 가상화 성능). 데이터는 이미 메모리에 있어 렌더 가상화만 필요하다
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { useMemo, useState } from 'react';
import styled, { useTheme } from 'styled-components/native';

import {
  SegmentedControl,
  type SegmentedControlSegment,
} from '@/components/display';
import { EmptyState, ErrorView, LoadingView } from '@/components/feedback';
import { SearchInput } from '@/components/input';
import { SubHeader } from '@/components/layout';
import { RoundCard } from '@/components/lotto';
import { Text } from '@/components/primitives';
import { Screen } from '@/components/surface';
import { useLottoData } from '@/hooks/queries/useLottoData';
import type { LottoRound } from '@/types/lotto';

type SortOrder = 'newest' | 'oldest';

// 평탄화 리스트 행 — 연도 헤더 또는 회차 카드
type Row =
  | { type: 'year'; year: string }
  | { type: 'round'; round: LottoRound };

const SORT_SEGMENTS: SegmentedControlSegment<SortOrder>[] = [
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

const StateArea = styled.View`
  flex: 1;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
`;

const Body = styled.View`
  flex: 1;
`;

// 스크롤 밖 고정 — 검색·정렬 컨트롤
const Controls = styled.View`
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-top: ${({ theme }) => theme.spacing.lg}px;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

const ListArea = styled.View`
  flex: 1;
`;

const EmptyArea = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg}px;
`;

// 연도 헤더 (예: "2024")
const YearHeader = styled.View`
  padding-top: ${({ theme }) => theme.spacing.sm}px;
  padding-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const Separator = styled.View`
  height: ${({ theme }) => theme.spacing.md}px;
`;

export default function RoundListScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { data, isError, refetch } = useLottoData();

  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // 정렬 → 검색 필터 → (검색 없으면) 연도 그룹핑까지 한 번에
  const rows = useMemo<Row[]>(() => {
    const sorted = [...(data?.data ?? [])].sort((a, b) =>
      sortOrder === 'newest' ? b.drawNo - a.drawNo : a.drawNo - b.drawNo,
    );

    const q = query.trim();
    if (q) {
      // 검색 중 — 그룹 없이 평탄한 회차 목록
      return sorted
        .filter(round => String(round.drawNo).includes(q))
        .map<Row>(round => ({ type: 'round', round }));
    }

    // 연도 경계마다 헤더 삽입
    const out: Row[] = [];
    let currentYear = '';
    for (const round of sorted) {
      const year = round.date.slice(0, 4);
      if (year !== currentYear) {
        currentYear = year;
        out.push({ type: 'year', year });
      }
      out.push({ type: 'round', round });
    }
    return out;
  }, [data?.data, query, sortOrder]);

  // 회차 번호 검색이라 숫자만 받는다
  const handleQueryChange = (text: string) => setQuery(text.replace(/\D/g, ''));

  const renderRow: ListRenderItem<Row> = ({ item }) => {
    if (item.type === 'year') {
      return (
        <YearHeader>
          <Text variant="labelMd" color="secondary">
            {item.year}
          </Text>
        </YearHeader>
      );
    }
    return (
      <RoundCard
        round={item.round}
        onPress={() =>
          navigation.navigate('RoundDetail', { round: item.round.drawNo })
        }
      />
    );
  };

  return (
    <Screen edges={['top']} padded={false}>
      <SubHeader title="전체 회차" />

      {!data ? (
        <StateArea>
          {isError ? (
            <ErrorView
              title="데이터를 불러오지 못했어요"
              description="네트워크를 확인하고 다시 시도해 주세요."
              action={{ label: '다시 시도', onPress: () => refetch() }}
            />
          ) : (
            <LoadingView message="회차 목록을 불러오는 중..." />
          )}
        </StateArea>
      ) : (
        <Body>
          <Controls>
            <SearchInput
              value={query}
              placeholder="회차 번호 검색..."
              onChangeText={handleQueryChange}
            />
            <SegmentedControl
              segments={SORT_SEGMENTS}
              value={sortOrder}
              onChange={setSortOrder}
            />
          </Controls>

          {rows.length === 0 ? (
            <EmptyArea>
              <EmptyState
                title="검색 결과가 없어요"
                description={`'${query}' 회차를 찾지 못했어요.`}
              />
            </EmptyArea>
          ) : (
            <ListArea>
              <FlashList
                data={rows}
                renderItem={renderRow}
                keyExtractor={item =>
                  item.type === 'year'
                    ? `year-${item.year}`
                    : `round-${item.round.drawNo}`
                }
                getItemType={item => item.type}
                ItemSeparatorComponent={Separator}
                contentContainerStyle={{
                  paddingHorizontal: theme.spacing.containerMargin,
                  paddingTop: theme.spacing.md,
                  paddingBottom: theme.spacing.xl,
                }}
              />
            </ListArea>
          )}
        </Body>
      )}
    </Screen>
  );
}
