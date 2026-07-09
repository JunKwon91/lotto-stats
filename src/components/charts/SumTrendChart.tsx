// ============================================================================
// SumTrendChart — 회차별 합계 산점 + 평균 기준선
// ============================================================================
//
// 회차별 당첨번호 합계를 점으로 흩뿌리고, 평균값 위치에 수평 기준선을 그어
// 평균 대비 분포를 보여준다(연결선 없음 — 추세선이 아니라 산포도)
// 점과 기준선을 같은 값 스케일에 놓아야 하므로 도메인에 평균도 포함해 잡는다
// 폭은 컨테이너에 맞춰야 해 onLayout으로 실측한 뒤 그린다(점을 원형으로 유지
// 하려면 x를 늘려 그리는 preserveAspectRatio 방식은 못 쓴다). 색은 토큰 주입
// ============================================================================

import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { useTheme } from 'styled-components/native';

export interface SumTrendChartProps {
  /** 회차별 당첨번호 6개 합계 (표시 순서대로 — 보통 과거→최근) */
  sums: number[];
  /** 평균 합계 — 수평 기준선 위치 */
  average: number;
  /** 차트 높이(px) @default 130 */
  height?: number;
  /** 점 색 — 생략 시 primary.action */
  dotColor?: string;
  /** 평균선 색 — 생략 시 border.default */
  lineColor?: string;
}

const DOT_RADIUS = 3.5;
const PAD_Y = 12;

export function SumTrendChart({
  sums,
  average,
  height = 130,
  dotColor,
  lineColor,
}: SumTrendChartProps) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  const dot = dotColor ?? theme.colors.primary.action;
  const line = lineColor ?? theme.colors.border.default;

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(e.nativeEvent.layout.width);

  // 값 도메인 — 점과 평균선을 같은 스케일에 맞추려 평균도 함께 넣는다
  const values = sums.length > 0 ? [...sums, average] : [average];
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const flat = hi === lo; // 전부 동일하면 중앙 한 줄에 눕힌다

  const plotH = height - PAD_Y * 2;
  // 값이 클수록 위(y 작음). flat이면 세로 중앙 고정
  const yOf = (v: number) =>
    flat ? height / 2 : PAD_Y + ((hi - v) / (hi - lo)) * plotH;

  // 점이 좌우 끝에서 잘리지 않게 반지름만큼 여백
  const xOf = (i: number) =>
    sums.length <= 1
      ? width / 2
      : DOT_RADIUS + (i / (sums.length - 1)) * (width - DOT_RADIUS * 2);

  return (
    <View onLayout={onLayout} style={{ height }}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Line
            x1={0}
            y1={yOf(average)}
            x2={width}
            y2={yOf(average)}
            stroke={line}
            strokeWidth={1}
          />
          {sums.map((s, i) => (
            <Circle key={i} cx={xOf(i)} cy={yOf(s)} r={DOT_RADIUS} fill={dot} />
          ))}
        </Svg>
      )}
    </View>
  );
}
