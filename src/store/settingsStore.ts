/**
 * Назначение: хранилище пользовательских настроек (Zustand store).
 *
 * Функции:
 * - хранит AppSettings и обновляет их по частям;
 * - персистится в зашифрованное MMKV.
 *
 * Слой: state (/src/store). Использует storage-слой (MMKV) для персистентности.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type AppSettings } from '@/models/settings';
import { mmkvStorage } from '@/storage/mmkv';

// Значения настроек по умолчанию (до первого изменения пользователем).
export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'system',
  ghostEnabled: true,
  ghostOpacity: 0.5,
  gridEnabled: true,
  requireBiometrics: false,
  remindersEnabled: false,
};

interface SettingsState {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      // Частичное обновление настроек: мерджим переданные поля с текущими.
      updateSettings: (partial) =>
        set((state) => ({ settings: { ...state.settings, ...partial } })),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      // Персистим только данные, без действий.
      partialize: (state) => ({ settings: state.settings }),
      // Гидратация выполняется вручную после инициализации MMKV.
      skipHydration: true,
    },
  ),
);
