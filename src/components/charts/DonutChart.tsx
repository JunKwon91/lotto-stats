// ============================================================================
// DonutChart — 도넛(링) 차트
// ============================================================================
//
// react-native-svg의 Circle을 stroke-dasharray로 잘라 세그먼트를 그린다
// (차트 라이브러리 없이 경량 — 세그먼트 소수에 적합). 배경 트랙 위에 각
// 세그먼트를 얹고, 중앙 콘텐츠는 children으로 오버레이한다
// 색은 토큰 값을 주입받는다(컴포넌트가 raw hex를 정하지 않음)
// ============================================================================

import type { ReactNode } from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import styled, { useTheme } from 'styled-components/native';

export interface DonutSegment {
  /** 상대 크기 — 전체 합으로 정규화된다 */
  value: number;
  /** 세그먼트 색 (토큰 값 주입) */
  color: string;
}

export interface DonutChartProps {
  segments: DonutSegment[];
  /** 바깥 지름(px) @default 160 */
  size?: number;
  /** 링 두께(px) @default 20 */
  thickness?: number;
  /** 배경 링 색 — 생략 시 surface.containerHigh */
  trackColor?: string;
  /** 중앙 오버레이 콘텐츠 */
  children?: ReactNode;
}

const Wrap = styled.View`
  align-items: center;
  justify-content: center;
`;

const Center = styled.View`
  position: absolute;
  align-items: center;
  justify-content: center;
`;

export function DonutChart({
  segments,
  size = 160,
  thickness = 20,
  trackColor,
  children,
}: DonutChartProps) {
  const theme = useTheme();
  const track = trackColor ?? theme.colors.surface.containerHigh;

  const center = size / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;

  // 각 세그먼트를 dasharray로 그리고, 앞 세그먼트 길이만큼 offset을 밀어 이어붙인다
  let offset = 0;

  return (
    <Wrap style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* rotation -90 → 12시 방향에서 시계방향으로 시작 */}
        <G rotation={-90} origin={`${center}, ${center}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={track}
            strokeWidth={thickness}
            fill="none"
          />
          {segments.map((seg, i) => {
            const arcLen = (seg.value / total) * circumference;
            const el = (
              <Circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                stroke={seg.color}
                strokeWidth={thickness}
                fill="none"
                strokeDasharray={`${arcLen} ${circumference - arcLen}`}
                strokeDashoffset={-offset}
              />
            );
            offset += arcLen;
            return el;
          })}
        </G>
      </Svg>
      {children != null && (
        <Center style={{ width: size, height: size }}>{children}</Center>
      )}
    </Wrap>
  );
}
