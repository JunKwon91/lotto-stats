// ============================================================================
// 로또 데이터 로딩 오케스트레이션
// ============================================================================
//
// 메인 진입 후 백그라운드 갱신 — syncLottoData (TanStack Query queryFn).
//   - 항상 fetch 시도 → 성공 시 MMKV 갱신
//   - 실패 시 기존 캐시 반환 (UI 깜빡임 없이 연속성 유지)
//   - 캐시조차 없으면 throw
// ============================================================================

import { fetchRemoteLottoData } from '@/api/lottoApi';
import { getCachedLottoData, setCachedLottoData } from '@/storage/lottoStorage';
import type { CachedLottoData } from '@/types/lotto';

/**
 * 백그라운드 갱신 (TanStack Query queryFn).
 * 메인 진입 후 stale time 만료 시 호출.
 *
 * fetch 실패 시 throw하지 않고 기존 캐시를 반환 — UI 깜빡임 방지.
 * (캐시조차 없는 극단 케이스에서만 throw)
 */
export async function syncLottoData(): Promise<CachedLottoData> {
  try {
    const fresh = await fetchRemoteLottoData();
    setCachedLottoData(fresh);
    return getCachedLottoData()!;
  } catch (error) {
    const cached = getCachedLottoData();
    if (cached) return cached;
    throw error;
  }
}
