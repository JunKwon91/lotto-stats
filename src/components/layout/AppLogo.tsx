// ============================================================================
// AppLogo — 앱 아이콘 로고
// ============================================================================
//
// Figma에서 export한 앱 아이콘 SVG를 그대로 렌더한다(react-native-svg-transformer)
// 색은 브랜드 고정값이라 테마 대상이 아니며, 정사각형이므로 size 하나로 크기를 조절한다
// ============================================================================

import type { SvgProps } from 'react-native-svg';

import AppLogoSvg from '@/assets/app-logo.svg';

export interface AppLogoProps extends Omit<SvgProps, 'width' | 'height'> {
  /** 로고 한 변 크기(px) @default 28 */
  size?: number;
}

export function AppLogo({ size = 28, ...props }: AppLogoProps) {
  return <AppLogoSvg width={size} height={size} {...props} />;
}
