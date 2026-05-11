// ============================================================================
// Spacer — 명시적 간격 컴포넌트
// ============================================================================
//
// 형제 요소 사이 간격을 만든다. theme.spacing 토큰을 size로 매핑.
//
// 사용 예:
//   <Title />
//   <Spacer size="md" />     // 12px 세로 간격
//   <Body />
//
//   <Icon />
//   <Spacer size="sm" axis="horizontal" />  // 8px 가로 간격
//   <Label />
//
// [언제 Spacer를 쓰고 언제 안 쓰는가]
// 부모가 flex layout이면 gap 우선 사용:
//   <View style={{ gap: theme.spacing.md }}>
//     <Title />
//     <Body />
//   </View>
//
// Spacer가 유용한 경우:
//   1) 형제 요소마다 다른 크기 간격을 두고 싶을 때
//   2) ScrollView 내부에서 명시적 간격을 두고 싶을 때
//   3) JSX 가독성을 우선하고 싶을 때 (간격이 명시적으로 드러남)
//
// flexShrink: 0 — 부모 공간 부족 시에도 Spacer가 줄어들지 않음.
// ============================================================================

import styled from 'styled-components/native';

export type SpacerSize =
  /** 4px · 아이콘 옆 텍스트 사이 등 매우 작은 간격 */
  | 'xs'
  /** 8px · 라벨↔인풋 등 작은 간격 */
  | 'sm'
  /** 12px · 카드 내부 행 사이 */
  | 'md'
  /** 16px · 표준 컴포넌트 사이, containerMargin */
  | 'lg'
  /** 24px · 큰 섹션 사이 */
  | 'xl'
  /** 32px · 매우 큰 섹션 사이 */
  | '2xl'
  /** 48px · 페이지 상단 여백 등 */
  | '3xl'
  /** 64px · 가장 큰 간격 */
  | '4xl';

export type SpacerAxis =
  /** 가로 간격 — width로 적용 */
  | 'horizontal'
  /** 세로 간격 — height로 적용 (기본) */
  | 'vertical';

export interface SpacerProps {
  /** theme.spacing 토큰 키. 4 ~ 64px 사이 8단계. */
  size: SpacerSize;
  /**
   * 간격 방향. vertical은 height, horizontal은 width에 적용.
   * @default 'vertical'
   */
  axis?: SpacerAxis;
}

const StyledSpacer = styled.View<{
  $size: SpacerSize;
  $axis: SpacerAxis;
}>`
  flex-shrink: 0;
  ${({ theme, $size, $axis }) =>
    $axis === 'horizontal'
      ? `width: ${theme.spacing[$size]}px;`
      : `height: ${theme.spacing[$size]}px; width: 100%;`}
`;

/**
 * 형제 요소 사이 명시적 간격을 만드는 View.
 *
 * theme.spacing 토큰을 size로 받아 height(vertical) 또는 width(horizontal)에
 * 매핑. flex-shrink: 0이라 부모 공간 부족 시에도 줄어들지 않는다.
 *
 * @example
 * <Title />
 * <Spacer size="md" />
 * <Body />
 *
 * <Icon />
 * <Spacer size="sm" axis="horizontal" />
 * <Label />
 */
export default function Spacer({ size, axis = 'vertical' }: SpacerProps) {
  return <StyledSpacer $size={size} $axis={axis} />;
}
