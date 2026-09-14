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
import { isDesignThemeId } from '@/theme/design-themes';

// Значения настроек по умолчанию (до первого изменения пользователем).
export const DEFAULT_SETTINGS: AppSettings = {
  designTheme: 'minimalism',
  themeMode: 'system',
  ghostEnabled: true,
  ghostOpacity: 0.5,
  gridEnabled: true,
  requireBiometrics: false,
  remindersEnabled: false,
  reminderTime: '20:00',
};

/**
 * Нормализует сохранённые настройки, объединяя их с DEFAULT_SETTINGS.
 *
 * Гарантии (для совместимости со старыми установками):
 * - отсутствующее поле получает значение по умолчанию (например, designTheme);
 * - неизвестный или неверного типа designTheme заменяется на 'minimalism';
 * - неизвестный themeMode заменяется на 'system';
 * - прежние значения остальных полей сохраняются.
 */
export function normalizeSettings(raw: unknown): AppSettings {
  const partial = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<AppSettings>;

  const settings: AppSettings = { ...DEFAULT_SETTINGS, ...partial };

  if (!isDesignThemeId(settings.designTheme)) {
    settings.designTheme = 'minimalism';
  }
  if (settings.themeMode !== 'system' && settings.themeMode !== 'light' && settings.themeMode !== 'dark') {
    settings.themeMode = 'system';
  }

  return settings;
}

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
      // Контролируемое объединение: старая запись без новых полей (designTheme)
      // не должна затирать значения по умолчанию. Действия берём из currentState.
      merge: (persistedState, currentState) => ({
        ...currentState,
        settings: normalizeSettings(
          (persistedState as { settings?: unknown } | null | undefined)?.settings,
        ),
      }),
    },
  ),
);
