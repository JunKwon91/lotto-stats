// ============================================================================
// LottoStats 타이포그래피(글꼴) 토큰
// ============================================================================
//
// [개념: 타이포그래피 스케일 (Type Scale)]
// 화면에 쓰이는 글자 크기/굵기/줄간격을 미리 몇 개 "스타일 묶음"으로
// 정의해두고, 컴포넌트는 이 묶음 중 하나를 선택해서 쓴다.
// 자유롭게 쓰면 "16px과 17px이 섞이거나, 굵기가 들쭉날쭉" 해진다.
//
// [폰트 페어링: Manrope + Inter]
//   - Manrope: 기하학적, 모던한 느낌 → 큰 제목과 로또 공 숫자에 사용
//   - Inter:  가독성 최고 → 본문, 라벨, 작은 텍스트에 사용
//
// [중요: 폰트 파일 링크 필요]
// 아래 fontFamily에 'Manrope', 'Inter'를 적었지만, 폰트 .ttf 파일을
// iOS와 Android에 별도로 링크하지 않으면 렌더되지 않는다.
//   - iOS: Info.plist의 UIAppFonts 항목 + Resources에 .ttf 추가
//   - Android: android/app/src/main/assets/fonts/ 에 .ttf 복사
//   - react-native.config.js에 assets 경로 명시
// 폰트 링크는 후속 작업으로 처리 예정. 현재는 시스템 기본 폰트로 fallback.
//
// [개념: 'as const' on string literals]
// fontWeight: '700' as const 처럼 명시적으로 좁히는 이유는 React Native의
// fontWeight 타입이 좁은 union ('100' | '200' | ... | 'normal' | 'bold')이기
// 때문. 그냥 '700'이라고 쓰면 string으로 추론되어 타입 불일치 에러 발생.
// ============================================================================

// ----------------------------------------------------------------------------
// typography — 6가지 글꼴 스타일 묶음
// ----------------------------------------------------------------------------
// 각 스타일은 React Native의 TextStyle과 호환되도록 구성:
//   { fontFamily, fontSize, fontWeight, lineHeight, ... }
// 사용 예) <Text style={theme.typography.displayLg}>제목</Text>
// ----------------------------------------------------------------------------
export const typography = {
  // displayLg — 가장 큰 표시용 텍스트 (메인 페이지 타이틀)
  // 예: "LottoStats" 앱 진입 화면 큰 글씨
  displayLg: {
    fontFamily: 'Manrope',
    fontSize: 32, // px 단위 (RN은 단위 없는 숫자)
    fontWeight: '700' as const, // bold (700 = bold)
    lineHeight: 38, // 줄 간격 (보통 fontSize * 1.2 정도)
  },

  // headlineMd — 중간 크기 헤드라인 (카드 제목, 섹션 헤더)
  // 예: "최근 회차", "Hot 번호" 등
  headlineMd: {
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '600' as const, // semi-bold (600)
    lineHeight: 28,
  },

  // headlineSm — 작은 헤드라인 (Stack Navigator 헤더 타이틀)
  // headlineMd보다 한 단계 작음, 네비게이션 헤더용
  headlineSm: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // bodyBase — 기본 본문 텍스트
  // 예: 설명 단락, 카드 내부 본문
  bodyBase: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const, // regular (400)
    lineHeight: 24,
  },

  // bodySm — 작은 본문 (보조 정보, 데이터 테이블 셀 값)
  bodySm: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // labelSm — 작은 라벨 (Bottom Tab 라벨, 작은 버튼 텍스트)
  // labelCaps와 달리 대문자 변환 없음 — 한글 라벨에 적합
  labelSm: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 14,
  },

  // labelCaps — 대문자 라벨 (테이블 헤더, 카테고리 태그)
  // 예: "NUMBER", "FREQ", "TREND" 같은 컬럼 헤더
  labelCaps: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.6, // 자간 — 대문자 텍스트는 살짝 벌리면 가독성↑
    textTransform: 'uppercase' as const, // 자동으로 대문자로 변환
    // textTransform도 좁은 union 타입이라 'as const' 필요
  },

  // ballNumber — 로또 공 위에 올라가는 숫자 전용 스타일
  // 작은 원 안에 중앙 정렬되도록 lineHeight를 fontSize와 동일하게 설정
  // (lineHeight가 크면 글자가 위쪽으로 치우쳐 보임)
  ballNumber: {
    fontFamily: 'Manrope',
    fontSize: 15,
    fontWeight: '700' as const,
    lineHeight: 15, // fontSize와 동일 → 정확한 중앙 정렬
  },
} as const;

// ----------------------------------------------------------------------------
// Typography 타입 export — 다른 파일에서 typography 객체 모양을 참조할 때
// ----------------------------------------------------------------------------
// 예) function styledText(t: Typography['displayLg']) { ... }
//     → displayLg 스타일과 같은 모양의 객체만 받음
export type Typography = typeof typography;
