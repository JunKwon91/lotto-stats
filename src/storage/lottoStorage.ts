// ============================================================================
// MMKV 기반 로또 데이터 영구 캐시
// ============================================================================
//
// MMKV는 동기(synchronous) 키-값 저장소 — 메인 스레드에서 즉시 read/write 가능.
// 별도 인스턴스 id('lotto-cache')로 분리해서 다른 앱 데이터와 키 공간 격리.
// ============================================================================

import { createMMKV } from 'react-native-mmkv';
import type { CachedLottoData, LottoHistoryData } from '@/types/lotto';

// 별도 인스턴스 — 다른 도메인(설정, 즐겨찾기 등)과 키 충돌 방지
// react-native-mmkv@4.x 부터 NitroModules 기반으로 변경되어
// `new MMKV(...)` 대신 `createMMKV(...)` 팩토리 함수를 사용한다.
const storage = createMMKV({ id: 'lotto-cache' });

// 단일 키에 전체 데이터 JSON 직렬화로 저장
// (회차 1200개 ~ 250KB → MMKV가 충분히 빠르게 처리)
const CACHE_KEY = 'lotto_history_data';

// 저장된 캐시 조회. 없거나 깨졌으면 null.
export function getCachedLottoData(): CachedLottoData | null {
  const raw = storage.getString(CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // JSON 파싱 실패 → 손상된 캐시. null 반환해서 호출자가 다시 fetch하도록.
    return null;
  }
}

// LottoHistoryData를 받아 cachedAt(현재 시각)을 덧붙여 저장.
export function setCachedLottoData(data: LottoHistoryData): void {
  const cached: CachedLottoData = {
    ...data,
    cachedAt: new Date().toISOString(),
  };
  storage.set(CACHE_KEY, JSON.stringify(cached));
}

// 캐시 삭제 (디버그/리셋용).
// react-native-mmkv@4.x 부터 `delete` 대신 `remove`를 사용.
export function clearCachedLottoData(): void {
  storage.remove(CACHE_KEY);
}
