// ============================================================================
// Screen — 화면 최상위 컨테이너
// ============================================================================
//
// 모든 화면의 root 컴포넌트. SafeAreaInsets 자동 처리, 표준 padding 적용,
// 배경색 설정, ScrollView 옵션을 일관되게 제공.
//
// 사용 예:
//   // BottomTab 화면 (하단은 react-navigation이 처리)
//   <Screen>
//     <Text variant="displayLg">홈</Text>
//   </Screen>
//
//   // Stack 화면 (상하 SafeArea + 스크롤)
//   <Screen edges={['top', 'bottom']} scroll>
//     <RoundDetail />
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
// [edges 가이드]
//   - BottomTab 화면: ['top'] (하단은 react-navigation의 BottomTab이 처리)
//   - Stack 화면:    ['top', 'bottom']
//   - 모달:          ['top', 'bottom']
//
// [Figma 추론 근거]
// Screens 페이지의 모든 화면이 일관된 표준 사용:
//   - 전체 폭 390px, 좌우 padding 16
//   - TopAppBar 56 + Main + BottomNav 64
//   - 배경 bg.canvas
//
// dedicated Figma 컴포넌트는 없지만 위 패턴이 명확하므로 코드로 추론 구현.
// TopAppBar는 화면별 자유 구현 (Screen 책임 외).
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
 * // BottomTab 화면 (하단은 react-navigation이 처리)
 * <Screen><HomeContent /></Screen>
 *
 * @example
 * // Stack 화면 + 스크롤
 * <Screen edges={['top', 'bottom']} scroll>
 *   <DetailContent />
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
