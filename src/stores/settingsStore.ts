// ============================================================================
// 설정 스토어 (Zustand)
// ============================================================================
//
// 테마 모드·기본 분석 범위를 메모리 상태로 들고 화면에 공급한다. 초기 상태는 MMKV에서
// hydrate하고(동기 read라 첫 렌더부터 확정값), 변경마다 MMKV로 persist한다.
// favoritesStore와 같은 패턴이며 별도 인스턴스라 키가 충돌하지 않는다.
// ============================================================================

import { create } from 'zustand';

import { loadSettings, saveSettings } from '@/storage/settingsStorage';
import type { StatsRange, ThemeMode } from '@/types/settings';

interface SettingsState {
  themeMode: ThemeMode;
  defaultStatsRange: StatsRange;
  setThemeMode: (mode: ThemeMode) => void;
  setDefaultStatsRange: (range: StatsRange) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadSettings(),

  setThemeMode: mode => {
    set({ themeMode: mode });
    saveSettings({ themeMode: mode, defaultStatsRange: get().defaultStatsRange });
  },

  setDefaultStatsRange: range => {
    set({ defaultStatsRange: range });
    saveSettings({ themeMode: get().themeMode, defaultStatsRange: range });
  },
}));
