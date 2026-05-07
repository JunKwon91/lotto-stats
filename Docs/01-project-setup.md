# LottoStats 프로젝트 셋업 기록

> 이 문서는 블로그 글 작성을 위한 1차 자료입니다. 시간순 작업 내역, 마주한 이슈, 해결 과정, 최종 결정 사항을 사실 그대로 정리합니다.

---

## 0. 프로젝트 개요

### 정체성

- **이름**: LottoStats
- **장르**: 한국 로또 6/45 통계 분석·번호 추천 앱
- **핵심 메시지**: "당첨 예측 앱"이 아닌 **"통계 분석 도구"**
  - 로또 6/45는 수학적으로 예측 불가능 (각 회차 독립 사건, 1등 확률 1/8,145,060)
  - 데이터로 정직하게 말하는 앱

### 화면 구조 (계획)

- **메인 (Bottom Tab)**: Home / Statistics / Recommend / Favorites
- **서브 (Stack)**: Round Detail / Round List / Stats Detail / Favorite Add / Settings

### 추천 알고리즘 5종

1. **Hot** — 자주 나온 번호
2. **Cold** — 오래 안 나온 번호
3. **Pattern** — 통계 패턴 기반
4. **Balanced** — Hot + Cold 균형
5. **Random** — 완전 무작위

### 데이터 소스

동행복권 공식 API (회차별 당첨 번호)

---

## 1. 사전 작업: Figma 디자인 시스템 (선행 단계)

본격적인 RN 셋업 이전에 **Figma에서 디자인 시스템 전체를 먼저 구축**한 상태였습니다. 이는 디자인 토큰을 코드와 1:1로 매칭시키기 위한 의도된 순서입니다.

### Figma 작업 요약 (file `0YQttqpYf0Bk6dIiVVcnLa`)

- **Variables**: Color collection (Light/Dark 2 modes, 46 semantic vars), Spacing (13), Radius (6), Primitives (66, slate scale 포함)
- **Text Styles**: display-lg, headline-md, body-base, body-sm, label-caps, ball-number
- **Components**: Lottery Ball (10 variants, 색상 범위별), Card (4), Button (12), Input (4), Bottom Nav, Data Table, Settings Row, Segmented Control, Search Input
- **Icons**: Lucide 25+ + AlgorithmIcon 5 + ActionIcon 2 (모두 변수 바인딩)
- **Screens**: 9개 모바일 화면 (Home, Statistics, Recommend, Round Detail, Favorites, Round List, Stats Detail, Favorite Add, Settings)
- **Sections**: 메인/서브 화면 그룹화 + Light/Dark 모드 명시적 적용

### 주요 시행착오 기록 (블로그 별도 챕터로 활용 가능)

- **Section 배경 swap**: 라이트/다크 모드의 Section bg를 의도적으로 반전 → 동일한 페이지에서 양 모드를 시각화
- **Inverse 텍스트 변수 도입**: swapped Section bg 위 텍스트 가독성 위해 `text/primary-inverse`, `text/secondary-inverse` 신설
- **데모 컴포넌트 가시성 문제**: 디자인 시스템 페이지의 COMPONENT_SET들이 transparent → swapped Section bg와 같은 색의 텍스트가 보이지 않음. **해결**: 모든 COMPONENT_SET 래퍼에 `surface/container` fill 추가 (Card, Button, Input, Settings Row, Segmented Control, Search Input, Data Table, Icons 그리드)

### 이 단계의 교훈

> **디자인 시스템을 코드보다 먼저 구축하면 토큰 이름·구조가 결정되어 있어, 이후 RN theme 작성 시 1:1 매칭이 가능하다.**

---

## 2. RN 버전 결정: 0.76 → 0.81 (중요 의사결정)

### 초기 계획: RN 0.76

처음에는 RN 0.76을 사용하기로 했으나, 다음 두 제약이 발견됨:

#### 제약 1: Android 16KB 페이지 크기 의무화

- **2025년 11월 1일부터** Google Play 신규/업데이트 앱은 Android 15의 16KB 페이지 크기를 의무 지원해야 함
- RN 0.76: 16KB 페이지 미지원 → **Google Play 출시 불가**
- RN 0.78+: 완전 지원

#### 제약 2: 라이브러리 생태계 비호환 (2026년 5월 기준)

| 라이브러리 | peer 요구사항 | RN 0.76 |
|----------|-------------|---------|
| `react-native-reanimated@4.3.0` | RN "0.81 - 0.85" | ❌ 설치 불가 |
| `victory-native@41` + `@shopify/react-native-skia@2` | React 19 | ❌ React 18 |
| `react-native-mmkv@4` | NitroModules (RN 0.78+) | ❌ |
| `react-native-screens@4` + `@react-navigation@7` | RN 0.78+ | ❌ codegen 실패 |

### 분석 → RN 0.81로 결정

| 항목 | RN 0.78 | RN 0.81 |
|------|---------|---------|
| React | 18.3 | **19.x** ← victory-native 41 / skia 2 요구 충족 |
| Reanimated 4 peer "0.81-0.85" | ❌ 미충족 | ✅ |
| Android 16KB | ✅ | ✅ |
| Xcode 16.2 호환 | ✅ | ✅ |

**최종 선택: RN 0.81.0**

이유:
1. Reanimated 4 명시적 지원 범위 첫 버전 (0.81-0.85)
2. React 19로 victory-native 41 + skia 2 정상 동작
3. NitroModules 완전 지원 (mmkv 4)
4. 약 7개월 성숙 — 충분히 안정적
5. Android 16KB 페이지 완전 지원

> **블로그 핵심 메시지**: "RN 버전 결정은 단순히 최신을 쓰는 게 아니라, 사용할 라이브러리의 peer dep와 출시 정책(Google Play 16KB)을 역산해서 결정해야 한다."

---

## 3. 폴더 구조 결정 (Option B)

기존 `/Users/nangko/Desktop/RN_Project/NangKo/lotto/` 폴더에 `DESIGN.md`(7.6KB)가 이미 존재했음.

### 두 옵션 비교

| | Option A (lotto = RN root) | Option B (lotto/LottoStats/) ✓ |
|--|---|---|
| 결과 | `/lotto/package.json` | `/lotto/LottoStats/package.json` |
| 폴더 깊이 | 얕음 | +1단계 |
| DESIGN.md 처리 | 백업/복원 필요 | 그대로 유지 |
| 안전성 | 백업 누락 위험 | 무손실 |

**선택: Option B** — 기존 자산(DESIGN.md) 무손실 보존이 우선.

```
/Users/nangko/Desktop/RN_Project/NangKo/lotto/
  ├── DESIGN.md            # Figma 작업 산물 (보존)
  └── LottoStats/          # RN 프로젝트 루트
      ├── App.tsx
      ├── package.json
      ├── src/
      ├── ios/
      ├── android/
      └── Docs/            # 이 문서가 위치
```

---

## 4. 의존성 설치 (이슈 누적과 해결)

### 4.1 RN 0.81 프로젝트 생성

```bash
cd /Users/nangko/Desktop/RN_Project/NangKo/lotto
npx @react-native-community/cli@latest init LottoStats --version 0.81.0 --skip-install
```

→ React 19.1.0 + RN 0.81.0 + TypeScript 템플릿 생성 확인.

### 4.2 의존성 설치 (단계별)

```bash
npm install                                    # 기본 RN deps
npm install zustand @tanstack/react-query axios react-native-mmkv styled-components
npm install --save-dev @types/styled-components @types/styled-components-react-native
npm install react-native-reanimated react-native-gesture-handler @shopify/flash-list
npm install victory-native @shopify/react-native-skia react-native-svg
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install lucide-react-native date-fns
```

### 4.3 iOS Pod Install — 3차례의 누적 이슈

iOS pod install 과정에서 **세 단계의 별도 이슈**를 차례로 만났습니다. 각각이 RN 4.x 시대의 새로운 의존성 모델을 보여줍니다.

#### 이슈 1: `NitroModules` pod 누락

```
[!] Unable to find a specification for `NitroModules` depended upon by `NitroMmkv`
```

**원인**: `react-native-mmkv@4.x`부터 [NitroModules](https://github.com/mrousavy/nitro) 기반으로 재작성됨. NitroModules는 별도 npm 패키지(`react-native-nitro-modules`)로 명시 설치 필요.

**해결**:
```bash
npm install react-native-nitro-modules
```

#### 이슈 2: `RNWorklets` pod 누락

```
[!] Unable to find a specification for `RNWorklets` depended upon by `RNReanimated`
```

**원인**: Reanimated 4부터 worklet 런타임이 별도 패키지로 분리됨. babel plugin도 변경:
- Reanimated 3: `react-native-reanimated/plugin`
- Reanimated 4: `react-native-worklets/plugin`

**해결**:
```bash
npm install react-native-worklets
```

`babel.config.js`:
```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets/plugin',
  ],
};
```

#### 이슈 3: `MMKVCore` 버전 불일치

```
[!] CocoaPods could not find compatible versions for pod "MMKVCore":
  NitroMmkv (from `../node_modules/react-native-mmkv`) was resolved to 4.3.1, which depends on
    MMKVCore (= 2.4.0)
```

**원인**: 로컬 CocoaPods spec repo가 오래되어 MMKVCore 2.4.0 podspec이 없음.

**해결**:
```bash
bundle exec pod install --repo-update
```

→ **82 pods 설치 완료**, "🔥 Your app is boosted by nitro modules!" 메시지 확인.

### 4.4 iOS 첫 빌드 시 4번째 이슈: Xcode 16.2 + CxxStdlib

`npm run ios` 실행 시 다음 에러:

```
error: compiling for iOS 15.1, but module 'CxxStdlib' has a minimum
deployment target of iOS 16.0
xcodebuild exited with error code 65
```

**원인**:
- Xcode 16.2가 ship하는 Swift toolchain의 `CxxStdlib` 모듈이 iOS 16.0+ 최소 배포 타겟 요구
- RN 0.81 기본값은 iOS 15.1
- 둘 사이에 충돌

**해결 (3개 파일 수정)**:

1. `ios/Podfile`:
```diff
- platform :ios, min_ios_version_supported
+ platform :ios, '16.0'
```

2. `ios/Podfile` `post_install` hook (모든 pod target 강제 적용):
```ruby
post_install do |installer|
  react_native_post_install(installer, config[:reactNativePath], :mac_catalyst_enabled => false)
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
    end
  end
end
```

3. `ios/LottoStats.xcodeproj/project.pbxproj`:
```diff
- IPHONEOS_DEPLOYMENT_TARGET = 15.1;
+ IPHONEOS_DEPLOYMENT_TARGET = 16.0;
```
(4개 configuration 모두 변경)

**왜 post_install hook이 필요한가**: Podfile의 `platform :ios, '16.0'`만으로는 부족. RN의 `react_native_post_install`이 일부 pod target의 deployment target을 자기 기본값(15.1)으로 되돌려놓기 때문. 따라서 그 직후에 다시 16.0으로 강제 설정하는 hook이 필수.

**검증**: `xcodebuild ... build` → **BUILD SUCCEEDED**.

> **블로그 인사이트**: "iOS 빌드 실패 시 `error code 65`만 보고 끝나면 안 된다. xcodebuild를 직접 실행해 실제 메시지를 확인해야 한다. RN 0.81 + Xcode 16.2 조합은 deployment target을 16.0으로 명시적 상향이 필수."

### 4.5 Android 빌드

USB 디버깅 인증 후 `npm run android` → **빌드 성공**, iOS와 동일한 화면 출력 확인.

> **무선 연결 시도 시 만난 이슈** (블로그 saidbar로 활용 가능):
> - `adb connect 192.168.0.8:5555` → "No route to host"
> - 진단: `nc -z -G 2 192.168.0.8 5555` → CLOSED/FILTERED
> - 원인: Android 11+에서 5555 포트는 기본 닫혀있음. **무선 디버깅(Wireless Debugging)** 옵션을 켜고 페어링 코드로 `adb pair` 해야 함
> - 우선 USB 빌드로 검증 → 무선은 후속 단계

---

## 5. 최종 의존성 매트릭스

### `package.json` 핵심 의존성

| 카테고리 | 패키지 | 버전 | 역할 |
|---------|------|------|------|
| **Framework** | react-native | 0.81.0 | RN |
| | react | 19.1.0 | (자동) |
| | react-native-nitro-modules | latest | mmkv 4 의존 |
| | react-native-worklets | latest | reanimated 4 의존 |
| **State** | zustand | ^5.0 | 클라이언트 UI 상태 |
| | @tanstack/react-query | ^5.100 | 서버 상태/캐싱 |
| **Storage** | react-native-mmkv | ^4.3 | KV 저장소 (NitroModules 기반) |
| **HTTP** | axios | ^1.16 | 동행복권 API 호출 |
| **Style** | styled-components | ^6.4 | CSS-in-JS |
| **Animation** | react-native-reanimated | ^4.3 | 워클릿 애니메이션 |
| | react-native-gesture-handler | ^2.31 | 제스처 |
| **List** | @shopify/flash-list | ^2.3 | 고성능 리스트 |
| **Chart** | victory-native | ^41.20 | 차트 (Skia 기반) |
| | @shopify/react-native-skia | ^2.6 | 그래픽 엔진 |
| | react-native-svg | ^15.15 | SVG |
| **Navigation** | @react-navigation/native | ^7.2 | |
| | @react-navigation/native-stack | ^7.14 | Stack |
| | @react-navigation/bottom-tabs | ^7.15 | Tab |
| | react-native-screens | ^4.24 | Native screens |
| | react-native-safe-area-context | ^5.7 | Safe area |
| **Icons** | lucide-react-native | ^1.14 | 아이콘 |
| **Utils** | date-fns | ^4.1 | 날짜 |

---

## 6. 폴더 구조

```bash
mkdir -p src/{api,hooks,stores,screens,components,utils,types,storage,theme,navigation}
mkdir -p src/hooks/queries
mkdir -p src/screens/{home,stats,recommend,favorites,settings}
mkdir -p src/components/charts
mkdir -p src/utils/algorithms
```

```
src/
├── api/                  # 동행복권 API 클라이언트
├── hooks/
│   └── queries/          # react-query 훅
├── stores/               # zustand store
├── screens/
│   ├── home/
│   ├── stats/
│   ├── recommend/
│   ├── favorites/
│   └── settings/
├── components/
│   └── charts/           # victory-native 차트 래퍼
├── utils/
│   └── algorithms/       # 5종 추천 알고리즘
├── types/
├── storage/              # MMKV wrapper
├── theme/                # 디자인 토큰
└── navigation/           # navigators
```

---

## 7. Theme 시스템 — Figma Variables 1:1 이식

### 의도

Figma의 Color Variables(Light/Dark 2 modes, 46 semantic vars)를 코드로 그대로 이식. 디자이너가 Figma에서 변경한 토큰 이름·구조가 코드와 일치해야 함.

### 5개 파일 구성

| 파일 | 역할 |
|------|------|
| `src/theme/colors.ts` | Primitives (slate scale) + lightColors/darkColors semantic |
| `src/theme/spacing.ts` | 4px 기반 spacing scale + radius |
| `src/theme/typography.ts` | Manrope/Inter typography 토큰 |
| `src/theme/index.ts` | lightTheme/darkTheme export + AppTheme 인터페이스 |
| `src/theme/styled.d.ts` | styled-components `DefaultTheme` 확장 |

### 색상 토큰 구조 (2-tier)

```
Primitives (raw values)        Semantic (role-based aliases)
slate/{50,100,...,950}     →   bg.canvas, surface.container,
slateDark/{200,...,950}    →   text.primary, text.muted,
brand.{primaryLight,...}   →   primary.action, state.hot,
state.{hot,cold,...}       →   ball.{yellow,blue,red,gray,green}
ball.{yellow,...}          →
```

`lightColors`와 `darkColors`는 동일 인터페이스(`ColorsShape`)를 만족하지만 값만 다름.

### 핵심: 로또 공 색상 매핑

```ts
ball: {
  yellow: '#FBBF24',  // 1-10
  blue:   '#3B82F6',  // 11-20
  red:    '#EF4444',  // 21-30
  gray:   '#94A3B8',  // 31-40
  green:  '#22C55E',  // 41-45
  onLight: '#0F172A', // dark text on yellow/gray/green
  onDark:  '#FFFFFF', // light text on blue/red
}
```

### TypeScript 함정 — `as const` 좁히기 문제

**처음 시도** (실패):
```ts
export const lightColors = { ... } as const;  // 리터럴 타입 좁혀짐
export const darkColors  = { ... } as const;
export type Colors = typeof lightColors;       // 다크는 다른 타입이 됨
```

→ ThemeProvider에 `lightTheme | darkTheme` 둘 다 전달 못 함:
```
Type '"#10131A"' is not assignable to type '"#F8FAFC"'.
```

**해결**: 명시적 인터페이스 도입.

```ts
export interface ColorsShape {
  bg: { canvas: string; sectionMain: string; sectionSub: string };
  surface: { dim: string; container: string; ... };
  text: { primary: string; ... };
  // ...
}

export const lightColors: ColorsShape = { ... };  // 구조 검증, 값은 string
export const darkColors:  ColorsShape = { ... };
export type Colors = ColorsShape;
```

→ 두 객체 모두 동일 타입 `ColorsShape`를 만족 → ThemeProvider 정상 작동.

> **블로그 인사이트**: "디자인 토큰을 `as const`로 좁히면 IntelliSense는 좋지만, 모드별 분기가 있는 경우 타입 호환을 깬다. 인터페이스를 명시적으로 정의하는 편이 실용적이다."

### `styled.d.ts` — DefaultTheme 확장

```ts
import 'styled-components';
import 'styled-components/native';
import type { AppTheme } from './index';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
```

→ `styled.View``${({theme}) => theme.colors.bg.canvas}`` 가 type-safe하게 동작.

---

## 8. App.tsx — 검증용 첫 화면

5단계까지 완료된 시점의 화면. 빌드 성공 검증과 디자인 토큰 동작 확인 용도.

```tsx
function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Screen>
          <Title>LottoStats</Title>
          <Subtitle>한국 로또 6/45 통계 분석 도구</Subtitle>
          <BallRow>
            {[1, 14, 25, 36, 43].map(n => {
              const { bg, fg } = ballColor(n, theme);  // 번호 → 색상 자동 매핑
              return <Ball key={n} $bg={bg}><BallText $fg={fg}>{n}</BallText></Ball>;
            })}
          </BallRow>
        </Screen>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

### 화면 구성 (스크린샷)

- 최상단: "LottoStats" (display-lg, Manrope 700)
- 중간: "한국 로또 6/45 통계 분석 도구" (body-base, Inter)
- 하단: 5개 로또 공 (1=노랑·14=파랑·25=빨강·36=회색·43=초록)
- 시스템 다크 모드 토글 시 배경색 / 텍스트 색상 자동 전환 ← Figma Variables의 Light/Dark mode와 일치

---

## 9. 시간순 작업 체크리스트

### Day 1 (Figma 사전 작업, 별도 챕터)
- [x] Figma 디자인 시스템 변수·컴포넌트·화면 9종 구축
- [x] Light/Dark 모드 swap + inverse 텍스트 토큰 도입
- [x] 디자인 시스템 페이지 가시성 이슈 7개 컴포넌트 수정

### Day 2 (RN 셋업, 본 문서 핵심)
- [x] 폴더 구조 결정 (Option B)
- [x] **RN 0.76 시도 → 호환성 문제 발견 → 0.81로 전환**
- [x] RN 0.81 프로젝트 생성
- [x] 의존성 21개 설치
- [x] **iOS Pod install 4차례 누적 이슈 해결**
  - NitroModules 추가 설치
  - Worklets 추가 설치
  - `pod install --repo-update`
  - iOS deployment target 16.0 상향
- [x] **iOS BUILD SUCCEEDED** (iPhone 16 Pro Simulator)
- [x] src/ 폴더 구조 생성
- [x] Theme 5개 파일 작성 + TypeScript ColorsShape 인터페이스 도입
- [x] babel.config.js — `react-native-worklets/plugin` 추가
- [x] App.tsx 검증 화면 작성
- [x] git 초기 커밋 + iOS 16.0 fix 커밋
- [x] **Android USB 디버깅 빌드 성공** (Samsung R5CT20XPK8L)

---

## 10. 환경 정보 (재현용)

| 항목 | 값 |
|------|-----|
| OS | macOS 15.2 (Darwin 24.2.0) |
| Node | v23.7.0 |
| npm | 10.9.2 |
| Xcode | 16.2 (Build 16C5032a) |
| CocoaPods | 1.15.2 |
| iOS 시뮬레이터 | iPhone 16 Pro |
| Android 디바이스 | Samsung (R5CT20XPK8L), USB 유선 |
| RN | 0.81.0 |
| React | 19.1.0 |
| TypeScript | 5.8.3 |

---

## 11. 블로그 글 작성 시 활용 포인트

### 추천 구성안

1. **도입**: "왜 또 다른 로또 앱인가" — 예측 앱의 함정과 통계 도구의 차별화
2. **사전 단계**: Figma 디자인 시스템을 먼저 구축한 이유 (토큰 일관성)
3. **RN 버전 결정의 함정**: "최신을 쓰자"가 아니라 "내가 쓸 라이브러리 + Google Play 정책에서 역산한다"
4. **iOS Pod install 누적 이슈 4종**: NitroModules / Worklets / repo-update / deployment target — RN 4.x 시대의 새 의존성 모델
5. **Xcode 16.2 + CxxStdlib 함정**: error code 65를 만났을 때의 실전 디버깅
6. **TypeScript & 디자인 토큰**: `as const`의 좁히기 문제와 인터페이스 분리 패턴
7. **무선 디버깅 트러블슈팅** (사이드바): "No route to host"의 진짜 원인은 5555 포트가 닫혀있어서
8. **마무리**: 다음 단계 (네비게이션, API, 화면 구현)

### 인용 가능한 한 줄 요약

- "RN 버전은 라이브러리 peer deps와 Google Play 16KB 정책에서 역산해 결정한다."
- "RN 4.x 시대의 새 의존성 모델: NitroModules, Worklets는 별도 npm 패키지다."
- "Xcode 16.2 + RN 0.81 = iOS 16.0 deployment target 강제."
- "디자인 시스템을 코드보다 먼저 구축하면 토큰 매핑이 1:1이 된다."
- "`as const`는 IntelliSense엔 좋지만 모드 분기가 있으면 타입 호환을 깬다."

### 코드 스니펫 후보 (블로그에 직접 붙여넣기 가능)

- 위 4.4 — Podfile post_install hook
- 위 7 — ColorsShape 인터페이스
- 위 8 — App.tsx 로또 공 매핑

---

## 12. 다음 단계 (블로그 후속편 후보)

- [ ] React Navigation 7 — Bottom Tab + Stack 하이브리드 네비게이션 구성
- [ ] 동행복권 API 클라이언트 (axios + react-query)
- [ ] MMKV로 즐겨찾기 영구 저장
- [ ] 5종 추천 알고리즘 구현
- [ ] Victory Native 41 + Skia 2 차트 — 출현 빈도 도넛, 회차별 트렌드
- [ ] FlashList로 회차 리스트 가상 스크롤
- [ ] Lucide 아이콘 — Figma에서 정의한 25+ 아이콘 직접 import
- [ ] Figma Variables → CSS variables 자동 변환 스크립트 (선택)

---

*본 문서는 LottoStats 프로젝트의 셋업 단계 종료(2026-05-07) 시점에 작성됨. 이후 단계는 별도 문서로 분리.*
