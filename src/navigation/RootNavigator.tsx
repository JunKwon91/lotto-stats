// ============================================================================
// RootNavigator — 최상위 Native Stack Navigator
// ============================================================================
// 첫 화면: MainTabs (Bottom Tab Navigator를 하나의 화면처럼 wrap)
// 서브 화면: 회차 상세 / 회차 목록 / 통계 상세 / 즐겨찾기 추가 / 설정
//
// 서브 화면에 진입하면 native stack이 위로 push되며 Bottom Tab은 자동으로 숨음
// (Tab Navigator가 한 화면(MainTabs)으로 처리되기 때문에 push된 화면 뒤에 가려짐).
// ============================================================================

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'styled-components/native';
import MainTabNavigator from './MainTabNavigator';
import RoundDetailScreen from '@/screens/stats/RoundDetailScreen';
import RoundListScreen from '@/screens/stats/RoundListScreen';
import StatsDetailScreen from '@/screens/stats/StatsDetailScreen';
import FavoriteAddScreen from '@/screens/favorites/FavoriteAddScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        // 서브 화면 공통 헤더 스타일
        headerStyle: {
          backgroundColor: theme.colors.bg.canvas,
        },
        headerTitleStyle: {
          color: theme.colors.text.primary,
          fontFamily: theme.typography.headlineSm.fontFamily,
          fontSize: theme.typography.headlineSm.fontSize,
          fontWeight: theme.typography.headlineSm.fontWeight,
        },
        headerTintColor: theme.colors.text.primary, // iOS 뒤로가기 chevron 색
        // iOS 뒤로가기 라벨 숨김 (chevron만 표시)
        headerBackButtonDisplayMode: 'minimal',
        // 그림자/구분선 (iOS는 자동, Android는 elevation 0으로 깔끔하게)
        headerShadowVisible: false,
      }}>
      {/* MainTabs는 Bottom Tab Navigator 자체 — 헤더 없이 풀스크린으로 */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />

      {/* 서브 화면 5개 */}
      <Stack.Screen
        name="RoundDetail"
        component={RoundDetailScreen}
        options={{ title: '회차 상세' }}
      />
      <Stack.Screen
        name="RoundList"
        component={RoundListScreen}
        options={{ title: '회차 목록' }}
      />
      <Stack.Screen
        name="StatsDetail"
        component={StatsDetailScreen}
        options={{ title: '통계 상세' }}
      />
      <Stack.Screen
        name="FavoriteAdd"
        component={FavoriteAddScreen}
        options={{ title: '즐겨찾기 추가' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: '설정' }}
      />
    </Stack.Navigator>
  );
}
