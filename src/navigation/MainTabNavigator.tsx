// ============================================================================
// MainTabNavigator — 메인 4개 화면을 묶는 Bottom Tab Navigator
// ============================================================================
// 탭 구성: 홈 / 통계 / 추천 / 즐겨찾기
// 각 탭은 RootNavigator의 'MainTabs' 항목으로 호출됨.
// 이 컴포넌트 자체에는 헤더가 없음 (headerShown: false).
//   서브 화면 진입 시 RootStack의 헤더가 표시됨.
//
// [중요: tabBarIcon 함수는 컴포넌트 외부에 선언]
// 만약 screenOptions 내부에 inline으로 ({color}) => <Icon />를 적으면
// MainTabNavigator의 매 렌더마다 새 함수가 만들어져 ESLint
// (react/no-unstable-nested-components)가 경고를 띄움.
// 외부에 안정적으로 선언하면 참조가 고정되어 경고가 사라짐.
// ============================================================================

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useTheme } from 'styled-components/native';
import { BarChart3, Home, Sparkles, Star } from 'lucide-react-native';
import HomeScreen from '@/screens/home/HomeScreen';
import StatisticsScreen from '@/screens/stats/StatisticsScreen';
import RecommendScreen from '@/screens/recommend/RecommendScreen';
import FavoritesScreen from '@/screens/favorites/FavoritesScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICON_SIZE = 24;

// ----------------------------------------------------------------------------
// 아이콘 렌더 함수들 — 컴포넌트 외부에 선언 (안정적 참조 보장)
// ----------------------------------------------------------------------------
// React Navigation은 tabBarIcon에 { focused, color, size } props를 전달.
// 우리는 color와 size만 사용. (focused는 color로 이미 반영됨)
//
// BottomTabNavigationOptions['tabBarIcon']은 함수 시그니처를 반환하는 옵셔널 타입.
// NonNullable로 감싸 undefined 케이스를 제외하고 타입을 단순화.
// ----------------------------------------------------------------------------
type TabIconRenderer = NonNullable<BottomTabNavigationOptions['tabBarIcon']>;

const renderHomeIcon: TabIconRenderer = ({ color }) => (
  <Home color={color} size={ICON_SIZE} />
);

const renderStatisticsIcon: TabIconRenderer = ({ color }) => (
  <BarChart3 color={color} size={ICON_SIZE} />
);

const renderRecommendIcon: TabIconRenderer = ({ color }) => (
  <Sparkles color={color} size={ICON_SIZE} />
);

const renderFavoritesIcon: TabIconRenderer = ({ color }) => (
  <Star color={color} size={ICON_SIZE} />
);

// ----------------------------------------------------------------------------
// MainTabNavigator
// ----------------------------------------------------------------------------
export default function MainTabNavigator() {
  // theme를 컴포넌트 내부에서 가져와 screenOptions에 주입.
  // ThemeProvider 아래에 위치하므로 항상 현재 모드(light/dark) 테마가 들어옴.
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        // 헤더는 RootStack에서 처리 → 여기서는 숨김
        headerShown: false,
        // 활성/비활성 색상
        tabBarActiveTintColor: theme.colors.primary.action,
        tabBarInactiveTintColor: theme.colors.text.muted,
        // 탭바 컨테이너 스타일
        tabBarStyle: {
          backgroundColor: theme.colors.surface.container,
          borderTopWidth: 0,
        },
        // 라벨 스타일
        tabBarLabelStyle: {
          fontFamily: theme.typography.labelSm.fontFamily,
          fontSize: theme.typography.labelSm.fontSize,
          fontWeight: theme.typography.labelSm.fontWeight,
        },
      }}
    >
      <Tab.Screen
        name={'Home'}
        component={HomeScreen}
        options={{ tabBarLabel: '홈', tabBarIcon: renderHomeIcon }}
      />
      <Tab.Screen
        name={'Statistics'}
        component={StatisticsScreen}
        options={{ tabBarLabel: '통계', tabBarIcon: renderStatisticsIcon }}
      />
      <Tab.Screen
        name={'Recommend'}
        component={RecommendScreen}
        options={{ tabBarLabel: '추천', tabBarIcon: renderRecommendIcon }}
      />
      <Tab.Screen
        name={'Favorites'}
        component={FavoritesScreen}
        options={{ tabBarLabel: '즐겨찾기', tabBarIcon: renderFavoritesIcon }}
      />
    </Tab.Navigator>
  );
}
