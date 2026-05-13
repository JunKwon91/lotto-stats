// ============================================================================
// Section — 논리적 그룹 컨테이너
// ============================================================================
//
// 화면 내 의미적으로 묶인 컨텐츠를 그룹화한다. Card와 달리 시각적 컨테이너가
// 아니라 "이 부분이 한 묶음"이라는 의미만 제공.
//
// 사용 예:
//   // 기본 섹션
//   <Section title="최근 결과">
//     <Card>...</Card>
//     <Card>...</Card>
//   </Section>
//
//   // 우측 액션이 있는 섹션
//   <Section title="즐겨찾기" action={<IconButton icon={<Plus />} ... />}>
//     <FavoriteList ... />
//   </Section>
//
//   // 컴팩트 간격 (자식이 가까이 붙어야 할 때)
//   <Section title="통계" spacing="compact">
//     <StatRow />
//     <StatRow />
//   </Section>
//
// [디자인 토큰]
// 제목: Text variant="headlineMd"
// 제목-자식 간격: theme.spacing.md (12)
// 자식 간 gap (spacing prop):
//   - compact: theme.spacing.sm (8)
//   - default: theme.spacing.md (12)
//   - roomy:   theme.spacing.lg (16)
//
// [Section vs Card]
// Section은 논리적 그룹이라 배경/보더/padding 없음.
// Screen이 좌우 padding을 책임지고, Section은 컨텐츠 영역만 사용.
// 진짜 시각적 컨테이너가 필요하면 Card 사용.
//
// [섹션 간 간격]
// 여러 Section을 사용할 때 사이 간격은 호출처에서 결정 (Spacer size="2xl" 권장).
// Section 자체는 외부 margin을 갖지 않음.
// ============================================================================

import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import Text from '@/components/primitives/Text';

export type SectionSpacing =
  /** spacing.sm (8) · 자식이 가까이 붙어야 하는 리스트형 그룹 */
  | 'compact'
  /** spacing.md (12) · 일반 그룹 (기본값) */
  | 'default'
  /** spacing.lg (16) · 자식이 큰 카드/이미지일 때 */
  | 'roomy';

export interface SectionProps {
  /** 섹션 제목 — `headlineMd` typography 적용. */
  title?: string;
  /** 우측 액션 (전체보기 링크·IconButton 등). title이 있을 때만 의미 있음. */
  action?: ReactNode;
  /**
   * 자식 간 간격.
   * @default 'default'
   */
  spacing?: SectionSpacing;
  /** Section 컨테이너에 적용할 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const ChildrenStack = styled.View<{ $spacing: SectionSpacing }>`
  gap: ${({ theme, $spacing }) => {
    if ($spacing === 'compact') return theme.spacing.sm;
    if ($spacing === 'roomy') return theme.spacing.lg;
    return theme.spacing.md;
  }}px;
`;

/**
 * 논리적 그룹 컨테이너.
 *
 * Card와 달리 배경·보더·padding이 없다. "이 부분이 한 묶음"이라는 의미만 제공.
 * 제목·우측 액션과 자식 간 간격(compact/default/roomy)을 props로 제어한다.
 *
 * @example
 * <Section title="최근 결과">
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </Section>
 *
 * @example
 * <Section title="즐겨찾기" action={<Text color="accent">전체 보기</Text>}>
 *   <FavoriteList ... />
 * </Section>
 */
export default function Section({
  title,
  action,
  spacing = 'default',
  style,
  children,
}: SectionProps) {
  const hasHeader = title !== undefined;

  return (
    <View style={style}>
      {hasHeader && (
        <Header>
          <Text variant="headlineMd">{title}</Text>
          {action}
        </Header>
      )}
      <ChildrenStack $spacing={spacing}>{children}</ChildrenStack>
    </View>
  );
}
