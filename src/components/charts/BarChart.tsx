// ============================================================================
// BarChart — 세로 막대 차트
// ============================================================================
//
// 순수 View로 그리는 세로 막대 차트(차트 라이브러리 불필요). 각 막대 높이는
// 최댓값 대비 비율로 정해지고, highlighted 항목만 강조색을 쓴다
// 번호별 출현 빈도(Statistics·StatsDetail 공용)에 쓴다
// 색은 토큰 값을 주입받는다(생략 시 테마 기본)
// ============================================================================

import styled, { useTheme } from 'styled-components/native';

import { Text } from '@/components/primitives';

export interface BarDatum {
  label: string;
  value: number;
  /** 강조 막대 여부 (예: 최다 출현) */
  highlighted?: boolean;
}

export interface BarChartProps {
  data: BarDatum[];
  /** 막대 영역 높이(px) @default 120 */
  height?: number;
  /** 기본 막대 색 — 생략 시 surface.containerHigh */
  barColor?: string;
  /** 강조 막대 색 — 생략 시 primary.action */
  highlightColor?: string;
}

const BAR_GAP = 6;

const BarsRow = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: ${BAR_GAP}px;
`;

const BarCol = styled.View`
  flex: 1;
  align-items: center;
  justify-content: flex-end;
`;

const Bar = styled.View`
  width: 100%;
  border-radius: ${({ theme }) => theme.radius.sm}px;
`;

const LabelsRow = styled.View`
  flex-direction: row;
  gap: ${BAR_GAP}px;
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

const LabelCol = styled.View`
  flex: 1;
  align-items: center;
`;

export function BarChart({
  data,
  height = 120,
  barColor,
  highlightColor,
}: BarChartProps) {
  const theme = useTheme();
  const base = barColor ?? theme.colors.surface.containerHigh;
  const hi = highlightColor ?? theme.colors.primary.action;

  // 0으로 나누기 방지 — 최댓값이 0이면 모든 막대 높이 0
  const max = Math.max(1, ...data.map(d => d.value));

  return (
    <>
      <BarsRow style={{ height }}>
        {data.map((d, i) => (
          <BarCol key={i}>
            <Bar
              style={{
                height: (d.value / max) * height,
                backgroundColor: d.highlighted ? hi : base,
              }}
            />
          </BarCol>
        ))}
      </BarsRow>
      <LabelsRow>
        {data.map((d, i) => (
          <LabelCol key={i}>
            <Text variant="labelSm" color="muted">
              {d.label}
            </Text>
          </LabelCol>
        ))}
      </LabelsRow>
    </>
  );
}
