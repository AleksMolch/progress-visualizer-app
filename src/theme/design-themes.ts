/**
 * Назначение: определения визуальных оформлений, platform defaults и резолвер темы.
 *
 * Функции:
 * - DESIGN_THEMES: три пользовательских оформления (modern / simple / neumorphism);
 * - getDefaultDesignThemeId(platform): дефолт оформления для новых установок;
 * - getPlatformThemeIds(platform): список оформлений для UI выбора на платформе;
 * - migrateDesignThemeId(value): переводит старые идентификаторы в новые;
 * - resolveDesignTheme(id, scheme, platform): палитра и токены для тройки
 *   «оформление + схема + платформа»;
 * - isDesignThemeId(value): валидация идентификатора оформления.
 *
 * Слой: theme (/src/theme). Чистые данные и функции без React-зависимостей.
 *
 * Важно: `modern` — один пользовательский стиль с разными platform-рендерерами
 * (iOS — Liquid Glass, Android — Material 3), без отдельного выбора пользователем.
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
  /** Радиус нижней панели вкладок (0 — обычная панель без капсулы). */
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
  /** Короткое пояснение (для UI выбора оформления). */
  description: string;
  /** Светлая палитра для искусственного превью в настройках. */
  previewLight: ThemeColors;
  /** Тёмная палитра для искусственного превью в настройках. */
  previewDark: ThemeColors;
}

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
  modern: {
    id: 'modern',
    label: 'Современный',
    description: 'Нативный вид под вашу платформу',
    previewLight: lightColors,
    previewDark: darkColors,
  },
  simple: {
    id: 'simple',
    label: 'Простой',
    description: 'Минимум эффектов, максимум читаемости',
    previewLight: lightColors,
    previewDark: darkColors,
  },
  neumorphism: {
    id: 'neumorphism',
    label: 'Неоморфизм',
    description: 'Мягкие вдавленные поверхности',
    previewLight: neuLight,
    previewDark: neuDark,
  },
};

/** Канонический список идентификаторов оформлений. */
export const DESIGN_THEME_IDS: DesignThemeId[] = ['modern', 'simple', 'neumorphism'];

// Карта старых идентификаторов (до продуктовой итерации) в новые.
// Используется только в migrateDesignThemeId — после миграции не хранится в настройках.
const LEGACY_THEME_MAP: Record<string, DesignThemeId> = {
  minimalism: 'simple',
  'liquid-glass': 'modern',
  material: 'modern',
  gallery: 'modern',
  neumorphism: 'neumorphism',
};

/**
 * Переводит сохранённое значение оформления в актуальный идентификатор.
 *
 * @param value — сохранённое (возможно, старое) значение.
 * @returns Актуальный DesignThemeId или null, если значение неизвестно.
 */
export function migrateDesignThemeId(value: unknown): DesignThemeId | null {
  if (typeof value !== 'string') {
    return null;
  }
  if (isDesignThemeId(value)) {
    return value;
  }
  return LEGACY_THEME_MAP[value] ?? null;
}

/**
 * Возвращает оформление по умолчанию для новых установок на платформе.
 * iOS → modern, Android → modern, web/прочее → simple.
 */
export function getDefaultDesignThemeId(platform: string): DesignThemeId {
  if (platform === 'ios' || platform === 'android') {
    return 'modern';
  }
  return 'simple';
}

/**
 * Возвращает список оформлений, доступных в UI выбора на платформе.
 * Набор одинаков для всех платформ: три стиля.
 */
export function getPlatformThemeIds(_platform: string): DesignThemeId[] {
  return ['modern', 'simple', 'neumorphism'];
}

/**
 * Проверяет, является ли значение корректным идентификатором оформления.
 * Используется при нормализации сохранённых настроек.
 */
export function isDesignThemeId(value: unknown): value is DesignThemeId {
  return value === 'modern' || value === 'simple' || value === 'neumorphism';
}

/** Результат резолвера: палитра и визуальные токены для текущей тройки. */
export interface ResolvedDesignTheme {
  id: DesignThemeId;
  colors: ThemeColors;
  metrics: ThemeMetrics;
  material: ThemeMaterial;
  /** Неоморфные токены (только для neumorphism), иначе undefined. */
  neu?: NeumorphismTokens;
}

// Неоморфные токены по схемам (для оформления neumorphism).
const NEU_TOKENS: Record<ColorScheme, NeumorphismTokens> = {
  light: { shadowLight: '#FFFFFF', shadowDark: '#B7C4DD', surfacePressed: '#DCE6F5' },
  dark: { shadowLight: '#2A2C34', shadowDark: '#0D0E11', surfacePressed: '#17181C' },
};

// Токены оформления «Простой» (solid-поверхности, минимальные эффекты).
const SIMPLE_METRICS: ThemeMetrics = { cardRadius: 14, buttonRadius: 10, tabBarRadius: 0 };
const SIMPLE_MATERIAL: ThemeMaterial = { card: 'solid', tabBar: 'solid' };

/**
 * Возвращает палитру и токены оформления для заданной цветовой схемы и платформы.
 * Схема уже должна быть разрешена (system → light/dark) вызывающим кодом.
 *
 * Для `modern` выбор рендерера зависит от платформы:
 * - iOS: Liquid Glass (native-glass таббар, frosted-карточки);
 * - Android: Material 3 (elevated-карточки, tonal-кнопки);
 * - прочее: solid-поверхности (fallback без native glass).
 */
export function resolveDesignTheme(
  id: DesignThemeId,
  scheme: ColorScheme,
  platform: string,
): ResolvedDesignTheme {
  if (id === 'simple') {
    return {
      id,
      colors: scheme === 'dark' ? darkColors : lightColors,
      metrics: SIMPLE_METRICS,
      material: SIMPLE_MATERIAL,
    };
  }

  if (id === 'neumorphism') {
    return {
      id,
      colors: scheme === 'dark' ? neuDark : neuLight,
      metrics: { cardRadius: 20, buttonRadius: 20, tabBarRadius: 24 },
      material: { card: 'neumorphic', tabBar: 'neumorphic' },
      neu: NEU_TOKENS[scheme],
    };
  }

  // modern: акцент и базовая палитра одинаковы на всех платформах, различаются
  // только поверхности (стекло / material / solid) и радиусы.
  const colors = scheme === 'dark' ? darkColors : lightColors;

  if (platform === 'ios') {
    return {
      id,
      colors,
      metrics: { cardRadius: 14, buttonRadius: 10, tabBarRadius: 32 },
      material: { card: 'frosted', tabBar: 'native-glass' },
    };
  }

  if (platform === 'android') {
    return {
      id,
      colors,
      metrics: { cardRadius: 12, buttonRadius: 16, tabBarRadius: 0 },
      material: { card: 'elevated', tabBar: 'solid' },
    };
  }

  return {
    id,
    colors,
    metrics: SIMPLE_METRICS,
    material: SIMPLE_MATERIAL,
  };
}
