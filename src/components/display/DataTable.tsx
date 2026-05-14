// ============================================================================
// DataTable — Generic 데이터 테이블
// ============================================================================
//
// 헤더 + 본문 행으로 구성된 단순 테이블. 컬럼은 `DataTableColumn<T>` 배열로
// 정의하며, 각 셀의 렌더는 호출처가 직접 결정한다(`render(row)`). 정렬은
// `sortable` 활성화 시 헤더가 Pressable이 되고 `onSort(key, direction)`로
// 외부에 위임한다 — 실제 데이터 정렬은 부모의 책임.
//
// 사용 예:
//   <DataTable
//     columns={[
//       { key: 'round', header: '회차',
//         render: r => <Text variant="numericMd">{r.round}</Text>,
//         align: 'right', flex: 1, sortable: true },
//       { key: 'numbers', header: '당첨번호',
//         render: r => <Text variant="bodySm">{r.numbers}</Text>,
//         flex: 3 },
//     ]}
//     data={rows}
//     sortable
//     sortKey={sortKey}
//     sortDirection={sortDir}
//     onSort={(k, d) => { setSortKey(k); setSortDir(d); }}
//     keyExtractor={r => String(r.round)}
//   />
//
// [디자인 토큰]
// 외곽 컨테이너: bg surface.container + 1px border.subtle stroke,
//   borderRadius radius.md(12), overflow hidden (둥근 모서리 안쪽 클리핑)
// Header: bg surface.containerLow (외곽 위에서 살짝 어둡게 노출),
//   텍스트 labelCaps + text.muted
//   density='default' height 40 / 'compact' height 32
// Body Row: bg transparent (외곽 surface.container 위)
//   density='default' height 44 / 'compact' height 36
// 셀 padding-horizontal 12 (셀 전체 가로 패딩)
// Row 간 구분선: border.subtle 1px (헤더 하단 + 마지막 행 제외한 모든 행 하단)
// 정렬 인디케이터: lucide ChevronUp/ChevronDown 12px stroke 1.5, text.muted
//
// [정렬 동작]
// - 부모 `sortable === true` && column `sortable === true`인 헤더만 Pressable
// - 활성 컬럼 헤더에만 정렬 화살표 노출 (sortKey === column.key)
// - 같은 컬럼 재탭: asc ↔ desc 토글
// - 다른 컬럼 탭: asc로 시작
// - 실제 data 정렬은 부모가 `onSort` 콜백을 받아 처리
//
// [keyExtractor]
// 정렬·필터 등으로 행 순서가 바뀌는 경우 React 재조정을 위해 권장. 생략 시
// index가 key로 쓰이는데, 이는 동일 index에 다른 row가 매핑될 때 마운트 누락을
// 일으킬 수 있다.
// ============================================================================

import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

export type DataTableDensity =
  /** Header 40 / Body 44 — 일반 데이터 테이블 */
  | 'default'
  /** Header 32 / Body 36 — 행 많을 때 밀도 ↑ */
  | 'compact';

export type DataTableAlign = 'left' | 'center' | 'right';
export type DataTableSortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  /** 정렬·키·접근성에 쓰이는 안정적 ID. */
  key: string;
  /** Header 영역에 표시되는 라벨. labelCaps로 렌더되어 자동 대문자화. */
  header: string;
  /** 본문 셀 콘텐츠 — 호출처가 ReactNode를 직접 반환. */
  render: (row: T) => ReactNode;
  /**
   * 셀 가로 정렬.
   * @default 'left'
   */
  align?: DataTableAlign;
  /**
   * flex 비율. 동일 row 내 다른 컬럼과의 너비 분배 가중치.
   * @default 1
   */
  flex?: number;
  /** true면 헤더가 Pressable로 바뀌고 onSort 콜백을 트리거. */
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /**
   * 테이블 밀도 — header/row 높이 조합.
   * @default 'default'
   */
  density?: DataTableDensity;
  /** 부모 레벨 sort 활성 토글. column.sortable과 둘 다 true여야 헤더가 탭 가능. */
  sortable?: boolean;
  /** 현재 정렬 기준이 되는 컬럼 key. */
  sortKey?: string;
  /** 현재 정렬 방향. */
  sortDirection?: DataTableSortDirection;
  /** 헤더 탭 시 호출. 부모는 받은 (key, direction)으로 data를 재정렬. */
  onSort?: (key: string, direction: DataTableSortDirection) => void;
  /** 행 React key 추출. 권장 — 정렬·필터로 순서가 바뀌는 테이블에 필수. */
  keyExtractor?: (row: T, index: number) => string;
  /** 테이블 외곽 컨테이너 스타일 override. */
  style?: StyleProp<ViewStyle>;
}

const ROW_HEIGHT = {
  default: { header: 40, body: 44 },
  compact: { header: 32, body: 36 },
} as const;

const Container = styled.View`
  border-width: 1px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-color: ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.md}px;
`;

const HeaderRow = styled.View<{ $height: number }>`
  flex-direction: row;
  padding: 0 12px;
  align-items: center;
  border-bottom-width: 1px;
  height: ${({ $height }) => $height}px;
  background-color: ${({ theme }) => theme.colors.surface.containerLow};
  border-bottom-color: ${({ theme }) => theme.colors.border.subtle};
`;

const BodyRow = styled.View<{ $height: number; $isLast: boolean }>`
  flex-direction: row;
  padding: 0 12px;
  align-items: center;
  height: ${({ $height }) => $height}px;
  border-bottom-width: ${({ $isLast }) => ($isLast ? 0 : 1)}px;
  border-bottom-color: ${({ theme }) => theme.colors.border.subtle};
`;

const CellContent = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

function justifyForAlign(align: DataTableAlign): ViewStyle['justifyContent'] {
  if (align === 'right') return 'flex-end';
  if (align === 'center') return 'center';
  return 'flex-start';
}

function DataTable<T>({
  columns,
  data,
  density = 'default',
  sortable = false,
  sortKey,
  sortDirection,
  onSort,
  keyExtractor,
  style,
}: DataTableProps<T>) {
  const theme = useTheme();
  const heights = ROW_HEIGHT[density];

  const handleHeaderPress = (col: DataTableColumn<T>) => {
    if (!sortable || !col.sortable || !onSort) return;
    if (sortKey === col.key) {
      onSort(col.key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(col.key, 'asc');
    }
  };

  const renderHeader = () => (
    <HeaderRow $height={heights.header}>
      {columns.map(col => {
        const align = col.align ?? 'left';
        const flex = col.flex ?? 1;
        const isSortable = sortable && col.sortable === true;
        const isActive = isSortable && sortKey === col.key;

        const cellStyle: ViewStyle = {
          flex,
          flexDirection: 'row',
          justifyContent: justifyForAlign(align),
          alignItems: 'center',
        };

        const indicator = isActive ? (
          sortDirection === 'desc' ? (
            <ChevronDown
              size={12}
              color={theme.colors.text.muted}
              strokeWidth={1.5}
            />
          ) : (
            <ChevronUp
              size={12}
              color={theme.colors.text.muted}
              strokeWidth={1.5}
            />
          )
        ) : null;

        const inner = (
          <CellContent>
            <Text variant="labelCaps" color="muted">
              {col.header}
            </Text>
            {indicator}
          </CellContent>
        );

        if (isSortable) {
          return (
            <Pressable
              key={col.key}
              style={cellStyle}
              onPress={() => handleHeaderPress(col)}
              accessibilityRole="button"
              accessibilityLabel={`${col.header} 정렬`}
            >
              {inner}
            </Pressable>
          );
        }
        return (
          <View key={col.key} style={cellStyle}>
            {inner}
          </View>
        );
      })}
    </HeaderRow>
  );

  const renderBodyRow = (row: T, idx: number) => {
    const isLast = idx === data.length - 1;
    const key = keyExtractor ? keyExtractor(row, idx) : String(idx);

    return (
      <BodyRow key={key} $height={heights.body} $isLast={isLast}>
        {columns.map(col => {
          const align = col.align ?? 'left';
          const flex = col.flex ?? 1;
          const cellStyle: ViewStyle = {
            flex,
            flexDirection: 'row',
            justifyContent: justifyForAlign(align),
            alignItems: 'center',
          };
          return (
            <View key={col.key} style={cellStyle}>
              {col.render(row)}
            </View>
          );
        })}
      </BodyRow>
    );
  };

  return (
    <Container style={style}>
      {renderHeader()}
      {data.map(renderBodyRow)}
    </Container>
  );
}

export default DataTable;
