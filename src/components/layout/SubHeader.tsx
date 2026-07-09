// ============================================================================
// SubHeader — 서브 화면 상단 바 (뒤로가기 + 타이틀 + 우측 액션)
// ============================================================================
//
// 스택으로 push되는 서브 화면들이 공유하는 뒤로가기형 헤더. 좌측 뒤로가기는
// navigation.goBack에 직접 연결하고, 우측 액션(즐겨찾기 토글 등)은 소비처가
// right 슬롯으로 주입한다
// SafeArea 상단은 화면의 Screen(edges 'top')이 처리하므로 여기서는 다루지 않는다(홈 AppHeader와 동일 패턴, 이중 여백 방지)
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Text } from '@/components/primitives';

const HEADER_HEIGHT = 56;
const BACK_ICON_SIZE = 24;

const Bar = styled.View`
  height: ${HEADER_HEIGHT}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: ${({ theme }) => theme.spacing.containerMargin}px;
  padding-right: ${({ theme }) => theme.spacing.containerMargin}px;
`;

const LeftGroup = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export interface SubHeaderProps {
  /** 가운데 정렬이 아닌 좌측 타이틀. 예: "1105회 상세" */
  title: string;
  /** 우측 액션 슬롯(옵셔널). 예: 즐겨찾기 토글 */
  right?: ReactNode;
}

/**
 * 서브 화면 상단 바. 좌측 뒤로가기+타이틀, 우측 액션(옵셔널)
 *
 * @example
 * <SubHeader title="1105회 상세" right={<FavoriteButton />} />
 */
export function SubHeader({ title, right }: SubHeaderProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <Bar>
      <LeftGroup>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          hitSlop={8}
        >
          <ArrowLeft size={BACK_ICON_SIZE} color={theme.colors.text.primary} />
        </Pressable>
        <Text variant="headlineMd">{title}</Text>
      </LeftGroup>
      {right}
    </Bar>
  );
}
