// ============================================================================
// LottoStats 테마 통합 진입점 (entry point)
// ============================================================================
//
// 이 파일이 하는 일:
//   1) 흩어진 토큰 파일들(colors, spacing, typography)을 모은다.
//   2) "테마"라는 하나의 객체로 묶는다(lightTheme / darkTheme).
//   3) 테마 객체의 타입(AppTheme)을 정의해서 컴포넌트가 type-safe하게 사용 가능하게 한다.
//
// [개념: 진입점(barrel file)]
// 이 파일 덕분에 다른 파일에서:
//   import { lightTheme, darkTheme } from './theme';
// 한 줄로 모든 테마를 가져올 수 있다.
// (만약 이 파일이 없다면, 사용처마다 colors.ts, spacing.ts, typography.ts를
// 따로따로 import해서 직접 조립해야 함)
//
// [개념: 테마 객체 패턴]
// styled-components나 React Context로 "현재 어떤 테마인가"를 앱 전체에 전파.
// 컴포넌트는 props.theme.colors.text.primary 형태로 어디서든 토큰에 접근.
// 모드 전환은 단지 ThemeProvider의 theme prop을 lightTheme ↔ darkTheme로
// 바꾸는 것만으로 끝난다 — 컴포넌트 코드는 한 줄도 안 바뀐다.
// ============================================================================

// ----------------------------------------------------------------------------
// 다른 파일에서 토큰 가져오기
// ----------------------------------------------------------------------------
// `type Colors`는 "값이 아닌 타입만 가져온다"는 의미.
// type-only import는 빌드 시 완전히 제거되므로 번들 크기에 영향 없음.
import { lightColors, darkColors, type Colors } from './colors';
import { spacing, radius } from './spacing';
import { typography } from './typography';

// ----------------------------------------------------------------------------
// 모드 타입 — 'light' 또는 'dark' 문자열만 허용
// ----------------------------------------------------------------------------
// [개념: 문자열 리터럴 union 타입]
// 그냥 string 대신 'light' | 'dark'로 좁히면, 코드 어디선가
// theme.mode === 'lite' (오타) 같은 실수를 컴파일러가 잡아준다.
export type ThemeMode = 'light' | 'dark';

// ----------------------------------------------------------------------------
// AppTheme — 테마 객체의 모양(shape) 정의
// ----------------------------------------------------------------------------
// 이 인터페이스가 lightTheme과 darkTheme이 가져야 할 구조를 강제한다.
// 새 키가 한쪽에만 추가되면 다른 쪽에도 추가하라고 컴파일러가 에러를 띄움.
//
// [왜 필요한가? — TypeScript 함정 회피]
// 만약 AppTheme 없이 lightTheme = { mode: 'light' as const, ... }로 만들면,
// mode 타입이 정확히 '"light"'로 좁혀져서 darkTheme과 호환되지 않는다.
// (자세한 내막은 colors.ts의 ColorsShape 설명 참고)
// 해결: AppTheme 인터페이스를 만들고 둘 다 이 타입을 만족하도록 강제.
// ----------------------------------------------------------------------------
export interface AppTheme {
  mode: ThemeMode;             // 현재 테마 모드 ('light' | 'dark')
  colors: Colors;              // 색상 토큰 묶음
  spacing: typeof spacing;     // 간격 토큰 (typeof로 spacing 객체와 같은 구조 강제)
  radius: typeof radius;       // 반경 토큰
  typography: typeof typography; // 글꼴 토큰
}

// ----------------------------------------------------------------------------
// lightTheme — 라이트 모드 테마 객체 (조립 완성품)
// ----------------------------------------------------------------------------
// 이 객체를 ThemeProvider에 넘기면, 그 아래의 모든 컴포넌트가 라이트 모드로 렌더된다.
//
// [개념: 객체 단축 표기 (object shorthand)]
// `colors: lightColors`는 OK.
// `spacing,`는 사실 `spacing: spacing`의 단축 표기 — 키 이름과 변수 이름이
// 같으면 한 번만 쓸 수 있다. (JavaScript ES6 shorthand)
// ----------------------------------------------------------------------------
export const lightTheme: AppTheme = {
  mode: 'light',
  colors: lightColors,
  spacing,    // spacing: spacing 단축 표기
  radius,     // radius: radius 단축 표기
  typography, // typography: typography 단축 표기
};

// ----------------------------------------------------------------------------
// darkTheme — 다크 모드 테마 객체 (조립 완성품)
// ----------------------------------------------------------------------------
// lightTheme과 키 구조가 정확히 동일.
// 차이는 colors만 다크 버전을 사용하고 mode가 'dark'인 것.
// (spacing, radius, typography는 모드와 무관해서 공유)
// ----------------------------------------------------------------------------
export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  radius,
  typography,
};

// ----------------------------------------------------------------------------
// 개별 토큰 재export
// ----------------------------------------------------------------------------
// 보통은 `import { lightTheme } from './theme'`만 쓰면 충분하지만,
// 가끔 색상 팔레트만 따로 쓰고 싶은 경우(예: 차트 라이브러리에 색상 배열 전달)에는
// `import { darkColors } from './theme'`처럼 개별 토큰만 가져올 수 있도록 통로를 열어둠.
// ----------------------------------------------------------------------------
export { lightColors, darkColors, spacing, radius, typography };
