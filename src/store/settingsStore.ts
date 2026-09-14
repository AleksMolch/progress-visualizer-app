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
import { Platform } from 'react-native';

import { type AppSettings } from '@/models/settings';
import { mmkvStorage } from '@/storage/mmkv';
import { getDefaultDesignThemeId, isDesignThemeId } from '@/theme/design-themes';

// Значения настроек по умолчанию (до первого изменения пользователем).
// Примечание: designTheme здесь — переходное значение до гидратации;
// реальный default для новых установок определяется платформой в normalizeSettings.
export const DEFAULT_SETTINGS: AppSettings = {
  designTheme: 'minimalism',
  themeMode: 'system',
  hapticsEnabled: true,
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
 * - отсутствующий или неизвестный designTheme заменяется на платформенный default
 *   (iOS → liquid-glass, Android → material, остальные → minimalism);
 * - явно сохранённый валидный designTheme сохраняется;
 * - неизвестный themeMode заменяется на 'system';
 * - прежние значения остальных полей (ghost, биометрия, напоминания и т.д.) сохраняются.
 */
export function normalizeSettings(raw: unknown, platform: string): AppSettings {
  const partial = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<AppSettings>;

  const settings: AppSettings = { ...DEFAULT_SETTINGS, ...partial };

  // Проверяем ИСХОДНОЕ значение designTheme: отсутствует/неизвестно → platform default.
  if (!isDesignThemeId(partial.designTheme)) {
    settings.designTheme = getDefaultDesignThemeId(platform);
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
          Platform.OS,
        ),
      }),
    },
  ),
);
