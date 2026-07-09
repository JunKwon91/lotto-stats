# LottoStats

한국 로또 6/45 통계 분석·번호 추천 앱

## 정체성

이 앱은 "당첨 예측 앱"이 아닌 "통계 분석 도구"입니다.

로또 6/45는 수학적으로 예측 불가능합니다.

- 각 회차는 독립 사건
- 1등 확률: 1 / 8,145,060

이 앱은 통계 분석과 시각화를 통해 데이터로 정직하게 말합니다.

## 기술 스택

- React Native 0.81 / TypeScript / React 19
- Zustand (UI state) / TanStack Query (server state)
- MMKV 4 + NitroModules (영구 저장소)
- Styled Components / Reanimated 4 + Worklets / FlashList
- react-native-svg (차트·아이콘)
- React Navigation 7
- Lucide Icons

## 화면 구성

메인 화면 (Bottom Tab):

- Home / Statistics / Recommend / Favorites

서브 화면 (Stack):

- Round Detail / Round List / Stats Detail / Favorite Add / Settings

## 추천 알고리즘 5가지

1. Hot - 자주 나온 번호
2. Cold - 오래 안 나온 번호
3. Pattern - 통계 패턴 기반
4. Balanced - Hot + Cold 균형
5. Random - 완전 무작위

## 데이터 소스

동행복권 공식 API (회차별 당첨 번호)

## 개발 일정

2026.05.07 ~ 진행 중

## 빌드

```bash
# 메트로 번들러
npm start

# iOS (시뮬레이터)
npm run ios

# Android
npm run android
```
