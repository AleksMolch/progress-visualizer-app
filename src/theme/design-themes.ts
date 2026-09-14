/**
 * Назначение: определения визуальных оформлений, platform defaults и резолвер темы.
 *
 * Функции:
 * - DESIGN_THEMES: палитры, метрики и материалы для пяти оформлений;
 * - getDefaultDesignThemeId(platform): дефолт оформления для платформы;
 * - getPlatformThemeIds(platform): список оформлений для UI выбора на платформе;
 * - resolveDesignTheme(id, scheme): палитра и токены для пары «оформление + схема»;
 * - isDesignThemeId(value): валидация идентификатора оформления.
 *
 * Слой: theme (/src/theme). Чистые данные и функции без React-зависимостей.
 */

import { type DesignThemeId } from '@/models/settings';

import { darkColors, lightColors, type ColorScheme, type ThemeColors } from './index';
import { type SurfaceKind } from './material';

/** Радиусы скругления, различающиеся между оформлениями. */
export interface ThemeMetrics {
  /** Радиус карточек (поверхностей). */
  cardRadius: number;
  /** Радиус кнопок. */
  buttonRadius: number;
  /** Радиус нижней панели вкладок (0 — стандартный таббар без капсулы). */
  tabBarRadius: number;
}

/** Материалы поверхностей оформления. */
export interface ThemeMaterial {
  card: SurfaceKind;
  tabBar: SurfaceKind;
}

/** Неоморфные токены (только для оформления neumorphism). */
export interface NeumorphismTokens {
  /** Цвет светлой тени (сверху-слева). */
  shadowLight: string;
  /** Цвет тёмной тени (снизу-справа). */
  shadowDark: string;
  /** Цвет поверхности в нажатом (inset) состоянии. */
  surfacePressed: string;
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
  /** Неоморфные токены по схемам (только для neumorphism). */
  neu?: { light: NeumorphismTokens; dark: NeumorphismTokens };
}

// Палитра оформления «Галерея» (Wolt-inspired, но собственные значения).
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

// Палитра «Material Design» (MD3, собственные значения по ролям).
const materialLight: ThemeColors = {
  background: '#FFFBFE',
  surface: '#FFFBFE',
  text: '#1D1B20',
  textSecondary: '#49454F',
  primary: '#6750A4',
  primaryText: '#FFFFFF',
  border: '#CAC4D0',
  danger: '#B3261E',
};

const materialDark: ThemeColors = {
  background: '#141218',
  surface: '#141218',
  text: '#E6E0E9',
  textSecondary: '#CAC4D0',
  primary: '#D0BCFF',
  primaryText: '#381E72',
  border: '#49454F',
  danger: '#F2B8B5',
};

// Палитра «Неоморфизм» (светлая/тёмная) и её теневые токены.
const neuLight: ThemeColors = {
  background: '#EAF0FA',
  surface: '#E6EEF9',
  text: '#2E3440',
  textSecondary: '#6C7A93',
  primary: '#7B9BFF',
  primaryText: '#FFFFFF',
  border: '#C6D0E4',
  danger: '#D64545',
};

const neuDark: ThemeColors = {
  background: '#18191D',
  surface: '#1E1F24',
  text: '#E1E4EB',
  textSecondary: '#8B93A6',
  primary: '#7B9BFF',
  primaryText: '#0F1117',
  border: '#2E3138',
  danger: '#FF6B6B',
};

/** Все доступные оформления (порядок — канонический, не UI-порядок). */
export const DESIGN_THEMES: Record<DesignThemeId, DesignThemeDefinition> = {
  minimalism: {
    id: 'minimalism',
    label: 'Простой',
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
    metrics: { cardRadius: 14, buttonRadius: 10, tabBarRadius: 32 },
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
  material: {
    id: 'material',
    label: 'Material Design',
    light: materialLight,
    dark: materialDark,
    metrics: { cardRadius: 12, buttonRadius: 16, tabBarRadius: 0 },
    material: { card: 'elevated', tabBar: 'solid' },
  },
  neumorphism: {
    id: 'neumorphism',
    label: 'Неоморфизм',
    light: neuLight,
    dark: neuDark,
    metrics: { cardRadius: 20, buttonRadius: 20, tabBarRadius: 0 },
    material: { card: 'neumorphic', tabBar: 'neumorphic' },
    neu: {
      light: { shadowLight: '#FFFFFF', shadowDark: '#B7C4DD', surfacePressed: '#DCE6F5' },
      dark: { shadowLight: '#2A2C34', shadowDark: '#0D0E11', surfacePressed: '#17181C' },
    },
  },
};

/** Канонический список идентификаторов оформлений. */
export const DESIGN_THEME_IDS: DesignThemeId[] = [
  'minimalism',
  'liquid-glass',
  'gallery',
  'material',
  'neumorphism',
];

/**
 * Возвращает оформление по умолчанию для новых установок на платформе.
 * iOS → Liquid Glass, Android → Material, остальные → Простой.
 */
export function getDefaultDesignThemeId(platform: string): DesignThemeId {
  if (platform === 'ios') {
    return 'liquid-glass';
  }
  if (platform === 'android') {
    return 'material';
  }
  return 'minimalism';
}

/**
 * Возвращает список оформлений, доступных в UI выбора на платформе
 * (порядок соответствует приоритету: дефолт первым).
 */
export function getPlatformThemeIds(platform: string): DesignThemeId[] {
  if (platform === 'ios') {
    return ['liquid-glass', 'minimalism', 'neumorphism', 'gallery', 'material'];
  }
  if (platform === 'android') {
    return ['material', 'minimalism', 'neumorphism', 'gallery', 'liquid-glass'];
  }
  return ['minimalism', 'neumorphism'];
}

/**
 * Проверяет, является ли значение корректным идентификатором оформления.
 * Используется при нормализации сохранённых настроек.
 */
export function isDesignThemeId(value: unknown): value is DesignThemeId {
  return (
    value === 'minimalism' ||
    value === 'liquid-glass' ||
    value === 'gallery' ||
    value === 'material' ||
    value === 'neumorphism'
  );
}

/** Результат резолвера: палитра и визуальные токены для текущей пары. */
export interface ResolvedDesignTheme {
  id: DesignThemeId;
  colors: ThemeColors;
  metrics: ThemeMetrics;
  material: ThemeMaterial;
  /** Неоморфные токены (только для neumorphism), иначе undefined. */
  neu?: NeumorphismTokens;
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
    neu: def.neu ? def.neu[scheme] : undefined,
  };
}
