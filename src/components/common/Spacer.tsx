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
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl';

export type SpacerAxis = 'horizontal' | 'vertical';

export interface SpacerProps {
  size: SpacerSize;
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

export default function Spacer({ size, axis = 'vertical' }: SpacerProps) {
  return <StyledSpacer $size={size} $axis={axis} />;
}
