// ============================================================================
// 통화 포맷
// ============================================================================
//
// 화면 간 통화 표기를 접두 ₩ 한국식으로 통일한다
//   - formatWon: 풀 금액 + 천단위 콤마 (예: ₩2,026,170,000)
//   - formatWonCompact: 큰 금액을 억/조 단위로 축약 (예: ₩625억, ₩1조 2,345억)
//
// 원 단위 정수를 받는다. 당첨금·판매액은 비음수라 음수는 다루지 않는다
// Hermes Intl에 의존하지 않도록 콤마는 직접 처리한다
// ============================================================================

const EOK = 100_000_000; // 억 = 10^8
const JO = 1_000_000_000_000; // 조 = 10^12

// 천단위 콤마
function withComma(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 풀 금액 + 접두 ₩. 예: 2026170000 → "₩2,026,170,000"
 */
export function formatWon(amount: number): string {
  return '₩' + withComma(amount);
}

/**
 * 천단위 콤마만 (인원 등 개수 표시용). 예: 2904203 → "2,904,203"
 */
export function formatCount(n: number): string {
  return withComma(n);
}

/**
 * 큰 금액을 억/조 단위로 축약한 접두 ₩. 억 미만은 버린다
 * 1억 미만이면 축약 없이 formatWon과 동일한 풀 표기로 폴백한다
 *
 * 예: 62_500_000_000     → "₩625억"
 *     1_234_500_000_000  → "₩1조 2,345억"
 *     1_000_000_000_000  → "₩1조"
 *     99_999_999         → "₩99,999,999"
 */
export function formatWonCompact(amount: number): string {
  if (amount < EOK) return formatWon(amount);

  const jo = Math.floor(amount / JO);
  const eok = Math.floor((amount % JO) / EOK);

  if (jo > 0) {
    return eok > 0
      ? `₩${withComma(jo)}조 ${withComma(eok)}억`
      : `₩${withComma(jo)}조`;
  }
  return `₩${withComma(eok)}억`;
}
