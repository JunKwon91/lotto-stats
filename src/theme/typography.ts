// ============================================================================
// LottoStats 로또 도메인 확장 타이포그래피
// ============================================================================
//
// 라이브러리(@junkwon91/rn-design-system)의 typography 토큰을 베이스로 하고,
// 라이브러리에 없는 로또 도메인 전용 타이포만 여기서 정의해 확장한다.
//
// displayLg / headlineMd / bodyBase / labelCaps / numericMd 등 공통 토큰은
// 모두 라이브러리에서 가져온다(중복 정의하지 않음). 본 파일은 라이브러리에
// 없는 도메인 토큰만 보관:
//   - ballNumber — 로또 공 안에 중앙 정렬되는 숫자. lineHeight를 fontSize와
//     동일하게 둬 원 안에서 정확한 수직 중앙 정렬을 얻는다.
//
// 정합 본문은 src/theme/index.ts 에서 처리(라이브러리 typography를 스프레드하고
// 여기 토큰을 얹는다). colors.ts(도메인 색)와 대칭 구조.
// ============================================================================

export const lottoTypographyExtension = {
  ballNumber: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 15,
  },
} as const;
