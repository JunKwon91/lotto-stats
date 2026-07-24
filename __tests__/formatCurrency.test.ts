// 통화 포맷 — Hermes Intl에 의존하지 않고 직접 콤마를 넣는 구현이라
// 자릿수 경계와 억/조 축약 경계를 확인한다.

import {
  formatCount,
  formatWon,
  formatWonCompact,
} from '@/utils/formatCurrency';

describe('formatWon', () => {
  it('접두 ₩와 천단위 콤마를 붙인다', () => {
    expect(formatWon(2026170000)).toBe('₩2,026,170,000');
  });

  it('네 자리부터 콤마가 들어간다', () => {
    expect(formatWon(999)).toBe('₩999');
    expect(formatWon(1000)).toBe('₩1,000');
  });

  it('0도 표기한다', () => {
    expect(formatWon(0)).toBe('₩0');
  });
});

describe('formatCount', () => {
  it('콤마만 넣는다 (통화 기호 없음)', () => {
    expect(formatCount(2904203)).toBe('2,904,203');
    expect(formatCount(7)).toBe('7');
  });
});

describe('formatWonCompact', () => {
  it('억 단위로 축약한다', () => {
    expect(formatWonCompact(62_500_000_000)).toBe('₩625억');
  });

  it('조와 억을 함께 표기한다', () => {
    expect(formatWonCompact(1_234_500_000_000)).toBe('₩1조 2,345억');
  });

  it('억 자리가 0이면 조만 표기한다', () => {
    expect(formatWonCompact(1_000_000_000_000)).toBe('₩1조');
  });

  it('1억 미만은 축약 없이 풀 표기로 폴백한다', () => {
    expect(formatWonCompact(99_999_999)).toBe('₩99,999,999');
  });

  it('정확히 1억은 축약 대상', () => {
    expect(formatWonCompact(100_000_000)).toBe('₩1억');
  });

  it('억 미만 단위는 버린다', () => {
    expect(formatWonCompact(625_999_999)).toBe('₩6억');
  });
});
