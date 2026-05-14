// ============================================================================
// EmptyState — 빈 상태 표시 컴포넌트
// ============================================================================
//
// 데이터가 없거나 검색 결과가 비었을 때 표시. icon + title + description +
// 선택 action 으로 구성된 컨테이너. tone으로 두 가지 시각 패턴 지원:
//   - 'standard' — 풀-스크린 또는 큰 영역용. title 강조(primary headline)
//   - 'subtle'   — 카드 내부 인라인 hint용. title도 muted
//
// 사용 예:
//   <EmptyState
//     icon={<Inbox color={theme.colors.text.muted} size={32} />}
//     title="저장된 분석이 없습니다"
//     description="새로운 분석 조합을 저장해 보세요."
//     action={{ label: '분석 만들기', onPress: openCreate }}
//   />
//
//   // 카드 안 인라인 hint
//   <EmptyState
//     tone="subtle"
//     icon={<Star color={theme.colors.text.muted} size={32} />}
//     title="새로운 분석 조합을 저장해보세요"
//   />
//
// [디자인 토큰]
// 컨테이너: padding 24 horizontal / 32 vertical, gap 12, vertical center 정렬
//   bg surface.container, 1px border.subtle, borderRadius radius.lg(16)
// Icon: 호출처가 직접 렌더 (lucide-react-native 권장 32px, text.muted)
// Title (standard): headlineSm + text.primary
// Title (subtle):   bodyBase + text.muted
// Description: bodyBase + text.muted (양 tone 공통)
// Action: Button variant='primary' (호출처가 size 등은 기본값 사용)
// ============================================================================

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import Button from '@/components/action/Button';
import Text from '@/components/primitives/Text';

export type EmptyStateTone =
  /** 풀-스크린·큰 영역용. title이 headlineSm + primary로 강조됨 */
  | 'standard'
  /** 카드 내부 인라인 hint용. title도 bodyBase + muted */
  | 'subtle';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps {
  /** 상단에 표시할 아이콘 (lucide 등). 크기·색은 호출처가 결정. */
  icon?: ReactNode;
  title: string;
  /** 제목 아래 보조 설명. 생략 시 영역 자체 렌더 안 함. */
  description?: string;
  /** 메인 액션 버튼 — Button primary 사용. 생략 가능. */
  action?: EmptyStateAction;
  /**
   * 시각 톤.
   * @default 'standard'
   */
  tone?: EmptyStateTone;
  style?: StyleProp<ViewStyle>;
}

const Container = styled.View`
  padding: 32px 24px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-width: 1px;
  background-color: ${({ theme }) => theme.colors.surface.container};
  border-color: ${({ theme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }) => theme.radius.lg}px;
`;

/**
 * 빈 상태 표시.
 *
 * @example
 * <EmptyState
 *   icon={<Inbox color={theme.colors.text.muted} size={32} />}
 *   title="저장된 분석이 없습니다"
 *   description="새로운 분석 조합을 저장해 보세요."
 *   action={{ label: '분석 만들기', onPress: openCreate }}
 * />
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  tone = 'standard',
  style,
}: EmptyStateProps) {
  const titleVariant = tone === 'subtle' ? 'bodyBase' : 'headlineSm';
  const titleColor = tone === 'subtle' ? 'muted' : 'primary';

  return (
    <Container style={style}>
      {icon}
      <Text variant={titleVariant} color={titleColor} align="center">
        {title}
      </Text>
      {description !== undefined && (
        <Text variant="bodyBase" color="muted" align="center">
          {description}
        </Text>
      )}
      {action && (
        <Button
          label={action.label}
          variant="primary"
          onPress={action.onPress}
        />
      )}
    </Container>
  );
}
