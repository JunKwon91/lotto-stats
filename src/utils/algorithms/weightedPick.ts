// ============================================================================
// 가중 추출 — 번호 6개를 가중치대로 뽑기
// ============================================================================
//
// weights[n] = 번호 n(1~45)의 상대 가중치. 6개를 서로 다르게 순차 추출하며,
// 뽑은 번호는 남은 풀에서 제외한다(비복원). 균등 추출은 모든 가중치를 같게 둔
// 특수 경우다. rng를 주입받아 테스트에서 재현 가능하게 한다
// ============================================================================

const PICK = 6;
const LOW = 1;
const HIGH = 45;

/** 0 이상 1 미만 난수 생성기 (기본 Math.random, 테스트는 시드 RNG 주입) */
export type Rng = () => number;

/**
 * weights[n](n=1~45, 인덱스 0 미사용)에 비례해 6개 번호를 비복원 추출한다.
 * 오름차순 정렬해 반환. 남은 가중치 합이 0이면 남은 번호에서 앞부터 채운다
 */
export function weightedPick(weights: number[], rng: Rng = Math.random): number[] {
  const remaining: number[] = [];
  for (let n = LOW; n <= HIGH; n++) remaining.push(n);

  const picked: number[] = [];
  for (let k = 0; k < PICK; k++) {
    const total = remaining.reduce((acc, n) => acc + weights[n], 0);
    // 기본값 0 — 가중치 합이 0이거나 부동소수 오차로 못 고르면 남은 첫 번호
    let chosenIdx = 0;
    if (total > 0) {
      let x = rng() * total;
      for (let i = 0; i < remaining.length; i++) {
        x -= weights[remaining[i]];
        if (x <= 0) {
          chosenIdx = i;
          break;
        }
      }
    }
    picked.push(remaining[chosenIdx]);
    remaining.splice(chosenIdx, 1);
  }
  return picked.sort((a, b) => a - b);
}

/** 1~45 균등 6개 비복원 추출, 오름차순 */
export function uniformPick(rng: Rng = Math.random): number[] {
  const remaining: number[] = [];
  for (let n = LOW; n <= HIGH; n++) remaining.push(n);

  const picked: number[] = [];
  for (let k = 0; k < PICK; k++) {
    const i = Math.floor(rng() * remaining.length);
    picked.push(remaining[i]);
    remaining.splice(i, 1);
  }
  return picked.sort((a, b) => a - b);
}
