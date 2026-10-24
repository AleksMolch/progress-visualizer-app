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

/** Светлая палитра по умолчанию — «Графит» (тёплый нейтральный + золотой акцент). */
export const lightColors: ThemeColors = {
  background: '#F6F4EE',
  surface: '#FFFFFF',
  text: '#171614',
  textSecondary: '#6F6A60',
  primary: '#8A6A00',
  primaryText: '#FFFFFF',
  border: '#E5E0D4',
  danger: '#B3261E',
};

/** Тёмная палитра по умолчанию — «Графит». */
export const darkColors: ThemeColors = {
  background: '#0E0E0C',
  surface: '#1B1A17',
  text: '#F7F3E8',
  textSecondary: '#ABA395',
  primary: '#FFD60A',
  primaryText: '#171614',
  border: '#2C2A24',
  danger: '#FF6B6B',
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
