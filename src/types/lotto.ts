// ============================================================================
// 로또 도메인 타입
// ============================================================================
//
// 데이터 흐름:
//   원격 lotto-history.json (LottoHistoryData)
//     → MMKV에 저장될 때 cachedAt 추가 (CachedLottoData)
//     → 컴포넌트에서 data 배열 사용 (LottoRound[])
// ============================================================================

// 한 회차의 추첨 결과
export interface LottoRound {
  drawNo: number;      // 회차 번호 (1, 2, 3, ...)
  date: string;        // ISO 8601 날짜 부분만 — 예: "2024-04-13"
  numbers: number[];   // 당첨 번호 6개 (오름차순)
  bonusNo: number;     // 보너스 번호
}

// 원격 서버가 반환하는 전체 응답 구조
export interface LottoHistoryData {
  updatedAt: string;       // 데이터 갱신 시각 (서버 측 ISO)
  latestRound: number;     // data 배열 마지막 drawNo와 같음 (캐싱 시 빠른 조회용)
  data: LottoRound[];      // 1회차 ~ 최신 회차까지
}

// MMKV에 저장될 때의 구조 — 클라이언트가 캐시한 시각을 추가로 기록
export interface CachedLottoData extends LottoHistoryData {
  cachedAt: string;        // 클라이언트가 저장한 시각 (이걸로 stale 여부 판단)
}
