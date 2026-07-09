// ============================================================================
// AppHeader — 앱 상단 바 (로고 + 타이틀 + 설정)
// ============================================================================
//
// 메인 탭 화면들이 공유하는 로고형 헤더. 우측 설정 아이콘은 Settings 화면으로
// 이동한다(공통 동작이라 내부 useNavigation으로 직접 연결)
// SafeArea 상단은 화면의 Screen(edges 'top')이 처리하므로 여기서는 다루지
// 않는다(이중 여백 방지)
// ============================================================================

import { useNavigation } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';
import { Pressable } from 'react-native';
import styled, { useTheme } from 'styled-components/native';

import { Text } from '@/components/primitives';

import { AppLogo } from './AppLogo';

// 헤더 높이(px) — Figma TopAppBar. spacing 토큰에 없는 도메인 상수
const HEADER_HEIGHT = 56;
const LOGO_SIZE = 28;
const SETTINGS_ICON_SIZE = 24;

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

export interface AppHeaderProps {
  /** 좌측 타이틀. @default 'LottoStats' */
  title?: string;
}

/**
 * 앱 상단 바. 좌측 로고+타이틀, 우측 설정
 *
 * @example
 * <AppHeader />
 * <AppHeader title="통계" />
 */
export function AppHeader({ title = 'LottoStats' }: AppHeaderProps) {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <Bar>
      <LeftGroup>
        <AppLogo size={LOGO_SIZE} />
        <Text variant="headlineSm">{title}</Text>
      </LeftGroup>
      <Pressable
        onPress={() => navigation.navigate('Settings')}
        accessibilityRole="button"
        accessibilityLabel="설정"
        hitSlop={8}
      >
        <Settings
          size={SETTINGS_ICON_SIZE}
          color={theme.colors.text.secondary}
        />
      </Pressable>
    </Bar>
  );
}
