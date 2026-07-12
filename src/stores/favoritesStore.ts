// ============================================================================
// 즐겨찾기 스토어 (Zustand)
// ============================================================================
//
// 저장된 조합을 메모리 상태로 들고 화면에 반응형으로 공급한다. 초기 상태는 MMKV에서
// hydrate하고, 추가/삭제/수정마다 MMKV로 persist한다. 즐겨찾기는 서버 없는 순수 로컬
// 데이터라 TanStack Query가 아니라 이 스토어가 담당한다(stores/ 첫 사용처).
// ============================================================================

import { create } from 'zustand';

import { loadFavorites, saveFavorites } from '@/storage/favoritesStorage';
import type { FavoriteItem } from '@/types/favorite';

// add에 넘기는 값 — id·createdAt은 스토어가 생성한다
export type NewFavorite = Omit<FavoriteItem, 'id' | 'createdAt'>;

// 수정 가능한 필드 — 번호와 메모만 (출처·저장시각은 불변)
export type FavoritePatch = Partial<Pick<FavoriteItem, 'numbers' | 'memo'>>;

interface FavoritesState {
  items: FavoriteItem[];
  add: (favorite: NewFavorite) => void;
  remove: (id: string) => void;
  update: (id: string, patch: FavoritePatch) => void;
}

const asc = (numbers: number[]) => [...numbers].sort((a, b) => a - b);

// 중복 판정용 키 (오름차순 후 join)
const numbersKey = (numbers: number[]) => asc(numbers).join(',');

// 고유 id — 저장 시각 + 난수
const createId = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: loadFavorites(),

  add: favorite => {
    const { items } = get();
    // 같은 조합 + 같은 출처면 중복으로 보고 무시 (추천에서 ★를 여러 번 눌러도 하나만)
    const key = numbersKey(favorite.numbers);
    const isDuplicate = items.some(
      it =>
        numbersKey(it.numbers) === key &&
        it.source.kind === favorite.source.kind,
    );
    if (isDuplicate) return;

    const item: FavoriteItem = {
      ...favorite,
      numbers: asc(favorite.numbers),
      id: createId(),
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...items]; // 최신 항목이 위로
    set({ items: next });
    saveFavorites(next);
  },

  remove: id => {
    const next = get().items.filter(it => it.id !== id);
    set({ items: next });
    saveFavorites(next);
  },

  update: (id, patch) => {
    const next = get().items.map(it => {
      if (it.id !== id) return it;
      return {
        ...it,
        ...(patch.numbers != null ? { numbers: asc(patch.numbers) } : {}),
        ...(patch.memo !== undefined ? { memo: patch.memo } : {}),
      };
    });
    set({ items: next });
    saveFavorites(next);
  },
}));
