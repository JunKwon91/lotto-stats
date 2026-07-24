// 추천 알고리즘 — 순수 함수 + rng 주입 구조라 시드를 고정하면 결과가 재현된다.
// 무작위에 기대지 않도록 모든 테스트가 결정적 rng를 쓴다.

import type { LottoRound } from '@/types/lotto';
import {
  bandCount,
  hasConsecutive,
  oddCount,
  sortAscending,
  sumOf,
} from '@/utils/algorithms/predicates';
import {
  generateBalanced,
  generateCold,
  generateHot,
  generatePattern,
  generateRandom,
  generateRecommendation,
} from '@/utils/algorithms/recommend';
import { uniformPick, weightedPick } from '@/utils/algorithms/weightedPick';

// 선형 합동 생성기(Park-Miller) — 시드가 같으면 같은 수열이라 테스트가 흔들리지 않는다
function seededRng(seed: number): () => number {
  const M = 2147483647;
  let s = seed % M;
  if (s <= 0) s += M - 1;
  return () => {
    s = (s * 16807) % M;
    return (s - 1) / (M - 1);
  };
}

const round = (drawNo: number, numbers: number[]): LottoRound => ({
  drawNo,
  date: '2024-01-06',
  numbers,
  bonusNo: 45,
});

const rounds = [
  round(1, [1, 2, 3, 4, 5, 6]),
  round(2, [1, 2, 3, 7, 8, 9]),
  round(3, [10, 20, 30, 40, 44, 45]),
];

// 세트 공통 계약: 6개·중복 없음·오름차순·1~45
function expectValidSet(set: number[]) {
  expect(set).toHaveLength(6);
  expect(new Set(set).size).toBe(6);
  expect([...set].sort((a, b) => a - b)).toEqual(set);
  expect(Math.min(...set)).toBeGreaterThanOrEqual(1);
  expect(Math.max(...set)).toBeLessThanOrEqual(45);
}

describe('predicates', () => {
  it('sortAscending은 원본을 바꾸지 않는다', () => {
    const nums = [3, 1, 2];
    expect(sortAscending(nums)).toEqual([1, 2, 3]);
    expect(nums).toEqual([3, 1, 2]);
  });

  it('hasConsecutive는 정렬 여부와 무관하게 판단한다', () => {
    expect(hasConsecutive([1, 3, 5])).toBe(false);
    expect(hasConsecutive([5, 1, 2])).toBe(true);
  });

  it('bandCount는 걸쳐 있는 색 밴드 수를 센다', () => {
    expect(bandCount([1, 11, 21, 31, 41])).toBe(5);
    expect(bandCount([1, 2, 3])).toBe(1);
    expect(bandCount([10, 11])).toBe(2); // 밴드 경계
  });

  it('oddCount와 sumOf', () => {
    expect(oddCount([1, 2, 3, 4, 5, 6])).toBe(3);
    expect(sumOf([1, 2, 3, 4, 5, 6])).toBe(21);
  });
});

describe('uniformPick / weightedPick', () => {
  it('uniformPick은 6개를 오름차순 비복원 추출한다', () => {
    expectValidSet(uniformPick(seededRng(7)));
  });

  it('rng가 항상 0이면 앞에서부터 채운다', () => {
    expect(uniformPick(() => 0)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('weightedPick도 세트 계약을 지킨다', () => {
    const weights = new Array(46).fill(1);
    expectValidSet(weightedPick(weights, seededRng(7)));
  });

  it('가중치가 몰리면 그 번호가 먼저 뽑힌다', () => {
    // 40번에만 가중치 → 첫 추출은 40, 이후 가중치 합이 0이라 남은 앞 번호로 채운다
    const weights = new Array(46).fill(0);
    weights[40] = 1;
    expect(weightedPick(weights, () => 0.5)).toEqual([1, 2, 3, 4, 5, 40]);
  });

  it('같은 시드면 같은 결과 (재현성)', () => {
    const weights = new Array(46).fill(1);
    expect(weightedPick(weights, seededRng(99))).toEqual(
      weightedPick(weights, seededRng(99)),
    );
  });
});

describe('추천 알고리즘 5종', () => {
  it('요청한 개수만큼 유효한 세트를 만든다', () => {
    const sets = generateRandom(3, seededRng(1));
    expect(sets).toHaveLength(3);
    sets.forEach(expectValidSet);
  });

  it('count가 0 이하여도 최소 1세트를 낸다', () => {
    expect(generateRandom(0, seededRng(1))).toHaveLength(1);
  });

  it('Hot/Cold도 세트 계약을 지킨다', () => {
    generateHot(rounds, 3, seededRng(2)).forEach(expectValidSet);
    generateCold(rounds, 3, seededRng(3)).forEach(expectValidSet);
  });

  it('Pattern은 연속 1쌍 + 3밴드 이상을 만족한다', () => {
    generatePattern(rounds, 20, seededRng(11)).forEach(set => {
      expectValidSet(set);
      expect(hasConsecutive(set)).toBe(true);
      expect(bandCount(set)).toBeGreaterThanOrEqual(3);
    });
  });

  it('Balanced는 홀짝 2~4 + 합계 105~175를 만족한다', () => {
    generateBalanced(rounds, 20, seededRng(13)).forEach(set => {
      expectValidSet(set);
      expect(oddCount(set)).toBeGreaterThanOrEqual(2);
      expect(oddCount(set)).toBeLessThanOrEqual(4);
      expect(sumOf(set)).toBeGreaterThanOrEqual(105);
      expect(sumOf(set)).toBeLessThanOrEqual(175);
    });
  });

  it('같은 시드면 같은 조합 (재현성)', () => {
    expect(generateHot(rounds, 3, seededRng(42))).toEqual(
      generateHot(rounds, 3, seededRng(42)),
    );
  });

  it('빈 회차 입력에서도 깨지지 않는다', () => {
    generateHot([], 1, seededRng(5)).forEach(expectValidSet);
    generateCold([], 1, seededRng(5)).forEach(expectValidSet);
  });
});

describe('generateRecommendation', () => {
  const types = ['hot', 'cold', 'pattern', 'balanced', 'random'] as const;

  it.each(types)('%s 타입을 실행한다', type => {
    const sets = generateRecommendation(type, rounds, 2, seededRng(17));
    expect(sets).toHaveLength(2);
    sets.forEach(expectValidSet);
  });

  it('타입별 디스패치가 해당 함수와 같은 결과를 낸다', () => {
    expect(generateRecommendation('random', rounds, 2, seededRng(21))).toEqual(
      generateRandom(2, seededRng(21)),
    );
  });
});
