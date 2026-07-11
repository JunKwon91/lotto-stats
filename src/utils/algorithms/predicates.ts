// ============================================================================
// 세트 술어 — 추천 번호 6개 한 세트에 대한 즉석 계산
// ============================================================================
//
// statistics의 집계 함수는 회차 배열(rounds)을 훑는 용도라, 갓 뽑은 6개 한 세트를
// 검사하는 데는 맞지 않는다. Pattern·Balanced의 rejection 조건 검사에 쓰는 가벼운
// 순수 헬퍼를 따로 둔다. 번호는 1~45, 한 세트는 6개를 가정한다
// ============================================================================

// 공 색 밴드 경계(1~10 … 41~45) — 구간 분포와 같은 기준
const BANDS: readonly (readonly [number, number])[] = [
  [1, 10],
  [11, 20],
  [21, 30],
  [31, 40],
  [41, 45],
];

/** 오름차순 정렬한 새 배열 (원본 불변) */
export function sortAscending(nums: number[]): number[] {
  return [...nums].sort((a, b) => a - b);
}

/** 연속한 두 번호(n, n+1)가 하나라도 있으면 true */
export function hasConsecutive(nums: number[]): boolean {
  const sorted = sortAscending(nums);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) return true;
  }
  return false;
}

/** 번호들이 걸쳐 있는 서로 다른 밴드 수 (1~5) */
export function bandCount(nums: number[]): number {
  const bands = new Set<number>();
  for (const n of nums) {
    const i = BANDS.findIndex(([lo, hi]) => n >= lo && n <= hi);
    if (i >= 0) bands.add(i);
  }
  return bands.size;
}

/** 홀수 개수 (0~6) */
export function oddCount(nums: number[]): number {
  return nums.filter(n => n % 2 === 1).length;
}

/** 6개 합계 */
export function sumOf(nums: number[]): number {
  return nums.reduce((acc, n) => acc + n, 0);
}
