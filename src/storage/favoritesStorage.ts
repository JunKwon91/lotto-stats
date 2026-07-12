// ============================================================================
// MMKV 기반 즐겨찾기 영구 저장
// ============================================================================
//
// 저장된 조합(FavoriteItem[])을 단일 키에 JSON 직렬화해 둔다. 회차 캐시
// (lotto-cache)와 별도 인스턴스로 분리해 키 공간을 격리한다(lottoStorage와 동일 패턴).
// react-native-mmkv@4.x는 NitroModules 기반이라 `createMMKV(...)` 팩토리를 쓴다.
// ============================================================================

import { createMMKV } from 'react-native-mmkv';

import type { FavoriteItem } from '@/types/favorite';

// 즐겨찾기 전용 인스턴스 — 회차 캐시·설정 등과 키 충돌 방지
const storage = createMMKV({ id: 'favorites' });

// 전체 목록을 단일 키에 배열 JSON으로 저장
const FAVORITES_KEY = 'favorite_items';

// 저장된 즐겨찾기 목록. 없거나 깨졌으면 빈 배열.
export function loadFavorites(): FavoriteItem[] {
  const raw = storage.getString(FAVORITES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // 배열이 아니면(손상) 빈 배열로 폴백
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 전체 목록 저장 (덮어쓰기).
export function saveFavorites(items: FavoriteItem[]): void {
  storage.set(FAVORITES_KEY, JSON.stringify(items));
}
