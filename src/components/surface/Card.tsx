// ============================================================================
// Card — 컨텐츠 컨테이너
// ============================================================================
//
// 화면 내 논리적 단위(Hero, 통계 블록, 회차 항목 등)를 시각적으로 묶는 역할.
// surface.container 배경 + radius.lg + 표준 padding 적용.
//
// 사용 예:
//   // 기본 카드
//   <Card>
//     <Text>내용</Text>
//   </Card>
//
//   // 헤더가 있는 카드
//   <Card title="최근 결과" meta="2024.02.03">
//     <LottoBallSet ... />
//   </Card>
//
//   // 컴팩트 카드 (작은 padding/gap)
//   <Card density="compact">
//     <RoundLabel ... />
//   </Card>
//
//   // 헤더 + Divider
//   <Card title="번호 분석" showDivider>
//     <Chart ... />
//   </Card>
//
// [디자인 토큰]
// 배경:   theme.colors.surface.container
// radius: theme.radius.lg (16)
// padding: default=16, compact=12
// gap:     default=12, compact=8
// 보더 (default variant): 1px theme.colors.border.subtle
//
// [variant]
//   - default:  보더 있는 기본 카드
//   - elevated: 보더 없는 카드 (그림자는 추후 추가)
//
// [density]
//   - default:  일반 카드 (Hero, 통계 카드 등)
//   - compact:  작은 카드 (회차 목록 항목, 즐겨찾기 항목 등)
// ============================================================================

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import Divider from '@/components/primitives/Divider';
import Text from '@/components/primitives/Text';

export type CardVariant =
  /** 보더 있는 기본 카드 (1px border.subtle) */
  | 'default'
  /** 보더 없는 카드 (그림자는 추후 추가) */
  | 'elevated';

export type CardDensity =
  /** padding 16 / gap 12 · 일반 카드 (Hero, 통계 등) */
  | 'default'
  /** padding 12 / gap 8 · 작은 카드 (목록 항목, 즐겨찾기 등) */
  | 'compact';

export interface CardProps {
  /**
   * 카드 스타일 variant.
   * @default 'default'
   */
  variant?: CardVariant;
  /**
   * 카드 밀도 — padding/gap 조정.
   * @default 'default'
   */
  density?: CardDensity;
  /** 카드 헤더 제목 — `headlineMd` typography 적용. */
  title?: string;
  /** 헤더 우측 작은 텍스트 (날짜·라벨 등) — `bodySm muted`. */
  meta?: string;
  /**
   * 헤더와 children 사이에 Divider 렌더. title 또는 meta가 있을 때만 의미 있음.
   * @default false
   */
  showDivider?: boolean;
  /** Card 컨테이너에 적용할 외부 스타일 override. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const Container = styled.View<{
  $variant: CardVariant;
  $density: CardDensity;
}>`
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-radius: ${({ theme }) => theme.radius.lg}px;
  padding: ${({ theme, $density }) =>
    $density === 'compact' ? theme.spacing.md : theme.spacing.lg}px;
  gap: ${({ theme, $density }) =>
    $density === 'compact' ? theme.spacing.sm : theme.spacing.md}px;
  ${({ theme, $variant }) =>
    $variant === 'default'
      ? `border-width: 1px; border-color: ${theme.colors.border.subtle};`
      : ''}
`;

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

/**
 * 컨텐츠 컨테이너.
 *
 * surface.container 배경 + radius.lg + 표준 padding/gap.
 * variant로 보더 유무, density로 padding/gap 조정.
 *
 * @example
 * <Card title="최근 결과" meta="2024.02.03" showDivider>
 *   <LottoBallSet ... />
 * </Card>
 *
 * @example
 * <Card density="compact">
 *   <Text>목록 항목</Text>
 * </Card>
 */
export default function Card({
  variant = 'default',
  density = 'default',
  title,
  meta,
  showDivider = false,
  style,
  children,
}: CardProps) {
  const hasHeader = title !== undefined || meta !== undefined;

  return (
    <Container $variant={variant} $density={density} style={style}>
      {hasHeader && (
        <Header>
          {title !== undefined && <Text variant="headlineMd">{title}</Text>}
          {meta !== undefined && (
            <Text variant="bodySm" color="muted">
              {meta}
            </Text>
          )}
        </Header>
      )}
      {hasHeader && showDivider && <Divider color="subtle" />}
      {children}
    </Container>
  );
}
