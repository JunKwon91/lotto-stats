// 회차 계산 — 1회차 2002-12-07 토 20:35 KST 기준 주 단위 누적.
// 시각을 주입할 수 있어 현재 시각과 무관하게 검증한다.

import { calculateLatestRound, getRoundStatus } from '@/utils/lottoRound';

describe('calculateLatestRound', () => {
  it('1회차 추첨 시각이면 1', () => {
    expect(calculateLatestRound(new Date('2002-12-07T20:35:00+09:00'))).toBe(1);
  });

  it('추첨 시각 직전이면 아직 0회차', () => {
    expect(calculateLatestRound(new Date('2002-12-07T20:34:00+09:00'))).toBe(0);
  });

  it('한 주 뒤 추첨 시각이면 2회차', () => {
    expect(calculateLatestRound(new Date('2002-12-14T20:35:00+09:00'))).toBe(2);
  });

  it('추첨 전 토요일 낮은 지난 회차로 본다', () => {
    // 2002-12-14 토 14:00 — 그 주 추첨(20:35) 전이므로 아직 1회차
    expect(calculateLatestRound(new Date('2002-12-14T14:00:00+09:00'))).toBe(1);
  });

  it('회차는 시간이 지날수록 단조 증가한다', () => {
    const earlier = calculateLatestRound(new Date('2020-01-01T00:00:00+09:00'));
    const later = calculateLatestRound(new Date('2024-01-01T00:00:00+09:00'));
    expect(later).toBeGreaterThan(earlier);
  });
});

describe('getRoundStatus', () => {
  it('데이터에 있는 회차는 available', () => {
    expect(getRoundStatus(5, 10)).toEqual({ status: 'available', round: 5 });
    expect(getRoundStatus(10, 10).status).toBe('available');
  });

  it('추첨은 됐지만 데이터에 없으면 collecting', () => {
    // 2회차는 2002년에 추첨됐으므로 이론상 회차보다 항상 작다
    expect(getRoundStatus(2, 1)).toEqual({ status: 'collecting', round: 2 });
  });

  it('아직 추첨 전인 미래 회차는 pending', () => {
    expect(getRoundStatus(99999, 10)).toEqual({
      status: 'pending',
      round: 99999,
    });
  });
});
