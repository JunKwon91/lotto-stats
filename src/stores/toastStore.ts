// ============================================================================
// toastStore — Toast 전역 큐잉 상태 (Zustand)
// ============================================================================
//
// 한 번에 1개만 화면에 표시. 새 Toast는 큐(최대 3개)에 대기. 큐 초과 시
// 가장 오래된 항목 제거(최신 우선). duration 종료 또는 X 클릭 시 다음 큐
// 항목이 자동으로 displayed로 승격.
//
// 사용 예:
//   toast.success('즐겨찾기에 추가됨', '5개 번호가 저장되었습니다.');
//   toast.error('저장 실패', '네트워크 연결을 확인해주세요.');
//   toast.info('새 회차 데이터 도착');
//
//   // 직접 호출 — duration 지정·수동 닫기
//   useToastStore.getState().show({
//     type: 'info', title: '수동 닫기', duration: 0,
//   });
// ============================================================================

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  /** ms. 기본 3000. `0` 지정 시 자동 dismiss 안 함(수동 닫기 전용). */
  duration?: number;
}

interface ToastStore {
  /** 현재 화면에 표시 중인 Toast. 없으면 null. */
  displayed: ToastConfig | null;
  /** 대기 큐. 최대 3개. */
  queue: ToastConfig[];
  show: (config: Omit<ToastConfig, 'id'>) => string;
  /** 현재 표시 중인 Toast 제거 + 큐에 다음이 있으면 승격. */
  dismiss: () => void;
  /** 모든 Toast 제거 (displayed + queue). */
  clearAll: () => void;
}

const MAX_QUEUE = 3;

export const useToastStore = create<ToastStore>((set) => ({
  displayed: null,
  queue: [],
  show: (config) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newToast: ToastConfig = { ...config, id };

    set((state) => {
      if (state.displayed === null) {
        return { displayed: newToast };
      }
      const newQueue = [...state.queue, newToast];
      if (newQueue.length > MAX_QUEUE) {
        newQueue.shift();
      }
      return { queue: newQueue };
    });

    return id;
  },
  dismiss: () => {
    set((state) => {
      if (state.queue.length > 0) {
        const [next, ...rest] = state.queue;
        return { displayed: next, queue: rest };
      }
      return { displayed: null };
    });
  },
  clearAll: () => set({ displayed: null, queue: [] }),
}));

/**
 * React 외부에서도 호출 가능한 편의 헬퍼.
 *
 * @example
 *   toast.success('저장 완료');
 *   toast.error('네트워크 오류', '연결을 확인하세요');
 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'error', title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().show({ type: 'info', title, description }),
};
