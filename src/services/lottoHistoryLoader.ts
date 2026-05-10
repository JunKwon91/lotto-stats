// ============================================================================
// 로또 데이터 로딩 오케스트레이션
// ============================================================================
//
// 두 가지 시나리오 분리:
//   1) 앱 첫 진입 (Splash) — loadInitialLottoData
//      - 캐시 있음 → 즉시 반환 (오프라인이어도 동작)
//      - 캐시 없음 → 원격 fetch 강제 (실패하면 에러 반환)
//
//   2) 메인 진입 후 백그라운드 갱신 — syncLottoData
//      - 항상 fetch 시도
//      - 실패 시 기존 캐시 반환 (UI 깜빡임 없이 연속성 유지)
//      - 캐시조차 없으면 throw (이 경우는 보통 1번 단계에서 이미 실패함)
// ============================================================================

import { fetchRemoteLottoData } from '@/api/lottoApi';
import { getCachedLottoData, setCachedLottoData } from '@/storage/lottoStorage';
import type { CachedLottoData } from '@/types/lotto';

// 결과 타입 — discriminated union으로 호출자가 분기 처리
export type LoadResult =
  | { status: 'success'; data: CachedLottoData; isFresh: boolean }
  | { status: 'error'; error: Error };

/**
 * Splash 시점에 호출.
 * MMKV 캐시 있으면 즉시 반환 (isFresh=false), 없으면 fetch 시도.
 */
export async function loadInitialLottoData(): Promise<LoadResult> {
  const cached = getCachedLottoData();

  // 캐시 있음 → 즉시 메인 진입 (오프라인 첫 진입도 OK, 단 첫 설치 후가 아닐 때)
  if (cached) {
    return { status: 'success', data: cached, isFresh: false };
  }

  // 캐시 없음 → 원격 fetch 필수
  try {
    const fresh = await fetchRemoteLottoData();
    setCachedLottoData(fresh);
    // setCachedLottoData가 cachedAt을 추가했으므로 다시 읽어 정확한 객체 반환
    const newCached = getCachedLottoData()!;
    return { status: 'success', data: newCached, isFresh: true };
  } catch (error) {
    return { status: 'error', error: error as Error };
  }
}

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
