// ============================================================================
// 통계 집계 — 당첨번호 통계 계산
// ============================================================================
//
// 회차 배열(rounds)을 받아 순수 계산 결과만 반환하는 함수 모음
// 범위 선택(최근 N회/전체)은 호출처가 배열을 잘라 넘긴다 — 여기서는 범위를 모름
// 빈도·미출현·홀짝·합계는 당첨번호 6개만 다루고 보너스는 제외한다(통계 관례,
// "빈도 합 = 회차수 × 6" 같은 항등식도 보너스 제외 기준)
// 입력 rounds의 정렬 상태는 가정하지 않는다(필요하면 drawNo로 판단)
//
// 각 함수는 rounds를 한두 번 선형 순회하는 O(회차수) 계산이다. 번호는 1~45로
// 고정이라, 카운트 배열의 인덱스로 번호를 그대로 쓰려고 길이를 46(0번 미사용)으로
// 잡는 패턴을 공통으로 쓴다
// ============================================================================

import type { LottoRound } from '@/types/lotto';

const LOW = 1;
const HIGH = 45;

// ----------------------------------------------------------------------------
// 1. 번호별 출현 빈도
// ----------------------------------------------------------------------------

export interface NumberCount {
  number: number;
  count: number;
}

/**
 * 1~45 각 번호의 출현 횟수 (당첨번호 6개 기준, 보너스 제외)
 * 번호 오름차순 정렬된 45개 배열을 반환한다
 */
export function getNumberFrequency(rounds: LottoRound[]): NumberCount[] {
  // counts[n] = 번호 n의 누적 출현 횟수. 번호를 인덱스로 직접 쓰려고 46칸을
  // 잡고 0번은 비워 둔다
  const counts = new Array(HIGH + 1).fill(0);

  // 모든 회차의 당첨번호 6개를 훑으며 해당 번호 칸을 1씩 올린다
  for (const round of rounds) {
    for (const n of round.numbers) {
      // 범위(1~45) 밖 값은 방어적으로 무시 — 정상 데이터라면 발생하지 않음
      if (n >= LOW && n <= HIGH) counts[n]++;
    }
  }

  // 1~45를 순서대로 {number, count}로 펼쳐 반환 (인덱스 i → 번호 i+1)
  return Array.from({ length: HIGH }, (_, i) => ({
    number: i + 1,
    count: counts[i + 1],
  }));
}

/**
 * 출현 빈도 상위 n개. 동점은 번호 오름차순
 */
export function getTopNumbers(rounds: LottoRound[], n: number): NumberCount[] {
  // 전체 빈도(45개)를 count 내림차순으로 정렬해 앞에서 n개를 자른다
  // 같은 count면 번호 오름차순으로 고정 — 동점 순서가 호출마다 흔들리지 않게
  return getNumberFrequency(rounds)
    .sort((a, b) => b.count - a.count || a.number - b.number)
    .slice(0, Math.max(0, n));
}

/**
 * 출현 빈도 하위 n개. 동점은 번호 오름차순
 */
export function getBottomNumbers(
  rounds: LottoRound[],
  n: number,
): NumberCount[] {
  // 상위와 대칭 — count 오름차순, 동점은 번호 오름차순
  return getNumberFrequency(rounds)
    .sort((a, b) => a.count - b.count || a.number - b.number)
    .slice(0, Math.max(0, n));
}

// ----------------------------------------------------------------------------
// 2. 미출현 기간 (Cold)
// ----------------------------------------------------------------------------

export interface NumberGap {
  number: number;
  gap: number;
}

/**
 * 각 번호가 마지막으로 나온 뒤 지난 회차 수 (최신 회차 기준)
 * gap = 최신 drawNo - 마지막 등장 drawNo. 최신 회차에 나온 번호는 gap=0
 * 범위 내 한 번도 안 나온 번호는 시작 이전(earliest-1)에 마지막 등장한 것으로 봐
 * gap = 범위 길이가 된다. 번호 오름차순 정렬. 빈 입력이면 빈 배열
 */
export function getNumberGaps(rounds: LottoRound[]): NumberGap[] {
  // 기준이 되는 최신 회차가 없으면 gap을 정의할 수 없다
  if (rounds.length === 0) return [];

  // 입력이 정렬돼 있지 않을 수 있으므로 최신/최소 drawNo를 직접 훑어 구한다
  let latest = -Infinity;
  let earliest = Infinity;
  for (const round of rounds) {
    if (round.drawNo > latest) latest = round.drawNo;
    if (round.drawNo < earliest) earliest = round.drawNo;
  }

  // lastSeen[n] = 번호 n이 마지막으로 등장한 drawNo
  // 기준선을 earliest-1(범위 시작 바로 이전)로 초기화한다 — 이렇게 하면 범위 안에서
  // 한 번도 안 나온 번호의 gap이 "범위에 든 회차 수"로 자연스럽게 나온다
  //   gap = latest - (earliest - 1)
  const lastSeen = new Array(HIGH + 1).fill(earliest - 1);
  for (const round of rounds) {
    for (const n of round.numbers) {
      // 더 최신 회차에서 나왔다면 갱신 (max 비교라 입력 순서와 무관)
      if (n >= LOW && n <= HIGH && round.drawNo > lastSeen[n]) {
        lastSeen[n] = round.drawNo;
      }
    }
  }

  // 최신 회차와의 거리 = gap. 최신 회차에 나온 번호는 0, 오래 안 나올수록 커진다
  return Array.from({ length: HIGH }, (_, i) => ({
    number: i + 1,
    gap: latest - lastSeen[i + 1],
  }));
}

// ----------------------------------------------------------------------------
// 3. 홀짝 분포
// ----------------------------------------------------------------------------

export interface OddEvenBucket {
  /** 홀수 개수 (0~6) */
  oddCount: number;
  /** 해당 홀짝 구성이 나온 회차 수 */
  count: number;
  /** 전체 회차 대비 비율 (0~1) */
  ratio: number;
}

/**
 * 회차별 홀수 개수(0~6)를 집계. oddCount 오름차순 7개 배열을 반환한다
 */
export function getOddEvenDistribution(
  rounds: LottoRound[],
): OddEvenBucket[] {
  // buckets[k] = 당첨번호 중 홀수가 정확히 k개였던 회차 수 (k = 0~6, 7칸)
  const buckets = new Array(7).fill(0);
  for (const round of rounds) {
    // 홀수 개수를 세면 짝수는 6 - 홀수로 자동 결정된다
    const odd = round.numbers.filter(n => n % 2 === 1).length;
    if (odd >= 0 && odd <= 6) buckets[odd]++;
  }

  // ratio는 전체 회차 대비 비율. 회차 수 0이면 0으로 (0 나눗셈 방지)
  const total = rounds.length;
  return buckets.map((count, oddCount) => ({
    oddCount,
    count,
    ratio: total > 0 ? count / total : 0,
  }));
}

// ----------------------------------------------------------------------------
// 4. 합계 분포
// ----------------------------------------------------------------------------

export interface SumBucket {
  label: string;
  /** 구간 하한 (포함) */
  min: number;
  /** 구간 상한 (포함) */
  max: number;
  count: number;
  /** 전체 회차 대비 비율 (0~1) */
  ratio: number;
}

export interface SumDistribution {
  /** 최소 합계 */
  min: number;
  /** 최대 합계 */
  max: number;
  /** 평균 합계 */
  average: number;
  /** 표준편차 */
  stdDev: number;
  buckets: SumBucket[];
}

// 합계 구간 — Figma는 별도 구간 없이 평균/표준편차로 표현하므로, 평균(약 138)
// 주변을 30 간격으로 나눈 구간을 제안한다. 이론상 합계 범위는 21~255
// (최소 1+2+3+4+5+6=21, 최대 40+41+42+43+44+45=255)
const SUM_BUCKETS: readonly Pick<SumBucket, 'label' | 'min' | 'max'>[] = [
  { label: '99 이하', min: 0, max: 99 },
  { label: '100–129', min: 100, max: 129 },
  { label: '130–159', min: 130, max: 159 },
  { label: '160–189', min: 160, max: 189 },
  { label: '190 이상', min: 190, max: Number.MAX_SAFE_INTEGER },
];

function sumOf(round: LottoRound): number {
  return round.numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * 회차별 당첨번호 6개 합계의 분포와 통계값(min/max/avg/stdDev)
 * 빈 입력이면 통계값 0, 각 구간 count/ratio 0
 */
export function getSumDistribution(rounds: LottoRound[]): SumDistribution {
  // 빈 입력 — 구간 골격은 유지하되 값은 0으로 채워 반환 (호출처 분기 단순화)
  const emptyBuckets = SUM_BUCKETS.map(b => ({ ...b, count: 0, ratio: 0 }));
  if (rounds.length === 0) {
    return { min: 0, max: 0, average: 0, stdDev: 0, buckets: emptyBuckets };
  }

  // 회차별 합계를 한 번 계산해 재사용한다
  const sums = rounds.map(sumOf);
  const total = sums.length;
  const min = Math.min(...sums);
  const max = Math.max(...sums);
  const average = sums.reduce((acc, s) => acc + s, 0) / total;

  // 모집단 분산(÷N) — 표본분산(÷N-1)이 아니라 다룬 회차 전체를 모집단으로 본다
  const variance =
    sums.reduce((acc, s) => acc + (s - average) ** 2, 0) / total;
  const stdDev = Math.sqrt(variance);

  // 각 구간 count = [min, max] 범위(양끝 포함)에 든 합계의 개수
  const buckets = SUM_BUCKETS.map(def => {
    const count = sums.filter(s => s >= def.min && s <= def.max).length;
    return { ...def, count, ratio: count / total };
  });

  return { min, max, average, stdDev, buckets };
}
