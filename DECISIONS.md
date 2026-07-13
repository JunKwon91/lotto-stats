# Architecture Decision Records (ADR)

LottoStats 앱의 주요 설계 결정을 기록한다. 각 ADR은 상황(Context) / 선택(Decision) / 포기한 옵션(Considered Alternatives) / 근거(Rationale) / 결과(Consequences) 순서로 적는다.

UI 컴포넌트, 테마 토큰, imperative 호스트처럼 디자인 시스템 레벨의 결정은 별도 저장소 `@junkwon91/rn-design-system`의 `DECISIONS.md`에 있다. 이 문서는 그 라이브러리를 소비하는 앱 관점의 결정만 다룬다.

---

## ADR-01: React Native 0.81 채택 (0.76 → 0.81)

- **상황**: 초기 계획은 RN 0.76이었다. 그런데 쓰려는 라이브러리들의 peer 요구와 Google Play 정책에서 제약 두 개가 걸렸다.
- **선택**: RN 0.81.0 + React 19.x.
- **포기한 옵션**: RN 0.76(초기안), RN 0.78.
- **근거**:
  - Google Play가 2025-11-01부터 Android 15의 16KB 페이지 크기 지원을 의무화한다. RN 0.76은 미지원이라 출시가 막히고 0.78+가 필요했다.
  - `react-native-reanimated@4`의 peer 범위가 `"0.81 - 0.85"`라 0.78도 못 맞춘다.
  - `victory-native@41`, `@shopify/react-native-skia@2`가 React 19를 요구하는데, RN 0.81이 React 19를 처음 동반한다.
  - (이후 ADR-18에서 갱신됨: `victory-native`와 Skia는 제거하고 차트를 `react-native-svg` + View로 통일했다. 다만 RN 0.81을 고른 판단 자체는 이력으로 남긴다. React 19는 다른 의존성 때문에도 어차피 필요했다.)
  - `react-native-mmkv@4`(NitroModules), `react-native-screens@4`, `@react-navigation@7`도 0.78+를 요구한다.
- **결과**: 버전은 "최신"이 아니라 쓰려는 라이브러리의 peer dep와 출시 정책에서 역산해 정했다. 0.81이 위 네 제약을 동시에 만족하는 첫 버전이다.

---

## ADR-02: iOS deployment target 16.0 상향

- **상황**: RN 0.81과 의존성을 설치한 뒤 iOS 첫 빌드에서, Xcode 16.2가 CxxStdlib 모듈 관련으로 빌드에 실패했다.
- **선택**: iOS deployment target을 16.0으로 올린다(Podfile에서 강제).
- **포기한 옵션**: RN 기본 deployment target(13.4) 유지.
- **근거**: Xcode 16.2 툴체인이 일부 Pod에서 C++ stdlib 모듈을 요구하는데, 16.0 미만에서는 모듈 해석이 안 됐다. 16.0은 2026년 시점에 사용자 커버리지 손실이 거의 없다.
- **결과**: iOS 16.0+ 기기 대상. Podfile에 platform을 명시적으로 고정했다.

---

## ADR-03: 폴더 구조 — `lotto/LottoStats/` 분리 (Option B)

- **상황**: RN 프로젝트를 초기화할 때 `lotto/` 루트에 이미 Figma 작업 산출물 `DESIGN.md`가 있었다.
- **선택**: `lotto/`를 RN 루트로 쓰지 않고 한 단계 내려서 `lotto/LottoStats/`를 RN 루트로 만들었다.
- **포기한 옵션**: `lotto/`를 곧장 RN 루트로 쓰는 방식(Option A). 이 경우 기존 `DESIGN.md`를 백업했다가 복원해야 한다.
- **근거**: 기존 자산을 손실 없이 지키는 게 먼저였다. 폴더 깊이가 한 단계 늘어나는 비용보다 백업을 빠뜨릴 위험을 피하는 편이 낫다.
- **결과**: `lotto/`는 git 저장소가 아니라 컨테이너 폴더로 남았다. `DESIGN.md`는 소속을 분명히 하려고 뒤에 `LottoStats/docs/DESIGN.md`로 옮겼다(앱 전용 디자인 명세라서).

---

## ADR-04: UI 컴포넌트를 외부 디자인 시스템 라이브러리로 분리

- **상황**: 처음에는 Screen, Card, Button, IconButton, Input, DataTable, Toast, Dialog 같은 UI 컴포넌트를 앱 `src/components/` 안에 직접 구현했다.
- **선택**: 자체 컴포넌트를 전부 `@junkwon91/rn-design-system`(별도 저장소)으로 빼고, 앱은 이를 의존성으로 설치해 re-export만 한다. 버전은 GitHub 태그로 고정한다(현재 `v2.1.0`).
- **포기한 옵션**: 앱 내부 컴포넌트 유지, npm 레지스트리 배포(안 함, GitHub 태그 설치).
- **근거**:
  - 디자인 시스템은 Figma Variable Library와 1:1로 맞추는 게 목표라, 앱 도메인 로직과 변경 주기·관심사가 다르다. 별도 패키지가 맞다.
  - 라이브러리로 빼면 컴포넌트는 자체 ADR/문서/스크린샷으로 따로 관리하고, 앱은 도메인 기능에 집중할 수 있다.
  - 태그 고정으로 라이브러리 변경이 앱 빌드에 무단으로 반영되는 것을 막는다.
- **결과**:
  - `src/components/{primitives,surface,action,input,display,list,feedback}/index.ts`는 전부 라이브러리 re-export다.
  - 앱에 남기는 도메인 컴포넌트는 `components/lotto/`(로또 공 등), `components/charts/`(통계 차트)로 한정했다.
  - 이 결정으로 컴포넌트 제작 기록은 라이브러리 저장소 ADR로 넘어갔고, 앱 docs의 컴포넌트 devlog는 폐기했다(ADR-09).
  - 고정 태그 이력: `v2.0.0` → `v2.1.0`(OptionCard, 커스텀 아이콘 시스템, SettingsRow custom/divider 추가, Card variant outlined/filled 재정의). 라이브러리 릴리스 때 이 태그를 올리고 재설치한다.

---

## ADR-05: 테마를 라이브러리 토큰 베이스로 슬림화 + 로또 도메인 토큰만 유지

- **상황**: ADR-04로 컴포넌트가 라이브러리로 옮겨가면서, 앱이 들고 있던 전체 테마 토큰이 라이브러리 `AppTheme`과 겹쳤다.
- **선택**: 앱 테마는 라이브러리의 `lightTheme`/`darkTheme`을 베이스로 쓰고, 로또 도메인 전용 토큰만 얹는다. `state.hot`/`state.cold`(통계 강조)와 `ball.{yellow,blue,red,gray,green,onLight,onDark}`(번호대별 공 색)이다.
- **포기한 옵션**: 앱이 전체 토큰을 자체 보유(라이브러리와 이중 관리).
- **근거**: 공통 토큰은 라이브러리 한 곳에서 관리하고, 앱은 라이브러리에 없는 도메인 의미(hot/cold, 공 색상)만 더한다. styled-components `DefaultTheme`은 라이브러리 `AppTheme`을 확장한 앱 `LottoTheme`으로 보강해 타입 세이프를 유지한다.
- **근거(타입)**: 도메인 토큰도 `lightColors`/`darkColors` 두 모드를 같은 인터페이스로 정의한다. `as const`로 좁히면 두 모드가 서로 다른 리터럴 타입이 돼서 ThemeProvider에 양쪽을 넘기는 게 깨진다. 그래서 명시적 인터페이스(`ColorsShape` 패턴)로 구조만 강제하고 값은 string으로 둔다.
- **결과**: 로또 공 색 매핑(1–10 yellow / 11–20 blue / 21–30 red / 31–40 gray / 41–45 green, 대비 텍스트 onLight/onDark)을 도메인 토큰으로 한 곳에 모았다.

---

## ADR-06: 백엔드 없이 GitHub raw JSON을 데이터 소스로 사용

- **상황**: 매주 갱신되는 당첨번호 데이터를 앱에 공급해야 한다. 자체 API 서버는 비용, 인증, 유지보수가 부담이다.
- **선택**: 데이터를 별도 저장소 `JunKwon91/lotto-data`에 정적 JSON으로 두고, 앱은 그 GitHub raw URL을 직접 fetch한다. 크롤링과 갱신은 별도 프로젝트(`LottoStatsDataPrep`)가 GitHub Actions로 처리한다.
- **포기한 옵션**: 앱 저장소에 데이터 동봉(매주 새 빌드·스토어 심사 필요), AWS Lambda/자체 서버 cron(인프라·비용).
- **근거**:
  - 데이터를 앱과 분리하면 새 회차마다 앱을 다시 배포할 필요가 없다. 데이터 저장소만 갱신하면 된다.
  - GitHub raw URL이 CDN·무인증·무료 호스팅을 대신한다. 이 URL 한 줄이 사실상 "API 서버"다.
  - 데이터 생산(크롤러)과 소비(앱)가 JSON 스키마로만 엮여 각자 독립적으로 발전한다.
- **결과**: 앱 쪽 계약은 `src/config/api.ts`의 `LOTTO_DATA_URL`과 `src/types/lotto.ts`의 스키마(`drawNo/date/numbers/bonusNo`)다. 스키마를 바꾸면 크롤러도 같이 고쳐야 한다.

---

## ADR-07: MMKV 캐시 + TanStack Query 2단 로딩 전략

- **상황**: 네트워크에 의존하는 데이터를 매 진입마다 받으면 오프라인과 깜빡임 문제가 생긴다. 1,200+ 회차는 한 번 받으면 과거분이 안 변한다.
- **선택**: MMKV 영구 캐시와 TanStack Query를 묶어 2단으로 나눈다.
  - Splash: `loadInitialLottoData()`. 캐시가 있으면 즉시 반환(오프라인 OK), 없으면 fetch를 강제한다.
  - 메인 이후: `useLottoData()`. 백그라운드로 동기화(`syncLottoData()`)하고, fetch가 실패하면 기존 캐시를 반환한다. `staleTime` 1h / `gcTime` 7d / retry 2.
- **포기한 옵션**: 매 진입 강제 fetch(오프라인 불가·깜빡임), AsyncStorage(성능), 캐시 없이 메모리만(앱 재시작 시 손실).
- **근거**: 과거 회차가 안 변하니 캐시 우선이 안전하다. MMKV는 동기 read라 Splash에서 바로 분기할 수 있다. 실패 시 캐시로 폴백해 UI가 끊기지 않는다.
- **결과**: `services/lottoHistoryLoader.ts`(오케스트레이션), `storage/lottoStorage.ts`(MMKV), `hooks/queries/useLottoData.ts`(Query) 3층 구조다. `CachedLottoData`에 `cachedAt`를 더해 stale을 판단한다.
- **갱신**: 이후 ADR-12에서 데이터 로딩 관문 역할을 `useLottoData` cache-first로 옮기고 `loadInitialLottoData`를 제거했다. Splash 화면은 데이터 로딩과 떼어내 애니메이션 용도로 나중에 도입할 계획이다.

---

## ADR-08: 타입 세이프 네비게이션 (Bottom Tab + Native Stack)

- **상황**: 화면 9개를 메인 탭과 서브 스택으로 구성하면서 라우트 파라미터의 타입 안전성이 필요했다.
- **선택**: `@react-navigation` 7을 쓴다. `RootNavigator`(NativeStack) 안에 `MainTabNavigator`(BottomTab)를 중첩하고, `RootStackParamList`/`MainTabParamList`를 정의한 뒤 네임스페이스 augmentation을 건다.
- **포기한 옵션**: 단일 스택, 파라미터 타입 비명시(런타임 의존).
- **근거**: ParamList augmentation으로 `useNavigation`과 `route.params`가 화면별로 자동 추론된다. 잘못된 라우트명이나 파라미터를 컴파일타임에 잡는다.
- **결과**: 메인 탭(Home/Statistics/Recommend/Favorites)과 서브(RoundDetail{round}/RoundList/StatsDetail{type}/FavoriteAdd/Settings). `navigation/types.ts`가 단일 소스다.

---

## ADR-09: 문서화 방식 — 연대기 devlog 폐기, ADR 채택

- **상황**: 처음에는 작업을 시간순 devlog(`01-project-setup` ~ `05-iconbutton…`)로 적었다. 그런데 `03~05`(Screen/Button/IconButton)는 ADR-04로 라이브러리에 옮겨간 컴포넌트를 서술해 코드와 어긋났고, 그 제작 기록은 이미 라이브러리 저장소 ADR에 더 잘 남아 있어 중복이 됐다.
- **선택**: 연대기 devlog를 버리고, 라이브러리와 같은 ADR(목적별 의사결정) 방식을 이 `DECISIONS.md`로 채택한다. `03~05`는 삭제했다.
- **포기한 옵션**: devlog 유지(코드 변경 시 추적 단절), 03~05만 라이브러리로 이동(이미 ADR로 있어 불필요).
- **근거**: ADR은 "왜 이렇게 골랐나"를 코드 변경과 무관하게 남긴다. 그래서 유지보수하거나 작업을 재개할 때 설계 원칙 추적이 끊기지 않는다. 라이브러리도 같은 방식으로 검증됐다.
- **결과**: `01-project-setup`·`02-data-pipeline`의 핵심 결정은 ADR-01·02·03·05·06·07로 흡수했다. 두 원본 문서는 서사형 1차 자료로 당분간 두되, 새 결정은 전부 이 `DECISIONS.md`에 ADR로 추가한다.

---

## ADR-10: 카드 스타일 사용 규칙 — 리스트=Filled, 패널=Outlined

- **상황**: v2 화면들의 카드 스타일이 제각각이었다. 테두리 유무가 섞이고, `border/divider`와 `border/subtle`이 혼용되고, radius가 12/14/16으로 흩어졌다. 카드가 컴포넌트화되지 않아 화면마다 프레임을 따로 그렸기 때문이다. 한편 Figma는 퍼블리시된 인스턴스 안에 임의 자식(공·차트)을 넣을 수 없어, 콘텐츠가 든 카드를 DS Card 인스턴스로 직접 만들 수 없다.
- **선택**: DS Card의 두 Variant(라이브러리 ADR-41)를 기준으로 앱 카드를 용도별로 통일한다.
  - Filled(무테)는 반복되는 리스트 항목에 쓴다: 최근 당첨 내역, RoundList 회차, Favorites 조합, Recommend 알고리즘 옵션.
  - Outlined(테두리)는 독립 정보 패널에 쓴다: 당첨결과 Hero·TOP5, Statistics/StatsDetail 분석 카드, RoundDetail 당첨번호·테이블, Recommend 최근 추이, FavoriteAdd 선택 카드.
  - 공통 스펙은 fill `surface/container`, radius 16, Outlined는 `border/subtle` 1px.
  - 콘텐츠 카드(공·차트 포함)는 인스턴스 대신 이 스펙에 맞춘 프레임으로 구성한다.
  - Settings 그룹은 리스트 컨테이너라 Filled로 둔다.
- **포기한 옵션**: 전부 한 스타일로 통일(전부 Outlined면 리스트가 시끄럽고, 전부 Filled면 패널 경계가 사라짐), DS Card 인스턴스로 전면 교체(Figma 콘텐츠 중첩 제약으로 불가).
- **근거**: 테두리 유무에 "독립 패널 대 반복 리스트"라는 의미를 부여하면, 새 화면에서도 고민 없이 정할 수 있다. 반복 리스트는 간격과 반복이 이미 그룹을 만드니 테두리가 필요 없고, 패널은 테두리로 경계를 잡아준다.
- **결과**: 화면 9개의 카드 시각을 통일했다. 규칙은 Figma Foundations "Card 사용 규칙" 섹션과 `docs/DESIGN.md`의 Cards 섹션에도 적었다. variant 자체의 정의·근거는 라이브러리 ADR-41에 있다.

---

## ADR-11: 디자인 SVG를 컴포넌트로 소비 — react-native-svg-transformer

- **상황**: Figma에서 export한 앱 아이콘 로고를 인앱 헤더에 표시해야 한다. SVG 지오메트리를 `react-native-svg` 프리미티브로 손코딩하는 방식은 도형이 여러 개인 그래픽에서 지루하고 좌표 오차가 난다. 라이브러리의 `createIcon`은 단색 단일-path 아이콘 전용이라 그라디언트·멀티컬러 그래픽에는 안 맞는다.
- **선택**: `react-native-svg-transformer`를 도입해 `.svg` 파일을 컴포넌트처럼 import한다. metro `babelTransformerPath` 등록(`assetExts`에서 svg 제외, `sourceExts`에 추가), `declarations.d.ts`의 `*.svg` 모듈 선언, 에셋은 `src/assets/`에 둔다.
- **포기한 옵션**: 손코딩(정적 디자인 에셋에는 유지비·오차 과함), PNG(벡터 손실·@2x/@3x 관리 부담), `createIcon`(멀티컬러·그라디언트 불가).
- **근거**: 벡터라 크기와 무관하게 선명하고 해상도 변형 에셋이 필요 없다. 디자이너가 로고를 고치면 `.svg` 파일만 갈아 끼우면 된다. 소비 방식은 용도별로 나눈다. 로고·일러스트는 transformer, 단색 UI 아이콘은 `createIcon`, 코드로 만들어야 하는 파라메트릭 도형만 손코딩.
- **결과**: `components/layout/AppLogo`가 `assets/app-logo.svg`를 `size`로 감싸는 얇은 래퍼다. 이후 Figma에서 나온 로고/일러스트 SVG는 export → `src/assets/`에 넣고 import 한 줄로 쓴다. 런처(홈 화면) 아이콘 PNG는 네이티브 요구라 별개 작업으로 남긴다.

---

## ADR-12: 데이터 로딩을 useLottoData cache-first로 통합 (ADR-07 갱신)

- **상황**: ADR-07은 Splash를 데이터 로딩 관문으로 설계했다. `loadInitialLottoData()`로 캐시를 확인하고 없으면 강제 fetch한 뒤 MMKV에 저장하고 메인에 진입하는 흐름이다. 그런데 캐싱이 `useLottoData` 경로에서 이미 동작해 그 관문이 필요 없었고, `loadInitialLottoData`는 호출처가 0인 죽은 코드로 남아 있다가 제거됐다(커밋 `d298396`).
- **선택**: 데이터 로딩을 `useLottoData`의 per-screen cache-first + background sync로 통합한다. `initialData=getCachedLottoData()`가 재실행 시 MMKV 캐시를 바로 보여주고, `syncLottoData`가 fetch에 성공할 때마다 `setCachedLottoData`로 MMKV를 갱신하며, catch에서 `return cached`로 오프라인·fetch 실패를 폴백한다. `loadInitialLottoData`와 `LoadResult`는 제거했다.
- **Splash 화면은 나중에 도입**: Splash는 애니메이션·브랜딩 용도의 시각적 인트로로 만들 계획이고, "데이터 로딩 관문"으로는 안 쓴다. 즉 이 결정은 "Splash를 안 만든다"가 아니라 데이터 로딩과 Splash 화면을 분리한다는 뜻이다. Splash를 넣을 때는 데이터 로딩 없이 애니메이션만 맡고(가벼운 프리페치 정도는 그때 따로 정한다), cache-first 경로는 그대로 둔다.
- **포기한 옵션**: Splash를 데이터 로딩 관문으로 쓰는 방식(전역 강제 fetch 후 진입). cache-first가 화면별 로딩·오프라인을 자연스럽게 처리해 더 유연하다. 죽은 코드 방치(ADR-07 서술과 불일치, ADR-09의 코드-문서 정합 원칙 위반).
- **근거**: 다시 확인해 보니 캐시 우선, 오프라인, 재실행 즉시 표시가 `useLottoData`만으로 이미 동작했고, `loadInitialLottoData`는 그 동작의 중복이었다.
- **결과**: `services/lottoHistoryLoader.ts`는 `syncLottoData` 단일 export로 줄었다. 남은 과제: `clearCachedLottoData`(리셋 유틸) 정리 여부는 따로 판단, TanStack Query MMKV persister 승격은 미결, 오프라인·에러 경로의 런타임 검증은 미완(현재 온라인만 실측).

---

## ADR-13: 통화 표기 통일 — 접두 ₩ + 억·조 축약

- **상황**: 화면마다 통화 표기가 제각각이었다. 홈은 접두 `₩`, Figma 목업은 접미 `₩`와 영문 축약(`62.5B`)이 섞여 있었다. 회차 상세는 큰 금액(총 판매액 1,180억대, 1등 총 당첨금 590억대)을 좁은 요약 슬롯(내부 폭 ~141px)에 담아야 해서 풀 금액이 넘친다.
- **선택**: 통화 포맷을 `utils/formatCurrency`로 통일한다. `formatWon`(접두 `₩` + 천단위 콤마 풀 표기), `formatWonCompact`(억(10^8)·조(10^12) 한국식 축약, 억 미만 버림, 1억 미만은 풀 표기로 폴백), `formatCount`(인원 등 개수 콤마). 기준은 접두 `₩` + 한국식 억/조다. Hermes `Intl`에 안 기대도록 콤마는 정규식으로 처리한다.
- **포기한 옵션**: 접미 `₩`, 영문 `B`(billion) 축약(한국 앱에 부자연), `Intl.NumberFormat`(Hermes 의존·번들·환경 편차).
- **근거**: 접두 `₩`와 억/조가 한국 사용자에게 익숙하다. 좁은 영역엔 축약이 필수고(풀 금액이 넘침) 표나 넉넉한 영역엔 풀 표기가 정확하니, 용도별로 포매터를 둘로 나눴다. 유틸을 하나로 모아 화면 간 일관성을 잡았다.
- **결과**: 홈과 회차 상세가 같은 유틸을 쓴다. 좁은 값은 `formatWonCompact`(`₩590억`), 표나 충분한 폭은 `formatWon`(`₩2,026,170,000`). Figma 목업의 접미 `₩`와 영문 `B`는 코드에서 이 규칙으로 정정한다.

---

## ADR-14: Figma 색 토큰이 앱 테마에 없을 때 — 최근접 기존 토큰 + Figma 동기화

- **상황**: 회차 상세에서 Figma는 Trophy 아이콘에 `color/tertiary/base`(살구), 총 당첨금액 값에 `color/secondary/base`(시안)를 썼다. 그런데 앱 테마(`LottoColors`)는 secondary/tertiary를 노출하지 않는다. 라이브러리 primitive에만 있고 테마 `ColorsShape`나 앱 코드에는 없다. secondary/tertiary의 정식 도입은 별도 테마 정비 대상이다(프로젝트 노트).
- **선택**: 색 하나 때문에 신규 토큰을 성급히 들이지 않는다. 대신 앱 테마에 이미 있는 최근접 토큰으로 대체하고, Figma를 그 토큰으로 리바인딩해 코드와 디자인을 같은 토큰으로 맞춘다. Trophy는 `ball.yellow`(골드, Figma도 `ball/yellow`로 리바인딩), 총 당첨금액 값은 강조 없이 `text.primary`로 둔다(현행 유지).
- **포기한 옵션**: (a) raw hex 하드코딩(토큰 체계 훼손), (b) secondary/tertiary 즉시 신설(테마 정비·light/dark 값·타입 확장·ADR이 필요한데 아이콘 하나 때문에 과함).
- **근거**: 색 하나로 테마 스케일을 늘리기보다, 의미가 맞는 기존 토큰(트로피=골드)으로 대체하는 편이 안전하다. Figma를 같이 맞춰 "디자인=코드"를 유지하고, 로컬 팔레트만 쓰니 DS Color로 되돌아가지도 않는다.
- **결과**: secondary/tertiary 정식 도입은 별도 테마 정비로 미룬다. 앞으로 비슷한 토큰 공백도 이 정책(최근접 기존 토큰 + Figma 동기화)으로 처리한다.

---

## ADR-15: 서브 화면 커스텀 헤더 — SubHeader

- **상황**: 회차 상세처럼 스택으로 push되는 서브 화면은 뒤로가기, 제목, 우측 액션(즐겨찾기 등)이 필요하다. 네이티브 스택 헤더로는 우측 커스텀 액션과 디자인 토큰 정합에 제약이 있다.
- **선택**: 해당 화면만 `options={{ headerShown: false }}`로 네이티브 헤더를 끄고, 공용 `components/layout/SubHeader`(뒤로가기 `navigation.goBack` + 제목 + 우측 슬롯)를 쓴다. 홈의 로고형 `AppHeader`와는 별개의 뒤로가기형 셸 컴포넌트다.
- **포기한 옵션**: 네이티브 헤더 + `headerRight`(디자인 토큰·레이아웃 제약), 화면마다 개별 헤더 구현(중복).
- **근거**: 디자인 시스템 토큰으로 헤더를 그대로 구성할 수 있고, 우측만 슬롯으로 파라미터화하면 여러 서브 화면이 재사용할 수 있다(과한 추상화는 피한다). SafeArea 상단은 화면의 `Screen`(edges 'top')이 처리하므로 헤더는 관여하지 않는다.
- **결과**: RoundList·StatsDetail 같은 서브 화면이 `SubHeader`를 공유한다. RoundDetail은 우측에 즐겨찾기 버튼을 두되 진입점만 두고 동작은 나중에 구현한다.

---

## ADR-16: 긴 목록은 FlashList로 가상화 — 연도 그룹은 평탄화 + getItemType

- **상황**: 전체 회차 목록(RoundList)은 1,200+ 항목을 연도별로 묶어 보여주고, 회차 번호 검색과 최신순/오래된순 정렬이 필요하다. `ScrollView` + `map`으로 전량 렌더하면 스크롤 성능이 나쁘다. 데이터는 `useLottoData`로 전 회차가 이미 메모리에 있다. 프로젝트 표준 리스트는 `@shopify/flash-list`(v2)인데, v2에는 네이티브 섹션(SectionList) API가 없다.
- **선택**: 긴 목록은 FlashList로 가상화한다. 연도 헤더와 회차 항목을 하나의 평탄화 배열(`{ type:'year' } | { type:'round' }`)로 합치고, `getItemType`으로 이종 행을 구분해 행 재활용을 돕는다(`keyExtractor`로 안정 키). 검색(부분 매치)과 정렬은 클라이언트에서 `useMemo` 체인(정렬 → 필터 → 그룹핑)으로 처리한다. 검색 중에는 결과가 여러 연도에 흩어지므로 그룹을 풀고 평탄 목록으로 보여준다.
- **포기한 옵션**: `ScrollView`+`map`(전량 렌더·성능↓), `FlatList`(프로젝트 표준이 FlashList), RN `SectionList`(FlashList와 리스트 컴포넌트 혼용 회피), 네트워크 페이지네이션(데이터가 이미 메모리라 불필요, 렌더 가상화만 과제).
- **근거**: FlashList 가상화면 1,000+ 항목도 부드럽게 스크롤된다. 평탄화 + `getItemType`은 FlashList v2에서 섹션을 표현하는 표준 방식이고, 이종 행을 재활용해 성능을 유지한다. 파생 배열을 `useMemo`로 묶어 매 렌더 재계산을 막는다.
- **결과**: RoundList가 FlashList 첫 실사용이다. 이후 긴 목록(즐겨찾기 등)도 같은 패턴(FlashList + 필요 시 평탄화 섹션 + 클라이언트 필터/정렬)을 따른다. 회차 항목은 홈과 공유하는 `RoundCard` 도메인 컴포넌트를 쓴다.

---

## ADR-17: 페이지 배경을 surface.base에 맞춤 (라이트 흰 배경)

- **상황**: 화면 페이지 배경으로 라이브러리 `Screen`은 `bg.canvas`를 쓴다. 그런데 화면 디자인은 페이지 배경을 `surface/base`로 그린다. 두 토큰은 Dark에선 값이 같고(#10131A) Light에선 다르다. `bg.canvas`는 slate/200(회색), `surface.base`는 흰색이다. 그래서 Light 모드에서 앱(회색)과 디자인(흰색)이 어긋났다(Dark는 값이 같아 문제가 안 드러났다).
- **선택**: 앱 테마에서 `bg.canvas`를 `surface.base`로 오버라이드한다(Light·Dark 모두). Dark는 값이 같아 변화가 없고, Light만 흰색이 된다. 오버라이드는 앱 테마 주입 지점(ADR-05)에서 처리한다.
- **포기한 옵션**: (a) 화면마다 배경을 개별 지정(`Screen`은 `bg.*` 계열만 받아 `surface.base`를 못 고름·반복), (b) 디자인을 canvas 회색으로 정정(의도는 흰 페이지), (c) 라이브러리 canvas 값 변경(앱에서 라이브러리 수정은 부적절).
- **근거**: 디자인 의도가 흰 페이지이니 canvas를 `surface.base`에 맞추는 게 맞다. Dark는 이미 같아 리스크가 없다. 라이브러리의 M3 canvas(Light 회색) 레이어링보다 실제 디자인을 우선한다.
- **결과**: 전 화면 Light 배경이 흰색으로 통일된다. 카드(`surface.container`)는 원래 같은 토큰이라 변화가 없다. Light의 canvas 회색 레이어는 더 이상 안 쓴다.

---

## ADR-18: 차트를 react-native-svg + View로 통일 (Victory·Skia 제거)

- **상황**: 스택에 `victory-native@41` + `@shopify/react-native-skia@2`가 있었는데 `src`에서 import는 0건이었다. 통계 화면 차트 구현을 앞두고 쓸지 말지를 다시 봤다. Victory Native 41은 이전 버전과 다른 Skia 기반 재작성이라 Skia가 peer 필수다.
- **선택**: Victory Native와 Skia를 제거하고, 차트를 `react-native-svg`(도넛·추이선)와 순수 View(막대·프로그레스·히트맵 격자)로 통일한다.
- **포기한 옵션**: Victory 유지(추이 차트 한 곳만 실익), 전면 Victory 전환(단순 막대·도넛에 과중).
- **근거**:
  - Skia는 `dependency`라 실사용이 없어도 네이티브 바이너리가 앱에 컴파일된다(플랫폼당 수 MB). 비용만 내고 안 쓰는 상태였다.
  - Figma 통계 디자인에 인터랙션 정의가 없다(정적 표시). Victory의 강점인 터치 툴팁·애니메이션·줌·팬이 요구사항에 없다.
  - Victory가 실익을 주는 건 합계 추이 하나뿐이고, 그마저 svg Polyline + 수동 스케일로 대체된다.
  - 심화 차트 중 동반 출현 히트맵은 Victory에 해당 컴포넌트가 없어 어차피 View 격자로 그려야 한다. 커버리지가 좁다.
  - `react-native-svg`는 이미 앱의 시각화 표준이다(AppLogo·RankBadge 메달·DonutChart). 하나로 통일하면 유지보수 표면이 줄어든다.
- **결과**: `components/charts/`는 svg + View 기반이다. `package.json`에서 두 패키지를 빼고 `pod install`로 Skia 네이티브를 반납했다. 나중에 터치·줌 같은 인터랙티브 차트가 실제로 필요해지면 그때 다시 본다.

---

## ADR-19: 통계 집계는 순수 함수, 분석 범위 slice는 화면 책임

- **상황**: 통계 화면(Statistics 탭·전체 통계)은 "최근 100회/30회/전체" 범위를 바꿔가며 빈도·미출현·홀짝·합계·구간·연속·끝수·동반을 계산한다. 집계 로직을 어디에 두고 범위 선택을 누가 맡을지 정해야 했다.
- **선택**: `utils/statistics.ts`에 범위를 모르는 순수 함수만 둔다. 입력은 `rounds: LottoRound[]`, 출력은 계산 결과뿐이다(부수효과·정렬 가정 없음, 보너스 제외). 범위 slice는 화면이 맡는다(정렬 후 `slice(0, N)`, 또는 전체를 넘김). 화면은 `useMemo([data, range])`로 파생값을 한 번에 캐싱한다.
- **포기한 옵션**: (a) 유틸이 범위 인자를 받아 내부에서 자르기(범위 정책이 유틸에 새어 재사용성↓), (b) 훅·스토어에 집계를 두기(순수 계산에 상태 결합이 불필요).
- **근거**: 순수 함수는 테스트·검증이 쉽다. 실데이터로 항등식을 확인할 수 있다(빈도 합=회차×6, 비율 합=1, 동반 행렬 대칭·대각선 0 등). 화면이 범위만 잘라 넘기면 어떤 범위에도 같은 함수를 재사용한다. 계산이 전부 O(회차수)라 전체(1,231회)를 매 전환마다 다시 계산해도 가볍다.
- **결과**: 집계 함수 8종이 화면·범위와 독립이다. 전체 통계는 한 `useMemo`에서 전 지표를 scoped로 계산해 범위를 바꾸면 한꺼번에 갱신된다.

---

## ADR-20: 구간별 분포는 당첨공 색 밴드 기준 (Figma 십의 자리 라벨 정정)

- **상황**: "구간별 분포"는 1~45를 5구간으로 나눠 출현 비율을 비교한다. Figma 목업은 경계를 십의 자리(1–9 / 10–19 / … / 40–45)로 두고 각 구간에 공 색 이름("옐로우"·"블루"…)을 붙였다. 이건 실제 공 색 경계(1–10 노랑 / 11–20 파랑 / …)와 한 칸씩 어긋난다(공 10은 노랑인데 라벨은 "10–19 블루"에 들어감).
- **선택**: 경계를 공 색 밴드(1–10 / 11–20 / 21–30 / 31–40 / 41–45)로 확정하고 Figma 라벨을 정정한다(1–9→1–10 등, 색 이름 제거). 각 바는 해당 밴드의 공 색 토큰(`colors.ball.*`)으로 칠하고, 비율은 밴드 출현 횟수 / (회차×6)로 정규화 없이 그대로 둔다.
- **포기한 옵션**: (a) 십의 자리 경계 유지(색 이름과 모순·앱의 공 색 도메인과 불일치), (b) 밴드 크기 차이를 번호 개수로 정규화(합 100%가 깨지고 "실제 출현 비율"이라는 의미가 흐려짐).
- **근거**: 로또 앱에서 "구간"은 공 색 밴드가 자연스럽고, `ball.*` 토큰을 재사용하면 같은 번호가 화면 간에 같은 색으로 읽힌다(ADR-14와 같은 취지). 41–45가 번호 5개라 ~11%로 낮은 건 사실이므로 정규화하지 않고 부제로 맥락만 준다.
- **결과**: 코드와 Figma 모두 공 색 밴드다. 바 색은 공 토큰, 트랙은 표면 토큰. Figma의 십의 자리 라벨은 폐기했다.

---

## ADR-21: 연속 번호 출현 = 회차별 최장 연속 길이, 분모는 연속 있는 회차

- **상황**: "연속 번호 출현"의 정의가 Figma와 부제만으론 모호했다. Figma 수치(2연속 60 / 3연속 25 / 4연속 12 / 5연속 3%)는 합이 100%였지만 실데이터로 재현되지 않는 placeholder였다(실제로는 2연속이 ~90%로 압도적).
- **선택**: 각 회차의 최장 연속 run 길이로 회차를 분류하고, 분모는 "연속(길이≥2)이 하나라도 있는 회차"로 둔다(합 100%). 전체 회차 대비 발생률은 별도 리드 수치(`withRunRatio`, 실데이터 ~51.8%)로 보여준다. 버킷은 2~6이되 6연속은 실제 나올 때만 행을 추가한다(Figma는 2~5).
- **포기한 옵션**: (a) "연속 포함 회차" 독립 비율(합≠100%·행 간 관계 불명), (b) 전체 run 개수 비율(2-run이 압도해 분포가 안 드러남), (c) Figma 수치 그대로(데이터와 무관한 허구).
- **근거**: "연속 streak가 보통 얼마나 길어지나"가 가장 읽기 쉽고, 발생률은 리드로 떼어 두 정보를 함께 준다. 실데이터 편중(2연속 ~90%)은 사실이니 막대가 한쪽으로 쏠려도 그대로 둔다.
- **결과**: `getConsecutiveDistribution`은 `{ withRunCount, withRunRatio, buckets }`를 반환한다. 화면은 "연속 발생률 N%" 리드와 최장 길이별 막대를 그린다. Figma placeholder 수치는 실데이터로 대체했다.

---

## ADR-22: 끝수 분포를 도넛(최빈 강조) 대신 0~9 미니 막대로

- **상황**: Figma "끝수 분포"는 도넛 + 최빈 강조(끝수 하나) + 하단 0~9 인디케이터였다. 그런데 섹션 이름과 부제("일의 자리별 출현 분포")가 약속하는 건 분포 전체인데, 도넛+최빈은 최빈 하나(끝수 4, ~11.5%)만 보여주고 나머지 9개 값을 알 수 없다. 실데이터가 거의 균등(8.5~11.5%)이라 최빈 호가 작아 의미 전달도 약하다.
- **선택**: 도넛과 인디케이터를 걷어내고 0~9 미니 막대 차트로 바꾼다(기존 `BarChart` 재사용). 최빈 막대만 강조색, 나머지는 중립. 정확한 최빈 값은 리드 수치("끝수 N · 최빈 · N%")로 보완한다. Figma도 같은 막대로 동기화한다.
- **포기한 옵션**: (a) 도넛 유지(항목 10개에 파이·도넛은 부적합·분포 은폐), (b) 10세그먼트 도넛(10색 필요·복잡).
- **근거**: 항목 10개의 분포는 막대가 정석이고, "고르게 나온다"는 인사이트가 막대에서 드러난다. `BarChart`가 이미 있어 신규 컴포넌트도 필요 없다.
- **결과**: 빈도와 끝수가 같은 막대 컴포넌트를 공유한다. Figma 도넛 목업은 폐기하고 막대로 대체했다.

---

## ADR-23: 동반 출현 히트맵 — 상위 9개 pairwise + min-max 스트레치 강도

- **상황**: "동반 출현 매트릭스"는 두 번호가 함께 나온 횟수의 강도를 색으로 보여준다. 45×45(2,025셀)는 렌더가 무겁고, Figma 목업은 축 라벨 없는 9×9 이진 텍스처(placeholder)였다.
- **선택**: 상위 9개 빈출 번호 pairwise(9×9=81셀, 순수 View 격자)로 두고 축 라벨(상단·좌측 번호)을 붙인다. 셀 색은 `primary.action`, 강도는 min-max 스트레치 `0.2 + 0.8·(count−min)/(max−min)`로 준다(0회·대각선은 중립 트랙). 가장 많이 함께 나온 조합은 리드 수치로 보여주고, 색 있는 셀엔 접근성 라벨(예: "3번과 13번 29회")을 준다.
- **포기한 옵션**: (a) 45×45(렌더 과중), (b) 라벨 없는 9밴드(어느 조합인지 못 읽어 정보 가치↓), (c) `count/max` 절대 강도(상위 9개는 서로 자주 동반해 전체 기준 opacity가 0.52~1.0으로 압축돼, "강도를 색으로"라는 의미가 안 드러남).
- **근거**: 상위 9개에 라벨이 있어야 "핫 넘버끼리 뭉치는가"를 읽을 수 있다. 값 범위가 좁으니 min-max로 펼쳐야 강도 차이가 보이고, 절대값은 리드가 보완한다. 81셀은 가볍고 범위를 바꿀 때마다 상위 번호·강도가 갱신된다.
- **결과**: `getCoOccurrenceMatrix(rounds, 9)`가 `{ numbers, counts, max }`를 반환한다. 히트맵은 축 라벨·강도·리드·셀별 접근성 라벨을 갖춘다. Figma도 실데이터 min-max로 동기화했다.

---

## ADR-24: 카드 위 중립 색을 surface.container-highest로 (Light 톤 충돌 회피)

- **상황**: 막대·트랙·범례·히트맵 빈 셀처럼 카드(`surface.container`) 위 중립 요소에 `surface.container-high`를 썼다. 그런데 Light 모드에서 `container-high`(#f1f5f9)가 카드(`container`)와 같은 hex라 중립 요소가 안 보였다(Dark는 값이 달라 문제가 안 드러남). 히트맵 빈 셀은 아예 `container`(카드와 같은 토큰)라 양쪽 모드에서 안 보였다.
- **선택**: 카드 위 중립 색을 `surface.container-highest`로 옮긴다(Light #e2e8f0 / Dark #32353c, 양쪽 모두 카드와 구분됨). `BarChart`·`DonutChart` 기본값과 두 통계 화면의 트랙·범례·도넛 트랙 세그먼트를 한꺼번에 교체했다. 새 토큰 없이 기존 상위 표면 토큰을 쓴다.
- **포기한 옵션**: (a) `container-high` 유지(Light에서 안 보임), (b) 라이브러리 토큰 값 수정(앱에서 라이브러리 변경 부적절·다른 소비처 영향), (c) 화면마다 raw hex(토큰 체계 훼손).
- **근거**: `container-highest`는 한 단계 높은 표면 토큰이라 카드 위 요소에 의미상 맞고, 두 모드 모두 대비가 확보된다. Light에서 container 계열 톤이 겹치는 건 알려진 이슈라, 카드 위 중립은 highest로 두는 게 안전하다.
- **결과**: 빈도·끝수 막대, 구간·연속·합계 트랙, 홀짝 도넛 짝, 히트맵 빈 셀·대각선이 Light·Dark 모두 보인다. `container-high`는 카드 위 중립 용도로는 더 안 쓴다.

---

## ADR-25: 추천 알고리즘은 순수 함수 + rng 주입, 단일 세트 검사는 별도 헬퍼

- **상황**: 추천 5종은 데이터 경향을 반영해 번호를 뽑는다. 통계 집계 유틸(`statistics`)은 회차 배열을 훑는 쪽이라, 갓 뽑은 6개 한 세트를 검사(연속·밴드·홀짝·합계)하는 데는 안 맞는다. 실데이터 시뮬레이션과 유닛 테스트의 재현성도 필요하다.
- **선택**: `utils/algorithms/`에 순수 함수로 둔다. 시그니처는 `(rounds, count = 1, rng = Math.random) → number[][]`다(각 세트 6개·오름차순·중복 없음, `count` 세트). rng를 주입해 시드를 고정하면 재현된다. 파일은 `weightedPick`(가중·균등 비복원 추출), `predicates`(단일 세트 술어), `recommend`(5종 + 디스패처)로 나눈다. Hot/Cold는 `getNumberFrequency`·`getNumberGaps`를 재사용하고, 단일 세트 검사는 가벼운 `predicates`로 새로 둔다.
- **포기한 옵션**: (a) `statistics`에 단일 세트 검사 추가(회차 집계와 쓰임이 달라 API가 지저분해짐), (b) rng 미주입(`Math.random` 직접 호출이라 테스트가 비결정적), (c) 클래스·상태 보유(순수 함수가 조합·테스트에 유리).
- **근거**: 순수 함수에 rng를 주입해야 시뮬레이션과 유닛 테스트가 재현된다. 집계(회차)와 술어(단일 세트)는 쓰임이 다르니 분리하는 게 맞다.
- **결과**: `generateHot/Cold/Pattern/Balanced/Random`과 `generateRecommendation(type, ...)`. 1000세트 시뮬로 특성·유효성·재현성을 확인했다.

---

## ADR-26: 추천 Hot/Cold는 전체 회차 기준 + floor 0.1 min-max 가중

- **상황**: 통계 화면 Hot/Cold는 최근 100회 기준이다. 추천 Hot/Cold도 같은 범위·가중(floor 0.3)이면 편향이 약하다. 최근 100회는 빈도 격차가 작아(6~21) 최다/최소 선택이 3.3배에 그쳐 Random과 구별이 흐리다.
- **선택**: 추천 Hot/Cold는 전체 회차를 기준으로 하고 가중을 `0.1 + 0.9·(v−min)/(max−min)`(floor 0.1)로 둔다. 실측으로 전체 회차·floor 0.1이면 최다/최소 선택이 8.79배(빈도상관 0.97)라 Random과 확실히 구별되고, 최소 번호도 세트당 등장해 다양성이 남는다. Cold는 gap으로 대칭이다. `min===max`(빈 입력 등)면 균등으로 폴백한다.
- **포기한 옵션**: (a) 최근 100회 유지(격차가 작아 구별 약함), (b) floor 0.3 유지(3.3배라 약함), (c) 제곱 가중(최다/최소 100배라 최소 번호가 사실상 배제됨·과격), (d) 범위만 확대(min-max 정규화에선 극단비가 floor로만 정해져, 범위를 늘려도 극단비는 그대로다. 실측으로 확인).
- **근거**: min-max 정규화는 극단비를 floor가 결정하니, 구별을 주려면 floor를 낮춰야 한다. 전체 회차는 표본이 커 노이즈가 줄고, floor 0.1이 "자주/오래 안 나온 번호가 유리하되 최소도 등장"의 적정선이다.
- **결과**: `generateHot/Cold`는 전체 rounds를 받는다(통계 100회와 일부러 다르게). 화면도 `useLottoData`의 전체 회차를 넘긴다.

---

## ADR-27: Pattern·Balanced는 rejection sampling (연속+3밴드 / 홀짝2-4+합105-175)

- **상황**: Pattern(연속·구간 패턴)과 Balanced(홀짝·합계 균형)는 "특정 구조를 만족하는 조합"이라 가중 추출로 표현하기 어렵다.
- **선택**: rejection sampling을 쓴다. 균등 6개를 뽑아 조건을 만족할 때까지 다시 뽑고(최대 20시도, 넘으면 마지막 결과), Pattern은 연속 1쌍 + 3밴드 이상, Balanced는 홀짝 2~4(3:3·4:2·2:4) + 합계 105~175(실데이터 평균 138·표준편차 31의 ±1σ 근사)를 조건으로 둔다. 실측 충족률은 Pattern 50.3%, Balanced 61.1%로 평균 시도가 2회 미만이다.
- **포기한 옵션**: (a) Pattern 4밴드 이상(연속 AND 4밴드가 실측 27.9%로 30% 미만이라 재추출이 잦아 3밴드로), (b) 합계 100~170(비대칭이라 ±1σ 대칭인 105~175로), (c) 최대 시도 100(충족률상 20이면 실패확률이 1e-6 미만이라 과함), (d) 조건 만족 조합을 사전 나열(경우의 수가 너무 많음).
- **근거**: 충족률이 50%대라 rejection이 평균 2회 미만으로 빠르다. 4밴드는 균등에서 드물어, 3밴드가 실데이터(연속 발생률 51.8%)에도 맞는다. 시도 상한은 무한 루프를 막는 안전장치다.
- **결과**: `generatePattern/Balanced`는 조건을 100% 만족하는 세트만 반환한다(1000세트 검증). 실패 폴백은 사실상 안 걸린다.

---

## ADR-28: 추천 화면 선택 컨트롤은 DS 컴포넌트 재사용 (SegmentedControl·OptionCard)

- **상황**: 추천 화면은 세트 개수(1~5)와 알고리즘(5종) 선택 UI가 필요하다. Figma의 SegmentedControl 컴포넌트는 변형이 2·3세그뿐이고, 알고리즘 행은 "OptionCard"로 그려져 있다.
- **선택**: 둘 다 DS 라이브러리 컴포넌트를 그대로 재사용한다. 세트 개수는 `SegmentedControl`(코드 컴포넌트는 segments 배열로 데이터 구동이라 5세그도 정상 렌더된다. Figma 변형 한계와 무관), 알고리즘 행은 `OptionCard`(아이콘 + 제목 + 설명 + 선택 마크)를 쓴다. 화면은 아이콘·색·문구만 주입한다.
- **포기한 옵션**: (a) 세트 개수 컨트롤 자작(라이브러리가 이미 지원한다. Figma에 변형만 없던 것), (b) 알고리즘 행 커스텀 라디오(원 + Check를 손으로 그림. OptionCard가 같은 비주얼을 이미 제공하는데 선택 UI를 다시 만드는 셈), (c) DS `Radio`(좌측 dot + 라벨 구조라 우측 체크·2줄 카드 레이아웃과 안 맞음).
- **근거**: SegmentedControl과 OptionCard는 색을 앱 토큰으로 테마링받는 구조 컴포넌트다(라이브러리=구조, 앱=색·문구). Figma의 OptionCard가 이 DS 컴포넌트를 원본으로 만든 것이라, 코드도 같은 컴포넌트를 쓰면 그대로 맞는다. Figma에 변형이 없는 것과 코드의 데이터 구동은 별개다.
- **결과**: 추천 화면은 도메인 컴포넌트(LottoBallSet)만 자체로 두고 선택 컨트롤은 DS를 재사용한다. `components/input` 배럴에 `OptionCard` re-export를 추가했다.

---

## ADR-29: 즐겨찾기는 MMKV + Zustand (앱의 첫 "쓰기" 데이터)

- **상황**: 지금까지 화면은 모두 읽기였다(회차 데이터를 TanStack Query 캐시로 소비). 즐겨찾기는 사용자가 저장·삭제·수정하는 로컬 데이터이고 서버가 없다. 저장 구조를 새로 정해야 했다.
- **선택**: 별도 MMKV 인스턴스(`id: 'favorites'`) + Zustand 스토어로 둔다. 스토어가 초기화 때 MMKV에서 hydrate하고 변경마다 persist한다. 항목 스키마 `FavoriteItem { id, numbers(6·오름차순), memo?, createdAt, source }`, 출처 `source`는 `manual`(직접 추가) / `recommend`(추천 세트) / `round`(회차, 타입만 정의). 중복 정책은 같은 조합 + 같은 `source.kind`면 무시한다(추천에서 ★를 여러 번 눌러도 하나).
- **포기한 옵션**: (a) TanStack Query(서버 상태용이라 순수 로컬 쓰기에 안 맞음), (b) AsyncStorage(성능), (c) 회차 캐시와 같은 인스턴스(키 충돌), (d) 중복 무제한 허용(같은 세트 반복 저장으로 목록이 지저분).
- **근거**: 즐겨찾기는 서버 없는 순수 로컬 쓰기라 Zustand + MMKV 조합이 맞다. MMKV는 동기 read라 첫 렌더부터 확정값이다. 별도 인스턴스로 회차 캐시와 격리하고, `source`로 출처를 구분해 ★·직접 추가를 같은 저장소로 모은다.
- **결과**: `stores/`의 첫 사용처. Recommend 세트별 ★와 FavoriteAdd가 이 스토어를 쓴다. `add`는 id·createdAt을 스토어가 생성한다.

---

## ADR-30: 자동 비교는 "볼 때 계산", 대상은 저장 이후 첫 추첨 회차

- **상황**: 저장한 조합을 실제 당첨 회차와 자동 비교해야 한다. 당첨은 저장한 뒤에 나오므로 언제·어느 회차와 비교할지 정해야 했고, Figma에는 비교 UI가 없었다.
- **선택**: 저장 시점이 아니라 **볼 때** 계산한다. 대상 회차는 `createdAt` 이후 처음 추첨된 회차다(회차 date에 추첨 시각 20:35 KST를 붙여 절대 시각으로 비교, `createdAt`보다 늦은 것 중 가장 이른 회차). 아직 없으면 "다음 추첨 대기". `matchLotto(picks, draw)`로 매칭 개수·보너스·등수(6=1등 / 5+보너스=2등 / 5=3등 / 4=4등 / 3=5등)를 낸다. Favorites 카드에 담백한 배지로 표시한다(Figma에 없어 신설).
- **포기한 옵션**: (a) 저장 시 계산(그 시점엔 당첨 회차가 없음), (b) 최신 회차와 비교(저장 시점과 무관해 의미 약함), (c) 전 회차 최고 매칭(운 좋은 과거를 보여줄 뿐), (d) 대상 회차를 저장(`createdAt`으로 파생 가능해 불필요·stale 위험).
- **근거**: 당첨은 사후 사실이라 볼 때 계산이 정확하고 stale이 없다. "저장 후 첫 회차"가 "내 번호가 다음 추첨에 맞았나"라는 사용자 기대와 맞는다. 20:35 KST 기준이라 같은 날 추첨 전/후 저장을 정확히 가른다. 배지는 예측이 아니라 사후 확인이므로 과장 없이 담백하게 둔다.
- **결과**: `utils/matchLotto`(`matchLotto`·`getTargetRound`, 순수 함수). 실데이터로 등수 규칙·타깃 회차를 검증했다.

---

## ADR-31: 동작 없는 즐겨찾기 진입점은 두지 않는다 (RoundDetail ★ 제거)

- **상황**: RoundDetail 헤더와 Recommend 결과에 ★가 no-op으로 있었다. 즐겨찾기 구현 때 배선 대상이었는데, 회차 ★의 의미가 애매했다(회차 당첨번호를 조합으로 저장? 회차를 북마크?).
- **선택**: Recommend ★만 배선한다(그 추천 세트를 `source: recommend`로 저장, 저장 상태에 따라 별 채움/토글). RoundDetail ★는 제거하고 SubHeader를 title만 렌더한다.
- **포기한 옵션**: (a) 회차 당첨번호를 조합으로 저장(이미 나온 번호라 자동 비교가 늘 1등이고 다시 살 번호도 아님), (b) 회차 북마크를 별도 항목 타입으로(Favorites의 콤보 카드 UI와 안 맞고 Figma에 없는 화면이 필요).
- **근거**: 동작 없는 버튼은 두지 않는다(정직성). Favorites의 핵심은 직접 추가와 추천 저장이다. 회차 북마크가 실제로 필요해지면 그때 별도로 설계한다.
- **결과**: RoundDetail SubHeader의 right ★ 제거(SubHeader 컴포넌트는 right 옵셔널 그대로라 다른 소비처 영향 없음). `FavoriteSource`의 `round`는 타입만 남기고 미사용.

---

## ADR-32: FavoriteAdd 번호 선택은 LottoBall 무변경 + 링 래퍼

- **상황**: FavoriteAdd의 1~45 그리드에서 6개를 골라야 한다. 공용 컴포넌트 LottoBall에는 선택 상태가 없다.
- **선택**: 도메인 컴포넌트 `NumberPicker`에서 LottoBall을 Pressable + 링 래퍼로 감싼다. 선택 시 `primary.action` 테두리, 미선택은 같은 두께의 투명 테두리로 셀 크기를 고정한다. LottoBall 자체는 건드리지 않는다. 6개까지만 추가되고(7번째 막힘) 해제는 항상 된다. 편집은 같은 화면을 재사용한다(`FavoriteAdd`에 옵셔널 `id` 파라미터).
- **포기한 옵션**: (a) LottoBall에 `selected` prop 추가(여러 화면 공용이라 영향 범위가 넓고, 선택은 그리드 국소 관심사), (b) 그리드 전용 새 볼 컴포넌트(색·번호 로직 중복).
- **근거**: LottoBall은 홈·리스트·상세·추천 등 여러 화면이 쓰는 공용 컴포넌트라 최소 침습이 안전하다. 선택 링은 NumberPicker만의 관심사이므로 래퍼에 둔다.
- **결과**: `components/lotto/NumberPicker`. FavoriteAdd가 신규·편집 공용 화면이 된다.

---

## ADR-33: 설정은 동작하는 것만 둔다 (시연 갤러리 → 실제 설정)

- **상황**: SettingsScreen이 1050줄짜리 컴포넌트 시연 갤러리(개발용)였다. 실제 설정 화면이 필요했고, 표시만 하는 껍데기 설정은 정직성에 어긋난다.
- **선택**: 갤러리를 완전히 대체하고 **실제로 동작하는 항목만** 둔다. 테마 모드(시스템/라이트/다크)를 설정 스토어에 저장하고 App.tsx가 그 값으로 `isDark`를 정한다(기존엔 시스템 추종만이었음 → 수동 전환 도입). 기본 분석 범위를 저장해 StatsDetail 진입 초기 범위에 반영한다. 그 외 데이터 새로고침(refetch)·캐시 삭제(회차 캐시만, DS 다이얼로그 확인)·앱 버전(package.json)·개발자 깃허브(Linking)·오픈소스 라이선스를 제공한다. 설정 저장은 별도 MMKV 인스턴스(`id: 'settings'`) + Zustand로 favoritesStore와 같은 패턴이다.
- **포기한 옵션**: (a) 햅틱 토글(M6 네이티브 햅틱 전엔 켜고 끌 동작이 없어 저장만 하는 no-op — 제외), (b) 이용약관(M5 배포 시 실제 약관이 정해진 뒤), (c) Statistics 탭도 설정 범위를 따르게(그 화면은 "최근 100회차 기반" 문구라 100 고정 유지, 범위는 StatsDetail에만 적용).
- **근거**: 설정은 실제로 반영돼야 신뢰가 간다. 테마·범위는 스토어와 배선으로 즉시 반영되고, 뒷받침 없는 항목은 기능이 생길 때 함께 넣는다.
- **결과**: `stores/settingsStore`·`storage/settingsStorage`·`types/settings`. StatsDetail의 `RangeKey`를 공유 타입 `StatsRange`로 승격해 재사용한다. M3의 마지막 화면이 완성됐다.

---

## ADR-34: 오픈소스 라이선스는 도구로 생성한 TS 모듈 (JSON import 회피)

- **상황**: 설정에 오픈소스 라이선스 고지(종류 + 전문 + 저작권)가 필요했다. 정확성이 핵심이라 수기 작성은 오류 위험이 크다.
- **선택**: `license-checker-rseidelsohn`(devDependency)이 node_modules를 스캔해 라이선스 종류를 판별한다. 얇은 후처리(`scripts/build-licenses.js`, `npm run licenses`)가 package.json의 직접 의존성만 골라 실제 LICENSE 전문·저작권을 뽑고, LICENSE 파일이 없어 도구가 README를 가리키는 경우만 SPDX 표준 전문으로 보정한다. 출력은 JSON이 아니라 **`.ts` 모듈**(`export const licenses`)로 만든다. 앱은 목록 → 전문 상세로 소비한다.
- **포기한 옵션**: (a) 수기 라이선스 목록(부정확·유지보수 부담), (b) `licenses.json`을 default import(배열이 최상위인 JSON은 Metro/babel 상호운용에서 `undefined`가 되는 문제를 실제로 겪음), (c) 전체 production 의존성 599개 나열(과함), (d) 런타임 라이선스 표시 라이브러리(유지보수가 불안정).
- **근거**: 도구가 스캔·판별하므로 종류·전문이 실제와 일치한다(수기 오류 0). `.ts` 모듈은 일반 ES export라 JSON import 문제를 원천 제거한다. 직접 의존성 범위가 완결적이되 과하지 않고, devDependency라 앱 번들에는 안 들어간다.
- **결과**: `scripts/build-licenses.js`, 생성물 `src/data/licenses.ts`(`.eslintignore` 등록), `OssLicenses`·`OssLicenseDetail` 화면. 직접 의존성 20종(MIT 19 + ISC 1), LICENSE 파일 없는 2종(mmkv·nitro-modules)은 SPDX 폴백.

---

## ADR-35: 회차 데이터 영속은 MMKV cache-first 유지 (TanStack Query persister 미승격)

- **상황**: M2 잔여로 "현행 MMKV 직접 cache-first 유지 vs TanStack Query persister 승격" 갈림길이 있었다. 현재 구조(ADR-07·ADR-12)는 `useLottoData`가 `useQuery`를 쓰되, `initialData`로 MMKV 캐시를 동기 read해 시드하고 `queryFn`(`syncLottoData`)이 성공 fetch마다 MMKV에 쓰는 수동 cache-first다. TanStack Query 자체 캐시는 인메모리라 콜드 스타트마다 소멸하고, 런치 간 영속은 MMKV가 담당한다. 이를 표준 persister(`persistQueryClient` + 스토리지 어댑터)로 승격할지 결정이 필요했다.
- **선택**: 현행 MMKV cache-first 유지. persister 미승격.
- **포기한 옵션**: (a) `@tanstack/query-*-persister` 승격 — Query 캐시 전체를 자동 dehydrate/rehydrate, (b) MMKV용 persister 어댑터 직접 구현.
- **근거**: persister의 핵심 가치는 여러 독립 쿼리를 일괄 영속·복원하는 것인데, 이 앱은 `useQuery`가 앱 전체에서 1개(전 회차 history)뿐이고 `useMutation`·`useInfiniteQuery`는 0이라 그 이점이 발생하지 않는다. MMKV는 동기 read라 `initialData`가 첫 프레임부터 데이터를 채워 하이드레이션 깜빡임이 없는데, `persistQueryClient`는 비동기 복원이라 게이팅·플래시 여지가 생긴다. 현행 `syncLottoData`는 fetch 실패 시 캐시를 반환하며 `status=success`를 유지하는 무음 오프라인 폴백을 이미 제공한다. 잘 도는 단순한 구조를 표준이라는 이유로 복잡하게 바꿀 실익이 없다(YAGNI).
- **결과**: 코드 변경 없음. `useLottoData`·`lottoStorage` 현행 유지. TanStack Query는 미사용 의존성이 아니라 `useLottoData`의 fetch·재시도·상태 관리에 실사용 중이며 8개 화면이 의존하므로 제거 대상이 아니다(제거 시 `QueryClientProvider` 필요로 앱이 깨진다). 독립 캐싱이 필요한 서버 쿼리가 여러 개로 늘 때(회차별 원격 fetch·계정 등) 재검토한다. 오프라인 4시나리오는 코드상 크래시·무한 로딩 없이 처리됨을 확인했다 — 캐시 있으면 즉시 렌더(fetch 미시도), 캐시 없는 오프라인 최초 실행도 retry 소진 후 `ErrorView`(다시 시도)로 수렴한다(모든 소비처가 `!data`·옵셔널 체이닝으로 가드).
