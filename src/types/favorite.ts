// ============================================================================
// 즐겨찾기 도메인 타입
// ============================================================================
//
// 사용자가 저장한 번호 조합. 회차 데이터(읽기)와 달리 사용자가 쓰는 로컬 데이터라
// MMKV + Zustand로 관리한다(서버 없음). 출처(source)로 직접 추가·추천·회차를 구분한다
// ============================================================================

import type { RecommendType } from '@/utils/algorithms';

// 조합을 어디서 저장했는지
export type FavoriteSource =
  | { kind: 'manual' } // FavoriteAdd에서 직접 선택
  | { kind: 'recommend'; algorithm: RecommendType } // Recommend 화면 추천 세트
  | { kind: 'round'; drawNo: number }; // 특정 회차 (타입만 정의, 현재 미사용)

// 저장된 번호 조합 하나
export interface FavoriteItem {
  id: string; // 저장 시 자동 생성 (`${Date.now()}-${난수}`)
  numbers: number[]; // 6개, 오름차순, 1~45
  memo?: string; // 메모 (최대 30자, 선택)
  createdAt: string; // 저장 시각 ISO 8601 — 자동 비교의 기준일
  source: FavoriteSource;
}
