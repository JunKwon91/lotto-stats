// ============================================================================
// LottoStats 네비게이션 타입 정의
// ============================================================================
//
// 이 파일이 하는 일:
//   1) 각 네비게이터의 ParamList(스크린별 파라미터 타입) 정의
//   2) 화면 컴포넌트가 받는 props 타입 export
//   3) 전역 타입 보강 — useNavigation/useRoute가 자동 추론하도록
//
// [개념: ParamList]
// React Navigation의 핵심 타입. "이 네비게이터 안에 어떤 화면들이 있고,
// 각 화면은 어떤 파라미터를 받는가"를 한 객체로 표현.
// 예: navigation.navigate('RoundDetail', { round: 1100 })
//     → 'RoundDetail'이라는 키와 { round: number } 파라미터가 ParamList에 있어야 함.
// ============================================================================

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// ----------------------------------------------------------------------------
// MainTabParamList — Bottom Tab 4개 화면
// ----------------------------------------------------------------------------
// 모든 탭이 파라미터 없음(undefined) — 진입 시 추가 데이터 필요 없음.
// ----------------------------------------------------------------------------
export type MainTabParamList = {
  Home: undefined;
  Statistics: undefined;
  Recommend: undefined;
  Favorites: undefined;
};

// ----------------------------------------------------------------------------
// RootStackParamList — 최상위 Stack (메인 + 서브 5개)
// ----------------------------------------------------------------------------
// MainTabs는 Bottom Tab Navigator 자체가 하나의 화면처럼 들어감.
// NavigatorScreenParams<MainTabParamList>로 감싸야 중첩된 탭의 파라미터까지
// 타입 추론이 동작한다.
// 예: navigation.navigate('MainTabs', { screen: 'Home' })
// ----------------------------------------------------------------------------
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RoundDetail: { round: number };
  RoundList: undefined;
  StatsDetail: { type: 'frequency' | 'pattern' | 'gap' };
  FavoriteAdd: { id?: string } | undefined;
  Settings: undefined;
};

// ----------------------------------------------------------------------------
// 화면 컴포넌트 Props 타입 — 각 화면이 받는 props 모양
// ----------------------------------------------------------------------------
// [개념: Screen Props]
// React Navigation은 라우팅된 컴포넌트에 { navigation, route }를 자동 주입.
// 각 화면마다 navigate가 받을 수 있는 라우트와 route.params 타입이 다르므로
// 화면별로 정확한 타입을 alias로 미리 만들어둠.
//
// 사용 예) function RoundDetailScreen({ route }: RoundDetailScreenProps) {
//           const { round } = route.params; // round는 number로 추론됨
//         }
// ----------------------------------------------------------------------------

// Bottom Tab 화면 props
export type HomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type StatisticsScreenProps = BottomTabScreenProps<MainTabParamList, 'Statistics'>;
export type RecommendScreenProps = BottomTabScreenProps<MainTabParamList, 'Recommend'>;
export type FavoritesScreenProps = BottomTabScreenProps<MainTabParamList, 'Favorites'>;

// Native Stack 화면 props
export type RoundDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'RoundDetail'>;
export type RoundListScreenProps = NativeStackScreenProps<RootStackParamList, 'RoundList'>;
export type StatsDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'StatsDetail'>;
export type FavoriteAddScreenProps = NativeStackScreenProps<RootStackParamList, 'FavoriteAdd'>;
export type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

// ----------------------------------------------------------------------------
// 전역 RootParamList 보강 — useNavigation 자동 추론
// ----------------------------------------------------------------------------
// [개념: Module Augmentation for ReactNavigation]
// useNavigation()을 제네릭 없이 호출했을 때 자동으로 RootStackParamList를
// 추론하도록 전역 namespace를 확장.
//
// 이 보강이 없으면:
//   const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   ↑ 매번 제네릭 명시해야 함
//
// 이 보강이 있으면:
//   const navigation = useNavigation();
//   navigation.navigate('RoundDetail', { round: 1100 }); // 자동 타입체크
// ----------------------------------------------------------------------------
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
