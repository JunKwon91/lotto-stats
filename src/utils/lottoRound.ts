// ============================================================================
// 회차 자동 계산
// ============================================================================
//
// 한국 로또 6/45는 매주 토요일 20:35 KST에 1회씩 추첨.
// 1회차는 2002-12-07 (토) 20:35.
// 따라서 (현재 시각 - 1회차 시각) / 1주 + 1 = 현재 회차.
// ============================================================================

// 1회차 추첨 시각 (KST). +09:00 명시로 timezone 무관 절대 시각.
const FIRST_DRAW_DATE_KST = new Date('2002-12-07T20:35:00+09:00');

const MS_PER_WEEK = 1000 * 60 * 60 * 24 * 7;

/**
 * 현재 시점 기준 가장 최신의 "추첨 완료된" 회차 번호를 계산.
 *
 * 추첨 시각(토 20:35) 이전이면 그 주는 미반영. 예: 토요일 14:00에 호출하면
 * 그 주 추첨이 아직 안 일어났으므로 지난 주 회차가 반환됨.
 */
export function calculateLatestRound(now: Date = new Date()): number {
  const diffMs = now.getTime() - FIRST_DRAW_DATE_KST.getTime();
  // 1회차 추첨 시각 이전 (개발 환경에서 시계 밀어 테스트 시 발생 가능)
  if (diffMs < 0) return 0;
  // floor(주 수) + 1 → 1회차부터 카운트
  return Math.floor(diffMs / MS_PER_WEEK) + 1;
}

// 회차 상태 — 우리 데이터에 있는지/이론상 발생했는지로 분기
export type RoundStatus =
  | { status: 'available'; round: number }    // 데이터에 존재
  | { status: 'collecting'; round: number }   // 추첨은 됐지만 아직 데이터 미수집
  | { status: 'pending'; round: number };     // 추첨 자체가 아직 안 일어남

/**
 * 특정 회차의 가용성 분류.
 * @param round       조회하려는 회차
 * @param latestInData 우리 데이터에 들어있는 가장 최신 회차 (LottoHistoryData.latestRound)
 */
export function getRoundStatus(
  round: number,
  latestInData: number,
): RoundStatus {
  // 데이터에 들어있는 회차는 즉시 사용 가능
  if (round <= latestInData) {
    return { status: 'available', round };
  }
  const calculated = calculateLatestRound();
  // 이론상으로도 추첨이 아직 안 된 미래 회차
  if (round > calculated) {
    return { status: 'pending', round };
  }
  // 추첨은 됐지만 우리 데이터엔 없음 — 토요일 밤 추첨 직후 ~ 데이터 갱신 전 사이
  return { status: 'collecting', round };
}
