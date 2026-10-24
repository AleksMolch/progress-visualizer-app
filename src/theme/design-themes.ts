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

import { type ColorPaletteId, type DesignThemeId } from '@/models/settings';

import {
  COLOR_PALETTES,
  DEFAULT_COLOR_PALETTE_ID,
  getColorPalette,
  getNeumorphismPaletteTokens,
} from './color-palettes';
import { type ColorScheme, type ThemeColors } from './index';
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
  /** Светлая палитра для искусственного превью в настройках. */
  previewLight: ThemeColors;
  /** Тёмная палитра для искусственного превью в настройках. */
  previewDark: ThemeColors;
}

/** Все доступные оформления (порядок — канонический, не UI-порядок). */
export const DESIGN_THEMES: Record<DesignThemeId, DesignThemeDefinition> = {
  modern: {
    id: 'modern',
    previewLight: COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID].light,
    previewDark: COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID].dark,
  },
  simple: {
    id: 'simple',
    previewLight: COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID].light,
    previewDark: COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID].dark,
  },
  neumorphism: {
    id: 'neumorphism',
    previewLight: COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID].light,
    previewDark: COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID].dark,
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
 * Резолвит сохранённое значение оформления с учётом платформы.
 *
 * На Android стиль `simple` недоступен (остались только modern и neumorphism),
 * поэтому сохранённое `simple` (и устаревшее `minimalism`) мигрирует в `modern`.
 * @param value — сохранённое (возможно, старое) значение.
 * @param platform — платформа ('ios' | 'android' | прочее).
 * @returns Актуальный DesignThemeId или null, если значение неизвестно.
 */
export function resolveDesignThemeId(value: unknown, platform: string): DesignThemeId | null {
  const migrated = migrateDesignThemeId(value);
  if (migrated === 'simple' && platform === 'android') {
    return 'modern';
  }
  return migrated;
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
 * На Android стиль `simple` скрыт: остаются только modern и neumorphism.
 */
export function getPlatformThemeIds(platform: string): DesignThemeId[] {
  if (platform === 'android') {
    return ['modern', 'neumorphism'];
  }
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
  paletteId: ColorPaletteId = DEFAULT_COLOR_PALETTE_ID,
): ResolvedDesignTheme {
  // Палитра едина для всех оформлений; оформление задаёт материалы и радиусы.
  const colors = getColorPalette(paletteId, scheme);

  if (id === 'simple') {
    return {
      id,
      colors,
      metrics: SIMPLE_METRICS,
      material: SIMPLE_MATERIAL,
    };
  }

  if (id === 'neumorphism') {
    return {
      id,
      colors,
      metrics: { cardRadius: 20, buttonRadius: 20, tabBarRadius: 24 },
      material: { card: 'neumorphic', tabBar: 'neumorphic' },
      neu: getNeumorphismPaletteTokens(paletteId, scheme),
    };
  }

  // modern: одна палитра на всех платформах, различаются только поверхности
  // (стекло / material / solid) и радиусы.

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
