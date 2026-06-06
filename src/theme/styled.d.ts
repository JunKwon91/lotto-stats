// ============================================================================
// styled-components DefaultTheme를 LottoTheme로 확장
// ============================================================================
//
// 라이브러리(@junkwon91/rn-design-system)는 DefaultTheme를 augmentation하지
// 않는다(ADR-39) — AppTheme/Colors 타입만 export한다. 본 파일이 styled의
// DefaultTheme를 LottoTheme(라이브러리 AppTheme + colors 확장)로 확장하는
// 유일한 augmentation이며, 그래서 declaration merging 단일 슬롯 충돌이 없다.
//
// LottoTheme이 AppTheme를 omit/extends한 형태라 colors가 라이브러리 Colors →
// LottoColors로 자연스럽게 좁아진다(state.hot/cold, ball 사용 가능).
// ============================================================================

import 'styled-components';
import 'styled-components/native';

import type { LottoTheme } from './index';

declare module 'styled-components' {
  export interface DefaultTheme extends LottoTheme {}
}

declare module 'styled-components/native' {
  export interface DefaultTheme extends LottoTheme {}
}
