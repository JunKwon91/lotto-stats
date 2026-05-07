// ============================================================================
// styled-components의 DefaultTheme를 LottoStats AppTheme로 확장
// ============================================================================
//
// [이 파일의 역할 — 한 줄 요약]
// styled-components가 제공하는 props.theme의 타입을 AppTheme로 바꿔서,
// 컴포넌트 안에서 ${({ theme }) => theme.colors.text.primary}를 쓸 때
// IDE가 자동완성과 타입 체크를 해주도록 만든다.
//
// [.d.ts 확장자의 의미]
// "TypeScript Declaration File" — 타입 정보만 담는 파일.
// 실제 JavaScript로 컴파일되지 않고, 컴파일러에게 "이런 타입이 있다"고
// 알려주기만 한다. 즉, 런타임 동작에 영향 없음.
//
// [개념: Module Augmentation (모듈 보강/확장)]
// 외부 라이브러리가 export하는 타입에 우리가 새로운 속성을 추가하는 기법.
// styled-components는 자체적으로 `DefaultTheme`라는 빈 인터페이스를 제공한다.
//
//   // styled-components 내부의 정의 (대략):
//   export interface DefaultTheme {}  // 비어있음 — 사용자가 채우라는 의도
//
// 우리가 이 빈 DefaultTheme에 AppTheme의 속성을 "주입"하면,
// 라이브러리 전체가 props.theme을 AppTheme로 인식한다.
// ============================================================================

// ----------------------------------------------------------------------------
// 타입 보강 대상 라이브러리 import
// ----------------------------------------------------------------------------
// 이 import는 "값"을 가져오는 게 아니라 declare module이 작동하기 위한
// 모듈 식별 용도. import만 적어도 TypeScript가 그 모듈을 인식한다.
//
// 두 패키지가 따로 있는 이유:
//   - 'styled-components'        → 웹용 (이 프로젝트에선 안 쓰지만 보강해 둠)
//   - 'styled-components/native' → React Native용 (실제 사용)
import 'styled-components';
import 'styled-components/native';

// AppTheme는 우리가 정의한 테마 객체의 타입.
// type-only import — 실제 코드가 아닌 타입만 가져옴(번들 영향 없음).
import type { AppTheme } from './index';

// ----------------------------------------------------------------------------
// 'styled-components' 모듈의 DefaultTheme 보강
// ----------------------------------------------------------------------------
// [문법 해석]
// declare module 'styled-components' { ... }
//   → "이 코드는 styled-components 모듈에 추가될 타입 정의입니다"
// export interface DefaultTheme extends AppTheme {}
//   → "DefaultTheme라는 인터페이스가 AppTheme의 모든 속성을 상속한다"
//
// 빈 중괄호 {}는 "AppTheme 외에 추가 속성은 없다"는 뜻.
// 결과: DefaultTheme는 사실상 AppTheme와 동일한 타입이 됨.
declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}

// ----------------------------------------------------------------------------
// 'styled-components/native' 모듈의 DefaultTheme 보강
// ----------------------------------------------------------------------------
// React Native 전용 패키지에도 똑같이 보강을 적용.
// 위와 똑같은 작업이지만 모듈 경로만 다름.
//
// [실제 효과 — 코드에서 어떻게 보이는가]
// 이 파일이 없을 때:
//   const Title = styled.Text`
//     color: ${({ theme }) => theme.colors.text.primary}; // ❌ 'theme'에 colors 속성 없음 에러
//   `;
//
// 이 파일이 있을 때:
//   const Title = styled.Text`
//     color: ${({ theme }) => theme.colors.text.primary}; // ✅ 자동완성 + 타입체크 정상
//   `;
declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
