// 당첨 비교 — 등수 판정과 대상 회차 선정.
// 추첨 시각(토 20:35 KST)을 기준으로 저장 시점 전후를 가른다.

import type { LottoRound } from '@/types/lotto';
import { getTargetRound, matchLotto } from '@/utils/matchLotto';

const draw: LottoRound = {
  drawNo: 1000,
  date: '2024-01-06',
  numbers: [1, 2, 3, 4, 5, 6],
  bonusNo: 7,
};

describe('matchLotto', () => {
  it('6개 일치는 1등', () => {
    expect(matchLotto([1, 2, 3, 4, 5, 6], draw)).toEqual({
      matchCount: 6,
      bonusMatch: false,
      rank: 1,
    });
  });

  it('5개 + 보너스는 2등', () => {
    expect(matchLotto([1, 2, 3, 4, 5, 7], draw)).toMatchObject({
      matchCount: 5,
      bonusMatch: true,
      rank: 2,
    });
  });

  it('보너스 없는 5개는 3등', () => {
    expect(matchLotto([1, 2, 3, 4, 5, 8], draw)).toMatchObject({
      matchCount: 5,
      bonusMatch: false,
      rank: 3,
    });
  });

  it('4개는 4등, 3개는 5등', () => {
    expect(matchLotto([1, 2, 3, 4, 8, 9], draw).rank).toBe(4);
    expect(matchLotto([1, 2, 3, 8, 9, 10], draw).rank).toBe(5);
  });

  it('2개 이하는 낙첨', () => {
    expect(matchLotto([1, 2, 8, 9, 10, 11], draw).rank).toBeNull();
    expect(matchLotto([8, 9, 10, 11, 12, 13], draw).rank).toBeNull();
  });

  it('보너스는 5개 일치일 때만 등수를 바꾼다', () => {
    // 4개 일치 + 보너스 포함 → 여전히 4등
    const result = matchLotto([1, 2, 3, 4, 7, 9], draw);
    expect(result.matchCount).toBe(4);
    expect(result.bonusMatch).toBe(true);
    expect(result.rank).toBe(4);
  });
});

describe('getTargetRound', () => {
  const rounds: LottoRound[] = [
    { drawNo: 1000, date: '2024-01-06', numbers: [1, 2, 3, 4, 5, 6], bonusNo: 7 },
    { drawNo: 1001, date: '2024-01-13', numbers: [7, 8, 9, 10, 11, 12], bonusNo: 1 },
  ];

  it('저장 이후 처음 추첨되는 회차를 고른다', () => {
    const target = getTargetRound('2024-01-05T00:00:00+09:00', rounds);
    expect(target?.drawNo).toBe(1000);
  });

  it('추첨 시각(20:35) 이후 저장이면 그 회차는 제외한다', () => {
    const target = getTargetRound('2024-01-06T21:00:00+09:00', rounds);
    expect(target?.drawNo).toBe(1001);
  });

  it('추첨 시각 직전 저장이면 그 회차가 대상', () => {
    const target = getTargetRound('2024-01-06T20:00:00+09:00', rounds);
    expect(target?.drawNo).toBe(1000);
  });

  it('이후 추첨이 없으면 null (다음 추첨 대기)', () => {
    expect(getTargetRound('2024-01-20T00:00:00+09:00', rounds)).toBeNull();
  });

  it('입력 정렬을 가정하지 않는다', () => {
    const reversed = [...rounds].reverse();
    expect(getTargetRound('2024-01-05T00:00:00+09:00', reversed)?.drawNo).toBe(
      1000,
    );
  });

  it('빈 회차 배열이면 null', () => {
    expect(getTargetRound('2024-01-05T00:00:00+09:00', [])).toBeNull();
  });
});
