// ============================================================================
// SegmentedControl — 분절 선택 컨트롤
// ============================================================================
//
// 2~N개의 옵션 중 하나를 선택하는 가로 분절 컨트롤. 정렬 옵션이나 테마 선택
// 같은 mutually exclusive 선택지에 사용한다. Generic<T>로 value 타입을 좁힐
// 수 있어 호출처가 잘못된 value를 넘기면 컴파일 시점에 잡힌다.
//
// 사용 예:
//   type SortValue = 'newest' | 'oldest';
//   const [sort, setSort] = useState<SortValue>('newest');
//   <SegmentedControl
//     segments={[
//       { value: 'newest', label: '최신순' },
//       { value: 'oldest', label: '오래된순' },
//     ]}
//     value={sort}
//     onChange={setSort}
//   />
//
// [디자인 토큰]
// 컨테이너: height 36, borderRadius 10, padding 3 (all), gap 4,
//   bg surface.containerLow, 1px border.subtle (Light 모드에서 캔버스와
//   동일 톤이라 윤곽 확보용. border 1px 안쪽 padding 3 = 시각 4px)
// 각 세그먼트: flex 1, height 30, borderRadius 8
//   Active   — bg primary.action, 텍스트 primary.onAction
//   Inactive — bg transparent, 텍스트 text.secondary
// 텍스트 variant: labelLg (Inter 14/600) — WCAG large text 기준(3.0) 통과로
//   Light Active(흰 글자 on 진한 파랑) 가독성 명확
// Pressed 피드백: opacity 0.7 (Button·IconButton 패턴 일관)
// ============================================================================

import type { StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

export interface SegmentedControlSegment<T extends string> {
  /** 내부 값 — onChange 콜백에 전달되는 식별자. */
  value: T;
  /** 표시 라벨. */
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  segments: SegmentedControlSegment<T>[];
  /** 현재 선택된 value — 제어 컴포넌트로 사용. */
  value: T;
  onChange: (value: T) => void;
  /** 컨테이너 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
}

const Container = styled.View`
  height: 36px;
  border-radius: 10px;
  padding: 3px;
  flex-direction: row;
  gap: 4px;
  border-width: 1px;
  background-color: ${({ theme }) => theme.colors.surface.containerLow};
  border-color: ${({ theme }) => theme.colors.border.subtle};
`;

const Segment = styled.Pressable`
  flex: 1;
  height: 30px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
`;

/**
 * 분절 선택 컨트롤.
 *
 * Generic<T extends string>로 segments.value와 prop value의 타입이 일치하도록 강제.
 *
 * @example
 * <SegmentedControl
 *   segments={[
 *     { value: 'dark', label: '다크' },
 *     { value: 'light', label: '라이트' },
 *     { value: 'system', label: '시스템' },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 * />
 */
function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <Container style={style}>
      {segments.map(seg => {
        const isActive = seg.value === value;
        const segBg = isActive
          ? theme.colors.primary.action
          : 'transparent';
        const textColor = isActive
          ? theme.colors.primary.onAction
          : theme.colors.text.secondary;

        return (
          <Segment
            key={seg.value}
            onPress={() => onChange(seg.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={seg.label}
            style={({ pressed }) => ({
              backgroundColor: segBg,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text variant="labelLg" style={{ color: textColor }}>
              {seg.label}
            </Text>
          </Segment>
        );
      })}
    </Container>
  );
}

export default SegmentedControl;
