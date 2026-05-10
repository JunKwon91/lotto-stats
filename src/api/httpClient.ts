// ============================================================================
// 공통 HTTP 클라이언트
// ============================================================================
//
// 모든 외부 API 요청은 이 인스턴스를 통해 실행한다.
// 공통 설정(timeout, headers)을 한 곳에서 관리하고,
// 향후 인터셉터(에러 처리, 로깅, 재시도)를 추가할 때 한 곳만 수정.
// ============================================================================

import axios from 'axios';
import { API_CONFIG } from '@/config/api';

export const httpClient = axios.create({
  timeout: API_CONFIG.DEFAULT_TIMEOUT_MS,
  headers: {
    'Cache-Control': 'no-cache',
  },
});
