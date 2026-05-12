// ============================================================================
// Divider — 1px 구분선 컴포넌트
// ============================================================================
//
// Card 내부, Section 사이, List item 사이 등 시각적 구분에 사용.
//
// 사용 예:
//   <Divider />                              // 기본 horizontal, subtle
//   <Divider color="strong" />               // 진한 구분선
//   <Divider orientation="vertical" />       // 세로 구분선
//   <Divider inset={16} />                   // 좌우 16px 여백 적용
//
// [디자인 토큰]
// 색상: theme.colors.border.{subtle|default|strong}
// 두께: 1px 고정
// margin/padding 없음 (부모가 결정)
// ============================================================================

import styled from 'styled-components/native';

export type DividerOrientation =
  /** 가로 구분선 (height: 1, width: 100%) */
  | 'horizontal'
  /** 세로 구분선 (width: 1, height: 100%) */
  | 'vertical';

export type DividerColor =
  /** border.subtle · 가장 흐릿 (카드 내부 기본) */
  | 'subtle'
  /** border.default · 표준 구분선 */
  | 'default'
  /** border.strong · 강조 구분선 */
  | 'strong';

export interface DividerProps {
  /**
   * 구분선 방향.
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * 구분선 색상 — theme.colors.border 토큰 매핑. 다크/라이트 모드 자동 전환.
   * @default 'subtle'
   */
  color?: DividerColor;
  /**
   * 좌우(horizontal) 또는 상하(vertical) 여백(px).
   * 카드 내부에서 구분선이 padding 안쪽으로 들어가게 할 때 사용.
   * @default 0
   */
  inset?: number;
}

const StyledDivider = styled.View<{
  $orientation: DividerOrientation;
  $color: DividerColor;
  $inset: number;
}>`
  background-color: ${({ theme, $color }) => theme.colors.border[$color]};
  ${({ $orientation, $inset }) =>
    $orientation === 'horizontal'
      ? `
          height: 1px;
          align-self: stretch;
          ${
            $inset > 0
              ? `margin-left: ${$inset}px; margin-right: ${$inset}px;`
              : ''
          }
        `
      : `
          width: 1px;
          align-self: stretch;
          ${
            $inset > 0
              ? `margin-top: ${$inset}px; margin-bottom: ${$inset}px;`
              : ''
          }
        `}
`;

/**
 * 1px 두께 구분선 컴포넌트.
 *
 * Card 내부, Section 사이, List item 사이 등 시각적 구분에 사용.
 * 색상은 theme.colors.border 토큰 3종(subtle/default/strong) 중 선택.
 *
 * @example
 * <Divider />
 * <Divider color="strong" />
 * <Divider orientation="vertical" inset={8} />
 */
export default function Divider({
  orientation = 'horizontal',
  color = 'subtle',
  inset = 0,
}: DividerProps) {
  return (
    <StyledDivider $orientation={orientation} $color={color} $inset={inset} />
  );
}
