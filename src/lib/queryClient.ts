// ============================================================================
// TanStack Query Client 인스턴스 (전역 단일)
// ============================================================================
//
// 모듈 로드 시 1회만 생성되며, 어디서든 import해서 직접 접근 가능하다.
// React 컴포넌트 안에서는 useQueryClient() 훅을 써도 되지만,
// 컴포넌트 외부(api 함수, 백그라운드 로직 등)에서는 이 모듈을 import한다.
//
// defaultOptions는 모든 query/mutation에 적용되는 전역 행동 정책.
// 도메인 특성(staleTime, gcTime, queryKey 등)은 각 훅에서 개별 지정.
// ============================================================================

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
      refetchOnWindowFocus: false, // 모바일 환경에서 의미 없음
      refetchOnReconnect: true, // 네트워크 복구 시 재시도
    },
  },
});
