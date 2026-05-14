// ============================================================================
// dialogStore — Dialog 전역 큐잉 + Promise 결과 반환 (Zustand)
// ============================================================================
//
// Toast와 동일한 큐잉 패턴(displayed 1개 + queue max 3, FIFO overflow). 차이는
// Promise 기반 결과 반환 — `await dialog.confirm(...)`이 사용자 선택을 그대로
// 받는다. 각 dialog id별 resolver를 Map에 보관하다가 dismiss 시 호출.
//
// 사용 예:
//   const ok = await dialog.confirm({ title: '삭제하시겠습니까?', destructive: true });
//   if (ok) deleteItem();
//
//   const value = await dialog.prompt({ title: '회차 입력', placeholder: '1100' });
//   if (value !== null) handleInput(value);
//
//   await dialog.info({ title: '네트워크 오류', description: '연결을 확인하세요.' });
// ============================================================================

import { create } from 'zustand';

export type DialogVariant = 'info' | 'confirm' | 'prompt';

interface BaseDialogConfig {
  id: string;
  variant: DialogVariant;
  title: string;
  description?: string;
}

export interface InfoDialogConfig extends BaseDialogConfig {
  variant: 'info';
  /** 단일 확인 버튼 라벨. @default '확인' */
  confirmLabel?: string;
}

export interface ConfirmDialogConfig extends BaseDialogConfig {
  variant: 'confirm';
  /** 취소 버튼 라벨. @default '취소' */
  cancelLabel?: string;
  /** 확인 버튼 라벨. @default '확인' */
  confirmLabel?: string;
  /** true면 confirm 버튼이 destructive(state.error 배경)로 렌더된다. */
  destructive?: boolean;
}

export interface PromptDialogConfig extends BaseDialogConfig {
  variant: 'prompt';
  /** Input 초기값. */
  defaultValue?: string;
  placeholder?: string;
  /** 취소 버튼 라벨. @default '취소' */
  cancelLabel?: string;
  /** 확인 버튼 라벨. @default '확인' */
  confirmLabel?: string;
}

export type DialogConfig =
  | InfoDialogConfig
  | ConfirmDialogConfig
  | PromptDialogConfig;

/** dialog 결과 타입 — variant별로 다름. unknown 사용해 호출처가 type narrowing. */
type DialogResolver = {
  resolve: (value: unknown) => void;
};

interface DialogStore {
  displayed: DialogConfig | null;
  queue: DialogConfig[];
  resolvers: Map<string, DialogResolver>;
  _show: (config: Omit<DialogConfig, 'id'>) => Promise<unknown>;
  /** id별 dismiss + 결과 resolve. 다음 큐가 있으면 displayed로 승격. */
  dismiss: (id: string, value: unknown) => void;
  clearAll: () => void;
}

const MAX_QUEUE = 3;

function fallbackValue(variant: DialogVariant): unknown {
  if (variant === 'prompt') return null;
  if (variant === 'confirm') return false;
  return undefined;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  displayed: null,
  queue: [],
  resolvers: new Map(),

  _show: (config) => {
    const id = `dialog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newDialog = { ...config, id } as DialogConfig;

    return new Promise<unknown>((resolve) => {
      get().resolvers.set(id, { resolve });

      set((state) => {
        if (state.displayed === null) {
          return { displayed: newDialog };
        }
        const newQueue = [...state.queue, newDialog];
        if (newQueue.length > MAX_QUEUE) {
          const removed = newQueue.shift();
          if (removed) {
            const removedResolver = state.resolvers.get(removed.id);
            if (removedResolver) {
              removedResolver.resolve(fallbackValue(removed.variant));
              state.resolvers.delete(removed.id);
            }
          }
        }
        return { queue: newQueue };
      });
    });
  },

  dismiss: (id, value) => {
    const resolver = get().resolvers.get(id);
    if (resolver) {
      resolver.resolve(value);
      get().resolvers.delete(id);
    }

    set((state) => {
      if (state.queue.length > 0) {
        const [next, ...rest] = state.queue;
        return { displayed: next, queue: rest };
      }
      return { displayed: null };
    });
  },

  clearAll: () => {
    const { displayed, queue, resolvers } = get();
    const all = [displayed, ...queue].filter(
      (d): d is DialogConfig => d !== null,
    );
    for (const d of all) {
      const r = resolvers.get(d.id);
      if (r) r.resolve(fallbackValue(d.variant));
    }
    set({ displayed: null, queue: [], resolvers: new Map() });
  },
}));

/**
 * 편의 API — React 외부에서도 호출 가능. 각 메서드는 variant별 결과를
 * 타이핑된 Promise로 반환.
 *
 * @example
 *   const ok = await dialog.confirm({ title: '삭제?', destructive: true });
 *   const value = await dialog.prompt({ title: '회차 입력' });
 *   await dialog.info({ title: '완료' });
 */
export const dialog = {
  info: (config: Omit<InfoDialogConfig, 'id' | 'variant'>): Promise<void> =>
    useDialogStore
      .getState()
      ._show({ ...config, variant: 'info' }) as Promise<void>,
  confirm: (
    config: Omit<ConfirmDialogConfig, 'id' | 'variant'>,
  ): Promise<boolean> =>
    useDialogStore
      .getState()
      ._show({ ...config, variant: 'confirm' }) as Promise<boolean>,
  prompt: (
    config: Omit<PromptDialogConfig, 'id' | 'variant'>,
  ): Promise<string | null> =>
    useDialogStore
      .getState()
      ._show({ ...config, variant: 'prompt' }) as Promise<string | null>,
};
