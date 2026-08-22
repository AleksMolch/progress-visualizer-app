/**
 * Назначение: провайдер темы и хук доступа к текущей палитре.
 *
 * Функции:
 * - определяет системную цветовую схему и предоставляет палитру вниз по дереву;
 * - хук useAppTheme возвращает цвета и текущую схему.
 *
 * Слой: theme (/src/theme). Использует useColorScheme из react-native.
 * Ограничение: в Фазе 3 тема следует системной схеме; выбор пользователя
 * (AppSettings.themeMode) будет подключён в Фазе 4.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorScheme, type ThemeColors } from './index';

interface ThemeContextValue {
  colors: ThemeColors;
  scheme: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const colors = scheme === 'dark' ? darkColors : lightColors;

  // Кэшируем значение, чтобы не пересоздавать контекст на каждый рендер.
  const value = useMemo(() => ({ colors, scheme }), [colors, scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Возвращает текущую палитру и схему.
 * Должен вызываться внутри <ThemeProvider>.
 */
export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme должен вызываться внутри ThemeProvider');
  }
  return ctx;
}
