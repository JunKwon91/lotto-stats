// ============================================================================
// 자동 비교 — 저장 조합 vs 실제 당첨 회차
// ============================================================================
//
// 저장한 번호 6개를 특정 회차의 당첨번호(+보너스)와 맞춰 등수를 낸다. 대상 회차는
// 저장 이후 처음 추첨된 회차로 본다(당첨은 저장 뒤에 나오므로 "볼 때 계산").
// 순수 함수 — 회차 배열의 정렬은 가정하지 않는다.
// ============================================================================

import type { LottoRound } from '@/types/lotto';

// 추첨 시각 = 토 20:35 KST. 회차 date는 날짜뿐이라, 같은 날 추첨 전/후 저장을
// 구분하려면 이 시각을 붙여 절대 시각으로 비교한다(lottoRound.ts와 같은 기준).
const DRAW_TIME_KST = 'T20:35:00+09:00';

export interface MatchResult {
  /** 당첨번호 6개와 겹친 개수 (0~6) */
  matchCount: number;
  /** 보너스 번호가 포함됐는지 */
  bonusMatch: boolean;
  /** 등수 1~5, 낙첨이면 null */
  rank: number | null;
}

// 매칭 개수·보너스 → 등수. 6=1등 / 5+보너스=2등 / 5=3등 / 4=4등 / 3=5등 / 그 외 낙첨
function rankOf(matchCount: number, bonusMatch: boolean): number | null {
  if (matchCount === 6) return 1;
  if (matchCount === 5) return bonusMatch ? 2 : 3;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 5;
  return null;
}

/**
 * 저장 조합 picks를 draw 회차와 비교해 매칭 개수·보너스·등수를 낸다.
 * bonusMatch는 5개 일치일 때만 등수(2등)에 영향을 준다.
 */
export function matchLotto(picks: number[], draw: LottoRound): MatchResult {
  const winning = new Set(draw.numbers);
  let matchCount = 0;
  for (const n of picks) {
    if (winning.has(n)) matchCount++;
  }
  const bonusMatch = picks.includes(draw.bonusNo);
  return { matchCount, bonusMatch, rank: rankOf(matchCount, bonusMatch) };
}

/**
 * 저장 시각(createdAt) 이후 처음 추첨된 회차를 찾는다.
 * 추첨 시각(date + 20:35 KST)이 createdAt보다 늦은 회차 중 가장 이른 것.
 * 아직 없으면 null(다음 추첨 대기).
 */
export function getTargetRound(
  createdAt: string,
  rounds: LottoRound[],
): LottoRound | null {
  const savedAt = new Date(createdAt).getTime();

  let target: LottoRound | null = null;
  let targetTime = Infinity;
  for (const round of rounds) {
    const drawTime = new Date(round.date + DRAW_TIME_KST).getTime();
    if (drawTime > savedAt && drawTime < targetTime) {
      target = round;
      targetTime = drawTime;
    }
  }
  return target;
}
