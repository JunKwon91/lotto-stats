// ============================================================================
// Screen — 화면 최상위 컨테이너
// ============================================================================
//
// 모든 화면의 root 컴포넌트. SafeAreaInsets 자동 처리, 표준 padding 적용,
// 배경색 설정, ScrollView 옵션을 일관되게 제공.
//
// 사용 예:
//   // 헤더 없는 BottomTab 화면 (Home/Stats/Recommend/Favorites)
//   <Screen>
//     <Text variant="displayLg">홈</Text>
//   </Screen>
//
//   // 헤더 있는 Stack 화면 (RoundDetail/RoundList/.../Settings)
//   // top은 헤더가 이미 처리하므로 빼야 한다.
//   <Screen edges={[]} scroll>
//     <DetailContent />
//   </Screen>
//
//   // 풀블리드 화면 (좌우 padding 없음, 이미지 등)
//   <Screen padded={false}>
//     <HeroImage />
//   </Screen>
//
// [디자인 토큰]
// 배경: theme.colors.bg.{canvas|sectionMain|sectionSub}
// 좌우 padding: theme.spacing.containerMargin (16)
// 상하 padding: SafeAreaInsets
//
// [edges 가이드 — 화면 유형별]
//   헤더 없는 BottomTab 화면 (Tab Navigator + headerShown:false):
//     → 기본값 ['top'] 그대로. <Screen>...
//
//   헤더 있는 Stack 화면 (Stack Navigator + options.title):
//     → Stack 헤더가 이미 top SafeArea를 처리.
//     → 추가 처리 불필요하면 edges={[]}
//     → 하단 home indicator도 피하려면 edges={['bottom']}
//
//   모달/풀스크린 시트 (헤더 없는 modal presentation):
//     → edges={['top', 'bottom']}
//
//   ⚠️ Stack 헤더가 있는 화면에서 기본값 그대로 두면 헤더 아래에 status bar
//      높이만큼 불필요한 공백이 생긴다(SafeArea 이중 적용).
// ============================================================================

import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

export type ScreenEdge =
  /** 상단 (status bar / 노치 / Dynamic Island) */
  | 'top'
  /** 하단 (홈 인디케이터) */
  | 'bottom'
  /** 좌측 (랜드스케이프 노치) */
  | 'left'
  /** 우측 (랜드스케이프 노치) */
  | 'right';

export type ScreenBackground =
  /** bg.canvas · 표준 화면 배경 */
  | 'canvas'
  /** bg.sectionMain · 메인 섹션 강조 배경 */
  | 'sectionMain'
  /** bg.sectionSub · 서브 섹션 배경 */
  | 'sectionSub';

export interface ScreenProps {
  /**
   * SafeArea를 적용할 가장자리 목록.
   *
   * 화면 유형별 권장값:
   * - 헤더 없는 BottomTab 화면: `['top']` (기본값)
   * - 헤더 있는 Stack 화면: `[]` 또는 `['bottom']`
   *   (헤더가 top을 처리. 기본값 그대로 두면 status bar만큼 공백 발생)
   * - 모달/풀스크린 시트: `['top', 'bottom']`
   *
   * @default ['top']
   */
  edges?: ScreenEdge[];
  /**
   * true면 ScrollView로 감싼다.
   * @default false
   */
  scroll?: boolean;
  /**
   * true면 좌우에 theme.spacing.containerMargin(16) 자동 적용.
   * 풀블리드 컨텐츠는 false.
   * @default true
   */
  padded?: boolean;
  /**
   * 배경색 토큰 — theme.colors.bg.* 매핑.
   * @default 'canvas'
   */
  background?: ScreenBackground;
  /** scroll=true일 때 ScrollView contentContainerStyle override. */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** 외부 컨테이너에 적용할 추가 스타일. */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * 화면 최상위 컨테이너. SafeArea, 표준 padding, 배경색, scroll 옵션을 일관 제공.
 *
 * @example
 * // 헤더 없는 BottomTab 화면 — 기본값 ['top'] 사용
 * <Screen><HomeContent /></Screen>
 *
 * @example
 * // 헤더 있는 Stack 화면 — top은 헤더가 처리하므로 빼야 함
 * <Screen edges={[]} scroll>
 *   <DetailContent />
 * </Screen>
 *
 * @example
 * // 모달/풀스크린 시트 — 상하 모두 SafeArea
 * <Screen edges={['top', 'bottom']} scroll>
 *   <ModalContent />
 * </Screen>
 *
 * @example
 * // 풀블리드 (좌우 padding 없음)
 * <Screen padded={false}><HeroImage /></Screen>
 */
export default function Screen({
  edges = ['top'],
  scroll = false,
  padded = true,
  background = 'canvas',
  contentContainerStyle,
  style,
  children,
}: ScreenProps) {
  const theme = useTheme();
  const horizontalPadding = padded ? theme.spacing.containerMargin : 0;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.bg[background],
  };

  return (
    <SafeAreaView edges={edges} style={containerStyle}>
      {scroll ? (
        <ScrollView
          style={style}
          contentContainerStyle={[
            { paddingHorizontal: horizontalPadding },
            contentContainerStyle,
          ]}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[{ flex: 1, paddingHorizontal: horizontalPadding }, style]}
        >
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}
