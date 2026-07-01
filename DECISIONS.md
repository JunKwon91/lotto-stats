# Architecture Decision Records (ADR)

LottoStats 앱의 주요 설계 결정을 기록한다. 각 ADR은 상황(Context) / 선택(Decision) / 포기한 옵션(Considered Alternatives) / 근거(Rationale) / 결과(Consequences) 구조를 따른다.

UI 컴포넌트·테마 토큰·imperative 호스트 등 디자인 시스템 레벨의 결정은 별도 저장소 `@junkwon91/rn-design-system`의 `DECISIONS.md`에 있다. 이 문서는 그 라이브러리를 **소비하는 앱** 관점의 결정만 다룬다.

---

## ADR-01: React Native 0.81 채택 (0.76 → 0.81)

- **상황**: 초기 계획은 RN 0.76. 그러나 사용할 라이브러리들의 peer 요구와 Google Play 정책에서 두 제약이 발견됨.
- **선택**: **RN 0.81.0 + React 19.x**.
- **포기한 옵션**: RN 0.76 (초기안), RN 0.78.
- **근거**:
  - Google Play가 2025-11-01부터 Android 15의 16KB 페이지 크기 지원을 의무화 → RN 0.76은 미지원이라 출시 불가, 0.78+ 필요.
  - `react-native-reanimated@4`의 peer 범위가 `"0.81 - 0.85"` → 0.78도 미충족.
  - `victory-native@41` + `@shopify/react-native-skia@2`가 React 19 요구 → RN 0.81이 React 19를 처음 동반.
  - `react-native-mmkv@4`(NitroModules)·`react-native-screens@4`·`@react-navigation@7`도 0.78+ 요구.
- **결과**: 버전은 "최신"이 아니라 **사용할 라이브러리의 peer dep와 출시 정책에서 역산**해 결정됨. 0.81은 위 4개 제약을 동시에 만족하는 첫 버전.

---

## ADR-02: iOS deployment target 16.0 상향

- **상황**: RN 0.81 + 의존성 설치 후 iOS 첫 빌드 시 Xcode 16.2에서 CxxStdlib 모듈 관련 빌드 실패.
- **선택**: iOS deployment target을 **16.0**으로 상향(Podfile 강제).
- **포기한 옵션**: RN 기본 deployment target(13.4) 유지.
- **근거**: Xcode 16.2 툴체인이 일부 Pod에서 C++ stdlib 모듈을 요구 → 16.0 미만에서 모듈 해석 실패. 16.0은 2026년 시점 사용자 커버리지 손실이 미미.
- **결과**: iOS 16.0+ 기기 대상. Podfile에 명시적 platform 고정.

---

## ADR-03: 폴더 구조 — `lotto/LottoStats/` 분리 (Option B)

- **상황**: RN 프로젝트 초기화 시, `lotto/` 루트에 이미 Figma 작업 산출물 `DESIGN.md`가 존재했음.
- **선택**: `lotto/`를 RN 루트로 쓰지 않고 한 단계 내려 **`lotto/LottoStats/`를 RN 루트**로 생성.
- **포기한 옵션**: `lotto/`를 곧장 RN 루트로 사용(Option A) — 기존 `DESIGN.md`를 백업·복원해야 함.
- **근거**: 기존 자산 무손실 보존이 우선. 폴더 깊이 +1단계 비용보다 백업 누락 위험 회피가 가치 큼.
- **결과**: `lotto/`는 git 저장소가 아닌 컨테이너 폴더로 남음. `DESIGN.md`는 이후 소속 명확화를 위해 `LottoStats/docs/DESIGN.md`로 이동(앱 전용 디자인 명세이므로).

---

## ADR-04: UI 컴포넌트를 외부 디자인 시스템 라이브러리로 분리

- **상황**: 초기에는 Screen·Card·Button·IconButton·Input·DataTable·Toast·Dialog 등 UI 컴포넌트를 앱 `src/components/` 안에 직접 구현했음.
- **선택**: 자체 컴포넌트 전량을 **`@junkwon91/rn-design-system`**(별도 저장소)으로 추출하고, 앱은 이를 의존성으로 설치해 **re-export만** 한다. 버전은 **GitHub 태그 `v2.0.0`로 고정**.
- **포기한 옵션**: 앱 내부 컴포넌트 유지, npm 레지스트리 배포(미배포 — GitHub 태그 설치).
- **근거**:
  - 디자인 시스템은 Figma Variable Library와 1:1 정합이 목표라 앱 도메인 로직과 변경 주기·관심사가 다름 → 별도 패키지가 적합.
  - 라이브러리화로 컴포넌트는 자체 ADR/문서/스크린샷으로 독립 관리, 앱은 **도메인 기능에 집중**.
  - 태그 고정으로 라이브러리 변경이 앱 빌드에 무단 반영되는 것을 차단.
- **결과**:
  - `src/components/{primitives,surface,action,input,display,list,feedback}/index.ts`는 전부 라이브러리 re-export.
  - 앱 측에 남길 도메인 컴포넌트는 `components/lotto/`(로또 공 등), `components/charts/`(통계 차트)로 한정.
  - 이 결정으로 컴포넌트 제작 과정 기록은 라이브러리 저장소의 ADR로 이관됨 → 앱 docs의 컴포넌트 devlog는 폐기(ADR-09).

---

## ADR-05: 테마를 라이브러리 토큰 베이스로 슬림화 + 로또 도메인 토큰만 유지

- **상황**: ADR-04로 컴포넌트가 라이브러리로 이동하면서, 앱이 들고 있던 전체 테마 토큰이 라이브러리 `AppTheme`과 중복됨.
- **선택**: 앱 테마는 라이브러리의 `lightTheme`/`darkTheme`을 **베이스로 삼고**, 로또 도메인 전용 토큰만 확장한다 — `state.hot`/`state.cold`(통계 강조), `ball.{yellow,blue,red,gray,green,onLight,onDark}`(번호대별 공 색).
- **포기한 옵션**: 앱이 전체 토큰 자체 보유(라이브러리와 이중 관리).
- **근거**: 공통 토큰은 라이브러리 단일 소스에서 관리하고, 앱은 라이브러리에 없는 도메인 의미(hot/cold, 공 색상)만 더한다. styled-components `DefaultTheme`은 라이브러리 `AppTheme`을 확장한 앱 `LottoTheme`으로 보강해 타입 세이프 유지.
- **근거(타입)**: 도메인 토큰도 `lightColors`/`darkColors` 두 모드를 동일 인터페이스로 정의 — `as const`로 좁히면 두 모드가 서로 다른 리터럴 타입이 되어 ThemeProvider에 양쪽 전달이 깨지므로, 명시적 인터페이스(`ColorsShape` 패턴)로 구조만 강제하고 값은 string으로 둠.
- **결과**: 로또 공 색 매핑(1–10 yellow / 11–20 blue / 21–30 red / 31–40 gray / 41–45 green, 대비 텍스트 onLight/onDark)이 도메인 토큰으로 단일화됨.

---

## ADR-06: 백엔드 없이 GitHub raw JSON을 데이터 소스로 사용

- **상황**: 매주 갱신되는 당첨번호 데이터를 앱에 공급해야 함. 자체 API 서버 운영은 비용·인증·유지보수 부담.
- **선택**: 데이터를 **별도 저장소 `JunKwon91/lotto-data`**에 정적 JSON으로 두고, 앱은 그 **GitHub raw URL**을 직접 fetch한다. 크롤링·갱신은 별도 프로젝트(`LottoStatsDataPrep`)가 GitHub Actions로 수행.
- **포기한 옵션**: 앱 저장소에 데이터 동봉(매주 새 빌드·스토어 심사 필요), AWS Lambda/자체 서버 cron(인프라·비용).
- **근거**:
  - 데이터를 앱과 분리하면 새 회차마다 **앱 재배포 불필요** — 데이터 저장소만 갱신.
  - GitHub raw URL이 CDN·무인증·무료 호스팅을 대신함 → 이 URL 한 줄이 사실상 "API 서버".
  - 데이터 생산(크롤러)과 소비(앱)가 JSON 스키마로만 결합 → 각자 독립 진화.
- **결과**: 앱 측 계약은 `src/config/api.ts`의 `LOTTO_DATA_URL` + `src/types/lotto.ts`의 스키마(`drawNo/date/numbers/bonusNo`). 스키마 변경 시 크롤러와 동시 수정 필요.

---

## ADR-07: MMKV 캐시 + TanStack Query 2단 로딩 전략

- **상황**: 네트워크 의존 데이터를 매 진입마다 받으면 오프라인·깜빡임 문제. 1,200+ 회차는 한 번 받으면 과거분은 불변.
- **선택**: **MMKV 영구 캐시 + TanStack Query** 조합으로 2단 분리.
  - Splash: `loadInitialLottoData()` — 캐시 있으면 즉시 반환(오프라인 OK), 없으면 fetch 강제.
  - 메인 이후: `useLottoData()` — 백그라운드 동기화(`syncLottoData()`), fetch 실패 시 기존 캐시 반환. `staleTime` 1h / `gcTime` 7d / retry 2.
- **포기한 옵션**: 매 진입 강제 fetch(오프라인 불가·깜빡임), AsyncStorage(성능), 캐시 없이 메모리만(앱 재시작 시 손실).
- **근거**: 과거 회차 불변성 덕에 캐시 우선이 안전. MMKV는 동기 read라 Splash에서 즉시 분기 가능. 실패 시 캐시 폴백으로 UI 연속성 유지.
- **결과**: `services/lottoHistoryLoader.ts`(오케스트레이션) + `storage/lottoStorage.ts`(MMKV) + `hooks/queries/useLottoData.ts`(Query) 3층 구조. `CachedLottoData`에 `cachedAt` 추가로 stale 판단.

---

## ADR-08: 타입 세이프 네비게이션 (Bottom Tab + Native Stack)

- **상황**: 9개 화면을 메인 탭과 서브 스택으로 구성하면서 라우트 파라미터 타입 안전성 필요.
- **선택**: `@react-navigation` 7 — `RootNavigator`(NativeStack) 안에 `MainTabNavigator`(BottomTab) 중첩. `RootStackParamList`/`MainTabParamList` 정의 + 네임스페이스 augmentation.
- **포기한 옵션**: 단일 스택, 파라미터 타입 비명시(런타임 의존).
- **근거**: ParamList augmentation으로 `useNavigation`/`route.params`가 화면별 자동 추론 → 잘못된 라우트명·파라미터를 컴파일타임에 차단.
- **결과**: 메인 탭(Home/Statistics/Recommend/Favorites) + 서브(RoundDetail{round}/RoundList/StatsDetail{type}/FavoriteAdd/Settings). `navigation/types.ts`가 단일 소스.

---

## ADR-09: 문서화 방식 — 연대기 devlog 폐기, ADR 채택

- **상황**: 초기에는 작업을 시간순 devlog(`01-project-setup` ~ `05-iconbutton…`)로 기록. 그러나 `03~05`(Screen/Button/IconButton)는 ADR-04로 라이브러리에 이관된 컴포넌트를 서술해 코드와 불일치했고, 그 제작 기록은 이미 라이브러리 저장소의 ADR로 더 잘 남아 있어 이중 잉여가 됨.
- **선택**: **연대기 devlog 폐기**, 라이브러리와 동일한 **ADR(목적별 의사결정) 방식**을 본 `DECISIONS.md`로 채택. `03~05`는 삭제.
- **포기한 옵션**: devlog 유지(코드 변경 시 추적 단절), 03~05만 라이브러리로 이동(이미 ADR로 존재해 불필요).
- **근거**: ADR은 "왜 이 선택을 했나"를 코드 변경과 무관하게 보존 → 유지보수·재개 시 설계 원칙 추적이 끊기지 않음. 라이브러리가 같은 방식으로 검증됨.
- **결과**: `01-project-setup`·`02-data-pipeline`의 핵심 결정은 ADR-01·02·03·05·06·07로 흡수. 두 원본 문서는 서사형 1차 자료로 당분간 보존하되, 신규 결정은 모두 이 `DECISIONS.md`에 ADR로 추가한다.

---

## ADR-10: 카드 스타일 사용 규칙 — 리스트=Filled, 패널=Outlined

- **상황**: v2 화면들의 카드 스타일이 제각각이었다 — 테두리 유/무 혼재, `border/divider` vs `border/subtle` 혼용, radius 12/14/16 혼용. 카드가 컴포넌트화되지 않아 화면마다 프레임을 개별로 그렸기 때문. 한편 Figma는 퍼블리시된 인스턴스 안에 임의 자식(공·차트)을 중첩할 수 없어, 콘텐츠가 든 카드를 DS Card 인스턴스로 직접 만들 수 없다.
- **선택**: DS Card의 두 Variant(라이브러리 ADR-41)를 기준으로 앱 카드를 용도별로 통일한다.
  - **Filled(무테)** — 반복되는 리스트 항목: 최근 당첨 내역, RoundList 회차, Favorites 조합, Recommend 알고리즘 옵션.
  - **Outlined(테두리)** — 독립 정보 패널: 당첨결과 Hero·TOP5, Statistics/StatsDetail 분석 카드, RoundDetail 당첨번호·테이블, Recommend 최근 추이, FavoriteAdd 선택 카드.
  - 공통 스펙: fill `surface/container` · radius 16 · Outlined는 `border/subtle` 1px.
  - 콘텐츠 카드(공·차트 포함)는 인스턴스 대신 이 스펙에 맞춘 프레임으로 구성(스펙-매칭).
  - Settings 그룹은 리스트 컨테이너라 Filled 유지.
- **포기한 옵션**: 전부 한 스타일로 통일(전부 Outlined면 리스트가 시끄럽고, 전부 Filled면 패널 경계 상실), DS Card 인스턴스로 전면 교체(Figma 콘텐츠 중첩 제약으로 불가).
- **근거**: 테두리 유무에 "독립 패널 vs 반복 리스트"라는 의미를 부여하면 신규 화면에서도 고민 없이 자동 결정된다. 반복 리스트는 간격+반복이 이미 그룹을 형성하므로 테두리가 불필요하고, 패널은 테두리로 경계를 잡아준다.
- **결과**: 전 화면(9개) 카드 시각 일관화. 규칙은 Figma Foundations "Card 사용 규칙" 패턴 섹션과 `docs/DESIGN.md`의 Cards 섹션에도 기재. variant 자체의 정의·근거는 라이브러리 ADR-41.
