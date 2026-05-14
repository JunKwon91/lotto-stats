// ============================================================================
// ErrorView — 오류 상태 표시 컴포넌트
// ============================================================================
//
// 데이터 fetch 실패·요청 에러·예외 상황을 사용자에게 알릴 때 사용. icon +
// title + description + 선택 action 으로 구성. 기본 아이콘은 lucide
// AlertCircle을 state.error 색상으로 렌더해 위험·경고 톤을 즉시 전달한다.
//
// 사용 예:
//   <ErrorView
//     title="데이터를 불러오지 못했습니다"
//     description="네트워크 상태를 확인하고 다시 시도해 주세요."
//     action={{ label: '다시 시도', onPress: retry }}
//   />
//
//   // 커스텀 아이콘
//   <ErrorView
//     icon={<WifiOff color={theme.colors.state.error} size={32} />}
//     title="오프라인 상태입니다"
//   />
//
// [디자인 토큰]
// 컨테이너: padding 24 horizontal / 32 vertical, gap 12, vertical center 정렬
//   bg surface.container, 1px border.subtle, borderRadius radius.lg(16)
//   (EmptyState와 동일 컨테이너로 Feedback 카테고리 시각 일관성 유지)
// Icon (기본): lucide AlertCircle 32px, color state.error
// Title: headlineSm + text.primary (항상 강조 톤)
// Description: bodyBase + text.muted
// Action: Button variant='primary'
//
// [EmptyState와의 차이]
// - tone variant 없음 — 에러는 항상 강조 톤
// - 기본 아이콘 state.error 색 (vs EmptyState muted 톤)
// - title 색은 항상 primary (vs EmptyState의 tone-conditional)
// ============================================================================

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import Button from '@/components/action/Button';
import Text from '@/components/primitives/Text';

export interface ErrorViewAction {
  label: string;
  onPress: () => void;
}

export interface ErrorViewProps {
  /** 상단 아이콘. 생략 시 lucide AlertCircle + state.error 자동 적용. */
  icon?: ReactNode;
  title: string;
  /** 제목 아래 보조 설명. 생략 시 영역 자체 렌더 안 함. */
  description?: string;
  /** 메인 액션 (보통 "다시 시도"). Button primary 사용. */
  action?: ErrorViewAction;
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
 * 오류 상태 표시 컴포넌트.
 *
 * @example
 * <ErrorView
 *   title="데이터를 불러오지 못했습니다"
 *   description="네트워크 상태를 확인하고 다시 시도해 주세요."
 *   action={{ label: '다시 시도', onPress: retry }}
 * />
 */
export default function ErrorView({
  icon,
  title,
  description,
  action,
  style,
}: ErrorViewProps) {
  const theme = useTheme();
  const resolvedIcon = icon ?? (
    <AlertCircle color={theme.colors.state.error} size={32} />
  );

  return (
    <Container style={style}>
      {resolvedIcon}
      <Text variant="headlineSm" color="primary" align="center">
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
