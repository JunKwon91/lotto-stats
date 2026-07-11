// ============================================================================
// 추천 알고리즘 — 통계 기반 번호 조합 생성
// ============================================================================
//
// "예측"이 아니라 과거 데이터의 경향을 반영한 조합을 제안한다(당첨 보장 아님 —
// 고지는 화면 문구가 맡는다). 5종 모두 순수 함수이며 (rounds, count) → 세트 배열을
// 낸다. 각 세트는 6개 서로 다른 번호·오름차순·1~45. rng를 주입하면 재현 가능하다
//
//   Hot/Cold  : 빈도·미출현 가중(넘겨받은 회차 전체 기준)으로 뽑는다
//   Pattern   : 연속 1쌍 + 3밴드 이상을 만족할 때까지 균등 재추출(rejection)
//   Balanced  : 홀짝 2~4 + 합계 105~175를 만족할 때까지 균등 재추출
//   Random    : 순수 균등
// ============================================================================

import type { LottoRound } from '@/types/lotto';
import { getNumberFrequency, getNumberGaps } from '@/utils/statistics';

import { bandCount, hasConsecutive, oddCount, sumOf } from './predicates';
import { type Rng, uniformPick, weightedPick } from './weightedPick';

const HIGH = 45;

// 가중 하한 — 최소값 번호도 완전히 배제되지 않게 바닥을 둔다(극단비 1 : 0.1)
const WEIGHT_FLOOR = 0.1;

// rejection 최대 시도 — 초과 시 마지막 결과를 그대로 쓴다. 조건 충족률이 50%대라
// 사실상 발동하지 않지만 무한 루프를 막는 안전장치
const MAX_ATTEMPTS = 20;

// Balanced 합계 허용 구간 — 실데이터 평균 138·표준편차 31의 ±1σ 근사
const SUM_MIN = 105;
const SUM_MAX = 175;

// Balanced 홀수 개수 허용 범위 — 3:3 / 4:2 / 2:4 (홀수 2~4개)
const ODD_MIN = 2;
const ODD_MAX = 4;

export type RecommendType = 'hot' | 'cold' | 'pattern' | 'balanced' | 'random';

/**
 * 지표값 배열(values[n], n=1~45)을 가중치로 변환한다.
 * weight = FLOOR + (1-FLOOR) × (v-min)/(max-min). 전부 같으면 균등(모두 FLOOR)
 */
function toWeights(values: number[]): number[] {
  let min = Infinity;
  let max = -Infinity;
  for (let n = 1; n <= HIGH; n++) {
    if (values[n] < min) min = values[n];
    if (values[n] > max) max = values[n];
  }
  const span = max - min;

  const weights = new Array(HIGH + 1).fill(0);
  for (let n = 1; n <= HIGH; n++) {
    const norm = span > 0 ? (values[n] - min) / span : 0;
    weights[n] = WEIGHT_FLOOR + (1 - WEIGHT_FLOOR) * norm;
  }
  return weights;
}

// count개 세트를 만든다 — 세트 간 중복은 허용(각 세트는 독립)
function generateSets(count: number, make: () => number[]): number[][] {
  const sets: number[][] = [];
  const n = Math.max(1, count);
  for (let i = 0; i < n; i++) sets.push(make());
  return sets;
}

// 조건을 만족할 때까지 균등 재추출, MAX_ATTEMPTS 초과 시 마지막 결과 반환
function rejectionPick(rng: Rng, accept: (nums: number[]) => boolean): number[] {
  let nums = uniformPick(rng);
  let attempts = 1;
  while (!accept(nums) && attempts < MAX_ATTEMPTS) {
    nums = uniformPick(rng);
    attempts++;
  }
  return nums;
}

/** 빈도 가중 — 자주 나온 번호가 유리하되 극단은 아니게 */
export function generateHot(
  rounds: LottoRound[],
  count = 1,
  rng: Rng = Math.random,
): number[][] {
  const values = new Array(HIGH + 1).fill(0);
  for (const { number, count: freq } of getNumberFrequency(rounds)) {
    values[number] = freq;
  }
  const weights = toWeights(values);
  return generateSets(count, () => weightedPick(weights, rng));
}

/** 미출현 가중 — 오래 안 나온 번호가 유리(Hot과 대칭) */
export function generateCold(
  rounds: LottoRound[],
  count = 1,
  rng: Rng = Math.random,
): number[][] {
  const values = new Array(HIGH + 1).fill(0);
  for (const { number, gap } of getNumberGaps(rounds)) {
    values[number] = gap;
  }
  const weights = toWeights(values);
  return generateSets(count, () => weightedPick(weights, rng));
}

/** 연속 1쌍 이상 + 3밴드 이상 분포 (rounds는 시그니처 통일용, 검사엔 불필요) */
export function generatePattern(
  _rounds: LottoRound[],
  count = 1,
  rng: Rng = Math.random,
): number[][] {
  return generateSets(count, () =>
    rejectionPick(rng, nums => hasConsecutive(nums) && bandCount(nums) >= 3),
  );
}

/** 홀짝 2~4 + 합계 105~175 (rounds는 시그니처 통일용) */
export function generateBalanced(
  _rounds: LottoRound[],
  count = 1,
  rng: Rng = Math.random,
): number[][] {
  return generateSets(count, () =>
    rejectionPick(rng, nums => {
      const odd = oddCount(nums);
      const s = sumOf(nums);
      return odd >= ODD_MIN && odd <= ODD_MAX && s >= SUM_MIN && s <= SUM_MAX;
    }),
  );
}

/** 순수 균등 */
export function generateRandom(count = 1, rng: Rng = Math.random): number[][] {
  return generateSets(count, () => uniformPick(rng));
}

/** 타입으로 알고리즘을 골라 실행 */
export function generateRecommendation(
  type: RecommendType,
  rounds: LottoRound[],
  count = 1,
  rng: Rng = Math.random,
): number[][] {
  switch (type) {
    case 'hot':
      return generateHot(rounds, count, rng);
    case 'cold':
      return generateCold(rounds, count, rng);
    case 'pattern':
      return generatePattern(rounds, count, rng);
    case 'balanced':
      return generateBalanced(rounds, count, rng);
    case 'random':
      return generateRandom(count, rng);
  }
}
