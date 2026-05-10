// ============================================================================
// 로또 도메인 Query Keys
// ============================================================================
//
// TanStack Query 공식 권장 패턴 (Query Key Factory).
// 키 계층 구조를 한 곳에서 관리하여 invalidate 시 명확한 범위 지정 가능.
//
// 사용 예:
//   useQuery({ queryKey: lottoKeys.history(), ... })
//   queryClient.invalidateQueries({ queryKey: lottoKeys.all }) // 전체
//   queryClient.invalidateQueries({ queryKey: lottoKeys.history() }) // 일부
//
// 향후 확장:
//   - lottoKeys.round(drawNo)  : 특정 회차 상세
//   - lottoKeys.stats(range)   : 통계 (range는 분석 범위 회차 수)
// ============================================================================

export const lottoKeys = {
  all: ['lotto'] as const,
  history: () => [...lottoKeys.all, 'history'] as const,
  round: (drawNo: number) => [...lottoKeys.all, 'round', drawNo] as const,
  stats: (range: number) => [...lottoKeys.all, 'stats', range] as const,
} as const;
