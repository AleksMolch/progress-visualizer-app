/**
 * Назначение: определения трёх визуальных оформлений и резолвер темы.
 *
 * Функции:
 * - DESIGN_THEMES: палитры, метрики и материалы для minimalism / liquid-glass / gallery;
 * - resolveDesignTheme(id, scheme): возвращает палитру и токены для пары «оформление + схема»;
 * - isDesignThemeId(value): валидация идентификатора оформления.
 *
 * Слой: theme (/src/theme). Чистые данные и функции без React-зависимостей.
 * Ограничение: «материалы» здесь — намерение оформления (solid/frosted/native-glass);
 * фактический рендер с учётом платформы и accessibility решает adaptive-surface.
 */

import { type DesignThemeId } from '@/models/settings';

import { darkColors, lightColors, type ColorScheme, type ThemeColors } from './index';

/** Радиусы скругления, различающиеся между оформлениями. */
export interface ThemeMetrics {
  /** Радиус карточек (поверхностей). */
  cardRadius: number;
  /** Радиус кнопок. */
  buttonRadius: number;
  /** Радиус нижней панели вкладок (0 — стандартный таббар без капсулы). */
  tabBarRadius: number;
}

/** Материал нижней панели вкладок. */
export type TabBarMaterial = 'solid' | 'frosted' | 'native-glass';
/** Материал карточек (нативный glass в списках не используем — дорого). */
export type CardMaterial = 'solid' | 'frosted';

/** Материалы поверхностей оформления. */
export interface ThemeMaterial {
  card: CardMaterial;
  tabBar: TabBarMaterial;
}

/** Полное описание одного визуального оформления. */
export interface DesignThemeDefinition {
  id: DesignThemeId;
  /** Человекочитаемое название (для UI выбора оформления). */
  label: string;
  /** Палитра светлой схемы. */
  light: ThemeColors;
  /** Палитра тёмной схемы. */
  dark: ThemeColors;
  metrics: ThemeMetrics;
  material: ThemeMaterial;
}

// Палитра оформления «Галерея» (Wolt-inspired, но собственные значения).
// Светлая схема: холодный светло-серый фон, белая карточка, бирюзовый акцент.
const galleryLight: ThemeColors = {
  background: '#F4F7F9',
  surface: '#FFFFFF',
  text: '#17212B',
  textSecondary: '#53636D',
  primary: '#007C91',
  primaryText: '#FFFFFF',
  border: '#DCE4E8',
  danger: '#D64545',
};

// Тёмная схема «Галереи»: графитовые поверхности и светлый бирюзовый акцент.
const galleryDark: ThemeColors = {
  background: '#0E171C',
  surface: '#17242A',
  text: '#EAF2F4',
  textSecondary: '#AFC0C7',
  primary: '#66D9E8',
  primaryText: '#06252B',
  border: '#26343B',
  danger: '#FF6B6B',
};

/** Все доступные оформления (порядок = порядок в UI выбора). */
export const DESIGN_THEMES: Record<DesignThemeId, DesignThemeDefinition> = {
  minimalism: {
    id: 'minimalism',
    label: 'Минимализм',
    light: lightColors,
    dark: darkColors,
    metrics: { cardRadius: 14, buttonRadius: 10, tabBarRadius: 0 },
    material: { card: 'solid', tabBar: 'solid' },
  },
  'liquid-glass': {
    id: 'liquid-glass',
    label: 'Liquid Glass',
    light: lightColors,
    dark: darkColors,
    metrics: { cardRadius: 14, buttonRadius: 10, tabBarRadius: 28 },
    material: { card: 'frosted', tabBar: 'native-glass' },
  },
  gallery: {
    id: 'gallery',
    label: 'Галерея',
    light: galleryLight,
    dark: galleryDark,
    metrics: { cardRadius: 20, buttonRadius: 14, tabBarRadius: 0 },
    material: { card: 'solid', tabBar: 'solid' },
  },
};

/** Список идентификаторов оформлений в каноническом порядке. */
export const DESIGN_THEME_IDS: DesignThemeId[] = ['minimalism', 'liquid-glass', 'gallery'];

/**
 * Проверяет, является ли значение корректным идентификатором оформления.
 * Используется при нормализации сохранённых настроек.
 */
export function isDesignThemeId(value: unknown): value is DesignThemeId {
  return value === 'minimalism' || value === 'liquid-glass' || value === 'gallery';
}

/** Результат резолвера: палитра и визуальные токены для текущей пары. */
export interface ResolvedDesignTheme {
  id: DesignThemeId;
  colors: ThemeColors;
  metrics: ThemeMetrics;
  material: ThemeMaterial;
}

/**
 * Возвращает палитру и токены оформления для заданной цветовой схемы.
 * Схема уже должна быть разрешена (system → light/dark) вызывающим кодом.
 */
export function resolveDesignTheme(id: DesignThemeId, scheme: ColorScheme): ResolvedDesignTheme {
  const def = DESIGN_THEMES[id];
  return {
    id,
    colors: scheme === 'dark' ? def.dark : def.light,
    metrics: def.metrics,
    material: def.material,
  };
}
