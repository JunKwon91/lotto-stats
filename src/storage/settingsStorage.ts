// ============================================================================
// MMKV 기반 앱 설정 영구 저장
// ============================================================================
//
// 테마 모드·기본 분석 범위를 단일 키에 JSON으로 둔다. 회차 캐시(lotto-cache)·
// 즐겨찾기(favorites)와 별도 인스턴스로 키 공간을 격리한다(lottoStorage 패턴).
// ============================================================================

import { createMMKV } from 'react-native-mmkv';

import type { StatsRange, ThemeMode } from '@/types/settings';

// 설정 전용 인스턴스 — 캐시·즐겨찾기와 키 충돌 방지
const storage = createMMKV({ id: 'settings' });

const SETTINGS_KEY = 'app_settings';

export interface StoredSettings {
  themeMode: ThemeMode;
  defaultStatsRange: StatsRange;
}

// 기본값 — 최초 실행이나 손상 시. 테마는 시스템 추종, 범위는 최근 100회
export const DEFAULT_SETTINGS: StoredSettings = {
  themeMode: 'system',
  defaultStatsRange: '100',
};

// 저장된 설정. 없거나 깨졌으면 기본값. 누락 키는 기본값으로 채운다(설정 추가 대비).
export function loadSettings(): StoredSettings {
  const raw = storage.getString(SETTINGS_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// 전체 설정 저장 (덮어쓰기).
export function saveSettings(settings: StoredSettings): void {
  storage.set(SETTINGS_KEY, JSON.stringify(settings));
}
