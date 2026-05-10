// ============================================================================
// 로또 데이터 훅 — TanStack Query 래퍼
// ============================================================================
//
// MMKV 캐시를 initialData로 즉시 제공하면서, 백그라운드에서 syncLottoData가
// 실행되어 fresh 데이터를 가져옴. UI는 처음부터 데이터를 보여주고
// 갱신은 자연스럽게 반영됨.
//
// staleTime/gcTime 설정 의도:
//   - staleTime 1시간: 추첨이 주 1회라 1시간 내 재요청 불필요
//   - gcTime 7일: 메모리 보존 기간. MMKV 영구 캐시는 별도 보존.
//
// 전역 정책(refetchOnWindowFocus, refetchOnReconnect, retry 등)은 App.tsx의
// QueryClient defaultOptions에 정의. 도메인 특성만 여기에서 관리.
// ============================================================================

import { useQuery } from '@tanstack/react-query';
import { syncLottoData } from '@/services/lottoHistoryLoader';
import { getCachedLottoData } from '@/storage/lottoStorage';
import { lottoKeys } from './lottoKeys';

export function useLottoData() {
  return useQuery({
    queryKey: lottoKeys.history(),
    queryFn: syncLottoData,
    // 함수 형태로 전달 → 매 렌더마다 호출되지 않음 (TanStack Query가 lazy 호출)
    initialData: () => getCachedLottoData() ?? undefined,
    staleTime: 1000 * 60 * 60, // 1시간 — 추첨이 주 1회라 충분
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7일 — 메모리 보존 기간
  });
}
