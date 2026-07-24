// 통계 집계 유틸 — 순수 함수라 네이티브 모듈 없이 그대로 검증한다.
// 소수 회차로 손계산이 가능한 픽스처를 쓰고, 항등식(빈도 합 = 회차×6 등)도 함께 본다.

import type { LottoRound } from '@/types/lotto';
import {
  getBottomNumbers,
  getCoOccurrenceMatrix,
  getConsecutiveDistribution,
  getLastDigitDistribution,
  getNumberFrequency,
  getNumberGaps,
  getOddEvenDistribution,
  getRangeDistribution,
  getSumDistribution,
  getTopNumbers,
} from '@/utils/statistics';

const round = (
  drawNo: number,
  numbers: number[],
  bonusNo = 45,
  date = '2024-01-06',
): LottoRound => ({ drawNo, date, numbers, bonusNo });

// 1회차 [1..6], 2회차 [1,2,3,7,8,9] — 1·2·3이 2회, 4~9가 1회
const rounds = [round(1, [1, 2, 3, 4, 5, 6]), round(2, [1, 2, 3, 7, 8, 9])];

describe('getNumberFrequency', () => {
  it('1~45 전체를 번호 오름차순으로 반환한다', () => {
    const freq = getNumberFrequency(rounds);
    expect(freq).toHaveLength(45);
    expect(freq[0].number).toBe(1);
    expect(freq[44].number).toBe(45);
  });

  it('당첨번호 출현 횟수를 센다', () => {
    const freq = getNumberFrequency(rounds);
    expect(freq[0].count).toBe(2); // 번호 1
    expect(freq[3].count).toBe(1); // 번호 4
    expect(freq[9].count).toBe(0); // 번호 10
  });

  it('빈도 합 = 회차 수 × 6 (보너스 제외)', () => {
    const total = getNumberFrequency(rounds).reduce((a, c) => a + c.count, 0);
    expect(total).toBe(rounds.length * 6);
  });

  it('보너스 번호는 집계하지 않는다', () => {
    const freq = getNumberFrequency([round(1, [1, 2, 3, 4, 5, 6], 45)]);
    expect(freq[44].count).toBe(0); // 번호 45는 보너스로만 등장
  });

  it('빈 입력이면 모두 0', () => {
    expect(getNumberFrequency([]).every(c => c.count === 0)).toBe(true);
  });
});

describe('getTopNumbers / getBottomNumbers', () => {
  it('상위는 빈도 내림차순, 동점은 번호 오름차순', () => {
    expect(getTopNumbers(rounds, 3)).toEqual([
      { number: 1, count: 2 },
      { number: 2, count: 2 },
      { number: 3, count: 2 },
    ]);
  });

  it('하위는 빈도 오름차순, 동점은 번호 오름차순', () => {
    expect(getBottomNumbers(rounds, 3)).toEqual([
      { number: 10, count: 0 },
      { number: 11, count: 0 },
      { number: 12, count: 0 },
    ]);
  });

  it('n이 0 이하면 빈 배열', () => {
    expect(getTopNumbers(rounds, 0)).toEqual([]);
    expect(getTopNumbers(rounds, -5)).toEqual([]);
  });
});

describe('getNumberGaps', () => {
  it('최신 회차에 나온 번호는 gap 0', () => {
    const gaps = getNumberGaps(rounds);
    expect(gaps.find(g => g.number === 1)?.gap).toBe(0);
  });

  it('이전 회차에만 나온 번호는 회차 차이만큼', () => {
    expect(getNumberGaps(rounds).find(g => g.number === 4)?.gap).toBe(1);
  });

  it('범위 안에 없던 번호는 범위 길이가 gap', () => {
    expect(getNumberGaps(rounds).find(g => g.number === 10)?.gap).toBe(2);
  });

  it('입력 정렬을 가정하지 않는다', () => {
    const reversed = [...rounds].reverse();
    expect(getNumberGaps(reversed)).toEqual(getNumberGaps(rounds));
  });

  it('빈 입력이면 빈 배열', () => {
    expect(getNumberGaps([])).toEqual([]);
  });
});

describe('getOddEvenDistribution', () => {
  it('홀수 개수 0~6 버킷을 반환한다', () => {
    const dist = getOddEvenDistribution(rounds);
    expect(dist).toHaveLength(7);
    expect(dist.map(d => d.oddCount)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('회차별 홀수 개수를 집계한다', () => {
    const dist = getOddEvenDistribution(rounds);
    expect(dist[3].count).toBe(1); // [1..6] → 홀수 3개
    expect(dist[4].count).toBe(1); // [1,2,3,7,8,9] → 홀수 4개
  });

  it('비율 합은 1', () => {
    const sum = getOddEvenDistribution(rounds).reduce((a, d) => a + d.ratio, 0);
    expect(sum).toBeCloseTo(1);
  });

  it('빈 입력이면 비율 0 (0 나눗셈 방지)', () => {
    expect(getOddEvenDistribution([]).every(d => d.ratio === 0)).toBe(true);
  });
});

describe('getSumDistribution', () => {
  it('min·max·평균·표준편차를 계산한다', () => {
    // 합계: 21, 30 → 평균 25.5, 모집단 표준편차 4.5
    const dist = getSumDistribution(rounds);
    expect(dist.min).toBe(21);
    expect(dist.max).toBe(30);
    expect(dist.average).toBeCloseTo(25.5);
    expect(dist.stdDev).toBeCloseTo(4.5);
  });

  it('모든 합계가 어느 한 구간에 든다 (비율 합 1)', () => {
    const dist = getSumDistribution(rounds);
    expect(dist.buckets.reduce((a, b) => a + b.count, 0)).toBe(rounds.length);
    expect(dist.buckets.reduce((a, b) => a + b.ratio, 0)).toBeCloseTo(1);
  });

  it('빈 입력이면 구간 골격은 유지하고 값만 0', () => {
    const dist = getSumDistribution([]);
    expect(dist).toMatchObject({ min: 0, max: 0, average: 0, stdDev: 0 });
    expect(dist.buckets).toHaveLength(4);
    expect(dist.buckets.every(b => b.count === 0 && b.ratio === 0)).toBe(true);
  });
});

describe('getRangeDistribution', () => {
  it('공 색 밴드 5구간으로 집계한다', () => {
    const dist = getRangeDistribution([round(1, [5, 6, 15, 25, 35, 45])]);
    expect(dist.map(b => b.count)).toEqual([2, 1, 1, 1, 1]);
    expect(dist.map(b => b.ball)).toEqual([
      'yellow',
      'blue',
      'red',
      'gray',
      'green',
    ]);
  });

  it('비율 분모는 회차 수 × 6이라 합이 1', () => {
    const dist = getRangeDistribution(rounds);
    expect(dist.reduce((a, b) => a + b.ratio, 0)).toBeCloseTo(1);
  });

  it('빈 입력이면 비율 0', () => {
    expect(getRangeDistribution([]).every(b => b.ratio === 0)).toBe(true);
  });
});

describe('getConsecutiveDistribution', () => {
  // [1..6] 최장 6연속 / [1,2,3,7,8,9] 최장 3연속 / [1,3,5,7,9,11] 연속 없음
  const mixed = [...rounds, round(3, [1, 3, 5, 7, 9, 11])];

  it('연속이 있는 회차만 센다', () => {
    const dist = getConsecutiveDistribution(mixed);
    expect(dist.withRunCount).toBe(2);
    expect(dist.withRunRatio).toBeCloseTo(2 / 3);
  });

  it('최장 run 길이별로 분류한다', () => {
    const dist = getConsecutiveDistribution(mixed);
    const byLength = Object.fromEntries(dist.buckets.map(b => [b.length, b.count]));
    expect(byLength).toEqual({ 2: 0, 3: 1, 4: 0, 5: 0, 6: 1 });
  });

  it('버킷 비율의 분모는 연속이 있는 회차 수', () => {
    const dist = getConsecutiveDistribution(mixed);
    expect(dist.buckets.reduce((a, b) => a + b.ratio, 0)).toBeCloseTo(1);
  });

  it('빈 입력이면 값 0', () => {
    const dist = getConsecutiveDistribution([]);
    expect(dist.withRunCount).toBe(0);
    expect(dist.withRunRatio).toBe(0);
  });
});

describe('getLastDigitDistribution', () => {
  it('끝수 0~9를 오름차순으로 반환한다', () => {
    const dist = getLastDigitDistribution(rounds);
    expect(dist).toHaveLength(10);
    expect(dist.map(d => d.digit)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('번호의 일의 자리를 센다', () => {
    const dist = getLastDigitDistribution([round(1, [1, 11, 21, 31, 41, 2])]);
    expect(dist[1].count).toBe(5); // 1, 11, 21, 31, 41
    expect(dist[2].count).toBe(1); // 2
  });

  it('비율 합은 1', () => {
    const sum = getLastDigitDistribution(rounds).reduce((a, d) => a + d.ratio, 0);
    expect(sum).toBeCloseTo(1);
  });
});

describe('getCoOccurrenceMatrix', () => {
  it('상위 번호를 오름차순 축으로 두고 대칭 행렬을 만든다', () => {
    const m = getCoOccurrenceMatrix(rounds, 3);
    expect(m.numbers).toEqual([1, 2, 3]);
    expect(m.counts).toEqual([
      [0, 2, 2],
      [2, 0, 2],
      [2, 2, 0],
    ]);
  });

  it('대각선은 0, max는 최댓값', () => {
    const m = getCoOccurrenceMatrix(rounds, 3);
    expect(m.counts.every((row, i) => row[i] === 0)).toBe(true);
    expect(m.max).toBe(2);
  });

  it('행렬은 대칭이다', () => {
    const m = getCoOccurrenceMatrix(rounds, 5);
    for (let i = 0; i < m.numbers.length; i++) {
      for (let j = 0; j < m.numbers.length; j++) {
        expect(m.counts[i][j]).toBe(m.counts[j][i]);
      }
    }
  });
});
