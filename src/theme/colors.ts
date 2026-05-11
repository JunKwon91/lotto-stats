// ============================================================================
// LottoStats 색상 토큰
// ============================================================================
//
// [개념: 디자인 토큰 (Design Token)]
// "토큰"은 디자인의 최소 단위 값(색상 1개, 간격 1개 등)에 의미 있는
// 이름을 붙인 것이다. 예: '#3B82F6' 대신 'primary.action'.
// 이렇게 하면 코드 어디서든 동일한 이름으로 참조하므로, 나중에
// 색상을 바꿀 때 한 곳만 수정하면 전체에 반영된다.
//
// [개념: 2단계(2-tier) 토큰 구조]
// 이 파일은 토큰을 두 층(layer)으로 나눈다.
//
//   Layer 1: Primitives (원시값)
//     "raw 색상 팔레트". slate-50, slate-900 같이 의미 없는 이름.
//     디자이너가 정한 색상 팔레트 그 자체.
//
//   Layer 2: Semantic (의미 토큰)
//     "역할 기반 별명". text.primary, surface.container 같이
//     "어디에 쓰이는지"를 이름이 말해준다. 값은 Layer 1을 참조한다.
//
// 왜 2단계로 나누는가?
//   - 다크/라이트 모드에서 같은 의미("text.primary")가 다른 원시값을 가리켜야 함
//   - 컴포넌트는 Semantic만 사용 → 모드 전환 시 컴포넌트 코드 수정 불필요
//
// 이 구조는 Figma Variables(file 0YQttqpYf0Bk6dIiVVcnLa)와 1:1로 일치한다.
// Figma에서 디자이너가 토큰 이름·구조를 결정한 뒤, 그 결정을 코드로 그대로 옮긴 것.
// ============================================================================

// ----------------------------------------------------------------------------
// Layer 1: Primitives — 원시 색상 팔레트
// ----------------------------------------------------------------------------
// 이 객체는 외부로 export되지 않는다(파일 안에서만 사용).
// 컴포넌트는 절대 primitives.slate[500] 같이 직접 쓰지 않고,
// 항상 아래의 lightColors / darkColors의 의미 있는 이름을 사용해야 한다.
//
// `as const`의 의미:
//   TypeScript에게 "이 객체는 변하지 않는 readonly 값이며,
//   각 색상 문자열도 '#F8FAFC' 같은 정확한 리터럴 타입으로 좁혀라"라고 지시.
//   (실수로 슬레이트 50을 다른 색으로 덮어쓰는 것을 컴파일러가 막아줌)
const primitives = {
  // slate 계열 — Tailwind CSS의 slate 컬러 스케일을 그대로 채택.
  // 숫자가 작을수록 밝고(50=거의 흰색), 클수록 어둡다(950=거의 검정).
  // 라이트 모드의 배경/표면/텍스트 색상이 모두 여기서 나온다.
  slate: {
    50: '#F8FAFC',  // 가장 밝은 회색 (라이트 모드 배경)
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // 중간 회색 (muted 텍스트)
    600: '#475569',
    700: '#334155',
    800: '#1D2027',
    850: '#191B23', // 850, 950는 Tailwind 표준에 없는 사용자 정의값
    900: '#0F172A', // 가장 어두운 슬레이트 (라이트 모드 본문 텍스트)
    950: '#0B0E15',
  },
  // slateDark 계열 — Material 3 / 디자인 시스템에서 다크 테마용으로
  // 별도 정의한 슬레이트. slate와 색감이 약간 다름(살짝 보라/푸른 톤).
  // 다크 모드의 배경/표면/텍스트 색상이 모두 여기서 나온다.
  slateDark: {
    200: '#E1E2EC', // 다크 모드 본문 텍스트 (밝은 회색)
    300: '#C2C6D6',
    500: '#8C909F',
    700: '#424754',
    780: '#272A31', // 780은 슬레이트 표준 외 값 (다크 컨테이너 high)
    800: '#1D2027', // 다크 컨테이너
    850: '#191B23', // 다크 컨테이너 low
    900: '#10131A', // 다크 모드 캔버스 배경
    950: '#0B0E15',
  },
  // 브랜드 색상 — 앱의 정체성을 나타내는 액센트 색상
  brand: {
    primaryLight: '#3B82F6', // 라이트 모드용 진한 파랑 (Tailwind blue-500)
    primaryDark: '#ADC6FF',  // 다크 모드용 옅은 파랑 (어두운 배경 위에서도 충분한 대비)
    secondary: '#4CD7F6',    // 보조 (시안)
    tertiary: '#FFB786',     // 3차 (살구색, 거의 안 씀)
  },
  // 상태 색상 — 의미가 정해진 색 (모드 무관)
  state: {
    hot: '#EF4444',        // "Hot" 번호 — 자주 출현 (빨강)
    cold: '#06B6D4',       // "Cold" 번호 — 오래 안 나옴 (시안)
    success: '#22C55E',    // 성공/긍정 (초록)
    warning: '#F59E0B',    // 경고 (주황)
    errorLight: '#DC2626', // 에러 — 라이트 모드용 (진한 빨강)
    errorDark: '#FFB4AB',  // 에러 — 다크 모드용 (밝은 살구빨강)
  },
  // 로또 공 색상 — 한국 로또 6/45의 공식 색상 매핑 (모드 무관)
  ball: {
    yellow: '#FBC400', // 1~10번 (노란 공)
    blue: '#69C8F2',   // 11~20번 (파란 공)
    red: '#FF7272',    // 21~30번 (빨간 공)
    gray: '#AAAAAA',   // 31~40번 (회색 공)
    green: '#B0D840',  // 41~45번 (초록 공)
    onLight: '#0F172A', // 노랑/회색/초록 위에 올릴 텍스트 색 (어두운 색)
    onDark: '#FFFFFF',  // 파랑/빨강 위에 올릴 텍스트 색 (흰색)
  },
} as const;

// ----------------------------------------------------------------------------
// 색상 모양(Shape) 인터페이스 정의
// ----------------------------------------------------------------------------
// [개념: interface]
// "이 객체는 이런 키와 이런 타입을 가져야 한다"는 계약(contract)을 정의.
// lightColors와 darkColors가 정확히 같은 구조를 갖도록 강제하기 위함.
//
// [왜 필요한가? — TypeScript의 함정]
// 만약 ColorsShape 없이 lightColors와 darkColors를 그냥 만들면,
// `as const` 때문에 둘은 서로 다른 타입으로 좁혀진다.
// 예) lightColors의 bg.canvas 타입은 '"#F8FAFC"' (정확한 문자열),
//     darkColors의 bg.canvas 타입은 '"#10131A"'.
// 그러면 ThemeProvider에 둘 중 하나만 받을 수 있게 되어 모드 전환이 불가능.
//
// 해결: 둘 다 같은 인터페이스(ColorsShape)를 만족하도록 명시.
// 이러면 두 값 모두 "ColorsShape"라는 동일한 타입으로 취급된다.
// ----------------------------------------------------------------------------
export interface ColorsShape {
  // bg = background. 가장 바깥 캔버스 배경 + Section 영역 배경.
  bg: {
    canvas: string;       // 화면 전체 배경
    sectionMain: string;  // 메인 화면 그룹 배경 (Bottom Tab 영역)
    sectionSub: string;   // 서브 화면 그룹 배경 (Stack 영역)
  };
  // surface = 카드, 패널 등 "들어올린(elevated)" 면.
  // 캔버스(bg) 위에 올라가는 컨텐츠 컨테이너.
  surface: {
    dim: string;          // 가장 어두운 표면 (배경과 거의 동일)
    container: string;    // 표준 카드 배경
    containerLow: string; // 살짝 더 어두운 컨테이너 (헤더 등)
    containerHigh: string;// 강조된 컨테이너 (선택된 항목 등)
  };
  // text = 글자 색상. 4단계 중요도 + 반전(inverse) 변형.
  text: {
    primary: string;          // 본문 (가장 진한 색)
    secondary: string;        // 부제목, 설명
    muted: string;            // 흐릿한 부가 정보
    primaryInverse: string;   // 반전된 primary (반대 모드용)
    secondaryInverse: string; // 반전된 secondary
    // 'inverse'는 "현재 모드와 반대되는 텍스트 색상"을 의미.
    // 예: 라이트 모드에서 일부러 어두운 배경 위에 글자를 올릴 때
    // text.primaryInverse(=밝은 색)를 쓰면 가독성 확보.
  };
  // border = 1px 선 색상.
  border: {
    default: string; // 기본 보더
    subtle: string;  // 매우 흐릿한 구분선
    strong: string;  // 강조된 보더
  };
  // primary = 브랜드 액션 (버튼, 액티브 탭 등).
  primary: {
    action: string;       // 메인 버튼 배경
    onAction: string;     // 메인 버튼 위 글자색
    container: string;    // 더 큰 강조 영역 배경
    onContainer: string;  // 그 위 글자색
  };
  // state = 의미를 가진 상태 색상.
  state: {
    hot: string;
    cold: string;
    success: string;
    warning: string;
    error: string;
  };
  // ball = 로또 공 5색 (모드 무관, primitives.ball을 그대로 참조).
  ball: {
    yellow: string;
    blue: string;
    red: string;
    gray: string;
    green: string;
    onLight: string; // 밝은 공 위 텍스트
    onDark: string;  // 어두운 공 위 텍스트
  };
}

// ----------------------------------------------------------------------------
// Layer 2: Semantic — 라이트 모드 의미 토큰
// ----------------------------------------------------------------------------
// 모든 값은 primitives를 참조한다(직접 hex 코드를 적지 않음 → 일관성 보장).
// 컴포넌트가 사용하는 것은 오직 이 객체.
// 예) <Text style={{ color: theme.colors.text.primary }}>
// ----------------------------------------------------------------------------
export const lightColors: ColorsShape = {
  bg: {
    canvas: primitives.slate[50],         // 거의 흰색 캔버스
    sectionMain: primitives.slateDark[900], // (라이트 모드인데도) 어두운 Section bg
    sectionSub: primitives.slate[950],    //  └ Figma의 모드 swap 의도 — 디자인 시스템 페이지에서
                                          //    같은 페이지 안에 양 모드를 시각화하기 위함
  },
  surface: {
    dim: primitives.slate[100],
    container: primitives.slate[50],      // 카드 = 거의 흰색
    containerLow: primitives.slate[50],
    containerHigh: primitives.slate[100],
  },
  text: {
    primary: primitives.slate[900],       // 진한 슬레이트 (가장 어두움)
    secondary: primitives.slate[700],
    muted: primitives.slate[500],         // 흐릿한 회색
    primaryInverse: primitives.slateDark[200], // 다크 모드 텍스트 색상을 빌려옴
    secondaryInverse: primitives.slateDark[300],
  },
  border: {
    default: primitives.slate[300],
    subtle: primitives.slate[200],
    strong: primitives.slate[400],
  },
  primary: {
    action: primitives.brand.primaryLight, // 진한 파랑 버튼
    onAction: '#FFFFFF',                   // 그 위 흰색 글자
    container: '#DBEAFE',                  // 옅은 파랑 컨테이너
    onContainer: '#1E3A8A',                // 그 위 진한 파랑 글자
  },
  state: {
    hot: primitives.state.hot,
    cold: primitives.state.cold,
    success: primitives.state.success,
    warning: primitives.state.warning,
    error: primitives.state.errorLight, // 라이트 모드는 진한 빨강 사용
  },
  ball: primitives.ball, // 공 색상은 모드와 무관 → 그대로 참조
};

// ----------------------------------------------------------------------------
// Layer 2: Semantic — 다크 모드 의미 토큰
// ----------------------------------------------------------------------------
// 키 구조는 lightColors와 완전히 동일.
// 값만 다크 모드용으로 다르게 매핑.
// 컴포넌트는 같은 키(text.primary 등)를 사용하지만, 모드에 따라
// 결과 색상이 자동으로 바뀐다.
// ----------------------------------------------------------------------------
export const darkColors: ColorsShape = {
  bg: {
    canvas: primitives.slateDark[900],   // 거의 검정 캔버스
    sectionMain: primitives.slate[50],   // (다크 모드인데도) 밝은 Section bg
    sectionSub: primitives.slate[100],   //  └ 위 lightColors의 의도와 동일 (mode swap)
  },
  surface: {
    dim: primitives.slateDark[900],
    container: primitives.slateDark[800],
    containerLow: primitives.slateDark[850],
    containerHigh: primitives.slateDark[780],
  },
  text: {
    primary: primitives.slateDark[200],          // 밝은 회색 (어두운 배경 위에서 가독)
    secondary: primitives.slateDark[300],
    muted: primitives.slateDark[500],
    primaryInverse: primitives.slate[900],       // 라이트 모드 텍스트 색상을 빌려옴
    secondaryInverse: primitives.slate[700],
  },
  border: {
    default: primitives.slateDark[700],
    subtle: primitives.slateDark[780],
    strong: primitives.slateDark[500],
  },
  primary: {
    action: primitives.brand.primaryDark,  // 다크 모드용 옅은 파랑
    onAction: primitives.slate[900],       // 그 위 진한 글자 (대비 확보)
    container: '#4D8EFF',
    onContainer: '#00285D',
  },
  state: {
    hot: primitives.state.hot,
    cold: primitives.state.cold,
    success: primitives.state.success,
    warning: primitives.state.warning,
    error: primitives.state.errorDark, // 다크 모드는 밝은 살구빨강 (가독성)
  },
  ball: primitives.ball,
};

// ----------------------------------------------------------------------------
// 외부에서 사용할 타입 별칭
// ----------------------------------------------------------------------------
// `Colors`라는 이름으로 ColorsShape를 다시 export.
// (다른 파일에서 `import { Colors } from './colors'` 하기 위함)
// ColorsShape를 직접 export 했지만 의미적으로 Colors가 더 직관적이므로
// 별칭(alias)을 하나 더 만들어둔 것.
export type Colors = ColorsShape;
