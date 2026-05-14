// ============================================================================
// LoadingView — 로딩 상태 표시 컴포넌트
// ============================================================================
//
// 비동기 데이터 로딩·작업 진행 상태를 시각적으로 알림. ActivityIndicator 중심의
// 단순 컨테이너로, 선택적 message만 받는다.
//
// 사용 예:
//   <LoadingView message="데이터를 불러오는 중..." />
//
//   // spinner만
//   <LoadingView size="small" />
//
// [디자인 토큰]
// 컨테이너: padding 24 horizontal / 32 vertical, gap 12, vertical center 정렬
//   bg surface.container, 1px border.subtle, borderRadius radius.lg(16)
//   (EmptyState·ErrorView와 동일 컨테이너로 Feedback 카테고리 시각 일관성 유지)
// Spinner: RN ActivityIndicator
//   size='large'(48) | 'small'(24), color primary.action
// Message: bodyBase + text.muted (생략 시 미렌더)
//
// [EmptyState·ErrorView와의 차이]
// - title·icon·action 없음 — 로딩은 사용자 입력 차단 + 단순 진행 알림
// - spinner가 유일 visual element
// ============================================================================

import { ActivityIndicator } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import Text from '@/components/primitives/Text';

export interface LoadingViewProps {
  /** spinner 아래 보조 메시지. 생략 시 미렌더. */
  message?: string;
  /**
   * spinner 크기.
   * @default 'large'
   */
  size?: 'small' | 'large';
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
 * 로딩 상태 표시.
 *
 * @example
 * <LoadingView message="데이터를 불러오는 중..." />
 */
export default function LoadingView({
  message,
  size = 'large',
  style,
}: LoadingViewProps) {
  const theme = useTheme();

  return (
    <Container style={style}>
      <ActivityIndicator size={size} color={theme.colors.primary.action} />
      {message !== undefined && (
        <Text variant="bodyBase" color="muted" align="center">
          {message}
        </Text>
      )}
    </Container>
  );
}
