// ============================================================================
// 로또 데이터 도메인 API
// ============================================================================
//
// GitHub raw 호스팅된 lotto-history.json을 조회.
// 공통 httpClient 사용 — 인터셉터/타임아웃 일관성 유지.
// ============================================================================

import { httpClient } from './httpClient';
import { API_CONFIG } from '@/config/api';
import type { LottoHistoryData } from '@/types/lotto';

export async function fetchRemoteLottoData(): Promise<LottoHistoryData> {
  const response = await httpClient.get<LottoHistoryData>(API_CONFIG.LOTTO_DATA_URL);
  return response.data;
}
