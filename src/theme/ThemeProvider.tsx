/**
 * Назначение: провайдер темы и хук доступа к текущему оформлению.
 *
 * Функции:
 * - определяет итоговую цветовую схему из themeMode (system/light/dark) и системной схемы;
 * - резолвит палитру и визуальные токены выбранного designTheme;
 * - хук useAppTheme возвращает цвета, схему, оформление, метрики и материалы.
 *
 * Слой: theme (/src/theme). Читает выбор оформления и режима из settingsStore.
 * Ограничение: резолв схемы system → light/dark; null системной схемы трактуется как light.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { type DesignThemeId } from '@/models/settings';
import { useSettingsStore } from '@/store/settingsStore';
import { type ColorScheme, type ThemeColors } from './index';
import {
  resolveDesignTheme,
  type NeumorphismTokens,
  type ThemeMaterial,
  type ThemeMetrics,
} from './design-themes';

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: ColorScheme;
  designTheme: DesignThemeId;
  metrics: ThemeMetrics;
  material: ThemeMaterial;
  neu?: NeumorphismTokens;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  // Выбор пользователя читается из store — смена темы применяется сразу.
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const designTheme = useSettingsStore((s) => s.settings.designTheme);

  // Разрешение схемы: system → системная (null → light), иначе явный light/dark.
  const scheme: ColorScheme =
    themeMode === 'dark'
      ? 'dark'
      : themeMode === 'light'
        ? 'light'
        : systemScheme === 'dark'
          ? 'dark'
          : 'light';

  const resolved = resolveDesignTheme(designTheme, scheme);

  // Кэшируем значение, чтобы не пересоздавать контекст на каждый рендер.
  const value = useMemo(
    () => ({
      colors: resolved.colors,
      scheme,
      designTheme,
      metrics: resolved.metrics,
      material: resolved.material,
      neu: resolved.neu,
    }),
    [resolved.colors, resolved.metrics, resolved.material, resolved.neu, scheme, designTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Возвращает текущую палитру, схему и токены оформления.
 * Должен вызываться внутри <ThemeProvider>.
 */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme должен вызываться внутри ThemeProvider');
  }
  return ctx;
}
