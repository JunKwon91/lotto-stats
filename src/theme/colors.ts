// ============================================================================
// LottoStats 로또 도메인 확장 색상
// ============================================================================
//
// 라이브러리(@junkwon91/rn-design-system)의 ColorsShape를 베이스로 하고,
// 로또 도메인에만 필요한 색만 여기서 정의해 확장한다.
//
// 베이스 토큰(bg / surface / text / border / primary / state.{success,
// warning, error, info} / overlay)은 모두 라이브러리에서 가져온다.
// 본 파일은 라이브러리에 없는 도메인 토큰만 보관:
//   - state.hot / state.cold — DataTable trend 컬럼 등 "최근 빈도" 시각화
//   - ball.* — 한국 로또 6/45 공식 공 색상(번호대별)
//
// 정합 본문은 src/theme/index.ts 에서 처리(라이브러리 lightTheme/darkTheme를
// 스프레드하고 여기 토큰을 colors.state·colors.ball에 얹는다).
// ============================================================================

// 로또 state 확장 — 라이브러리 state(success/warning/error/info)에 추가되는 키.
// 모드 무관(라이트·다크 동일 hex).
export const lottoStateExtension = {
  hot: '#EF4444', // "Hot" 번호 — 자주 출현 (빨강)
  cold: '#06B6D4', // "Cold" 번호 — 오래 안 나옴 (시안)
} as const;

// 로또 공 색상 — 한국 로또 6/45의 공식 색상 매핑 (모드 무관).
//   1~10: yellow / 11~20: blue / 21~30: red / 31~40: gray / 41~45: green
//   onLight / onDark: 공 위에 올릴 텍스트 색
export const lottoBallColors = {
  yellow: '#FBC400',
  blue: '#69C8F2',
  red: '#FF7272',
  gray: '#AAAAAA',
  green: '#B0D840',
  onLight: '#0F172A',
  onDark: '#FFFFFF',
} as const;
