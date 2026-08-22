/**
 * Назначение: дизайн-токены приложения (цвета, отступы, радиусы, типографика).
 *
 * Функции:
 * - задаёт светлую и тёмную палитры;
 * - задаёт шкалы отступов, радиусов и размеров текста.
 *
 * Слой: theme (/src/theme). Чистые константы без логики и зависимостей.
 * Решение об отказе от gluestack-ui зафиксировано в DECISIONS.md.
 */

/** Семантические цвета темы (одинаковая структура для светлой и тёмной). */
export interface ThemeColors {
  /** Фоновый цвет экрана. */
  background: string;
  /** Фоновый цвет поверхности (карточки, элементы). */
  surface: string;
  /** Основной цвет текста. */
  text: string;
  /** Второстепенный цвет текста. */
  textSecondary: string;
  /** Акцентный цвет (кнопки, ссылки). */
  primary: string;
  /** Цвет текста на акцентном фоне. */
  primaryText: string;
  /** Цвет границ. */
  border: string;
  /** Цвет деструктивных действий. */
  danger: string;
}

/** Светлая палитра. */
export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#6B6B70',
  primary: '#208AEF',
  primaryText: '#FFFFFF',
  border: '#E5E5EA',
  danger: '#FF3B30',
};

/** Тёмная палитра. */
export const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#AEAEB2',
  primary: '#208AEF',
  primaryText: '#FFFFFF',
  border: '#2C2C2E',
  danger: '#FF453A',
};

/** Шкала отступов. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Шкала радиусов скругления. */
export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 9999,
} as const;

/** Шкала размеров текста. */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

/** Имя цветовой схемы, поддерживаемое приложением. */
export type ColorScheme = 'light' | 'dark';
