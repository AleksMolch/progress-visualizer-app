/**
 * Назначение: цветовые схемы приложения (акцентные палитры).
 *
 * Функции:
 * - COLOR_PALETTES: три палитры (Графит / Изумруд / Коралл) для светлой и тёмной темы;
 * - DEFAULT_COLOR_PALETTE_ID: схема по умолчанию;
 * - isColorPaletteId(): валидация сохранённого значения;
 * - getColorPalette()/getNeumorphismPaletteTokens(): резолв палитры и токенов.
 *
 * Слой: theme (/src/theme). Чистые данные и функции без React-зависимостей.
 *
 * Палитры ортогональны оформлению (modern/simple/neumorphism) и цветовому режиму
 * (system/light/dark): оформление задаёт материалы и радиусы, палитра — цвета.
 */

import { type ColorPaletteId } from '@/models/settings';

import { darkColors, lightColors, type ColorScheme, type ThemeColors } from './index';

/** Схема по умолчанию для новых установок и миграции старых настроек. */
export const DEFAULT_COLOR_PALETTE_ID: ColorPaletteId = 'graphite';

/** Канонический порядок схем в UI. */
export const COLOR_PALETTE_IDS: ColorPaletteId[] = ['graphite', 'emerald', 'coral'];

/** Полное описание цветовой схемы. */
export interface ColorPaletteDefinition {
  id: ColorPaletteId;
  light: ThemeColors;
  dark: ThemeColors;
}

/**
 * Три палитры. Светлые primary подобраны так, чтобы работать и как фон кнопки
 * с белым текстом, и как цвет текста/ссылок на светлом фоне (контраст AA).
 * Тёмные primary — светлее, с тёмным primaryText.
 */
export const COLOR_PALETTES: Record<ColorPaletteId, ColorPaletteDefinition> = {
  graphite: {
    id: 'graphite',
    light: lightColors,
    dark: darkColors,
  },
  emerald: {
    id: 'emerald',
    light: {
      background: '#F4F7F3',
      surface: '#FFFFFF',
      text: '#122016',
      textSecondary: '#5F6F63',
      primary: '#0F7B45',
      primaryText: '#FFFFFF',
      border: '#DCE6DE',
      danger: '#B3261E',
    },
    dark: {
      background: '#0A120D',
      surface: '#131E17',
      text: '#EAF3EC',
      textSecondary: '#9BB0A2',
      primary: '#37C77D',
      primaryText: '#06170D',
      border: '#24352A',
      danger: '#FF7B72',
    },
  },
  coral: {
    id: 'coral',
    light: {
      background: '#FAF5F2',
      surface: '#FFFFFF',
      text: '#1D1412',
      textSecondary: '#74645F',
      primary: '#C7362A',
      primaryText: '#FFFFFF',
      border: '#EADFD9',
      danger: '#8E1B12',
    },
    dark: {
      background: '#120D0B',
      surface: '#1E1613',
      text: '#F7EFEA',
      textSecondary: '#B8A49B',
      primary: '#FF6B57',
      primaryText: '#1A0B08',
      border: '#2F2420',
      danger: '#FF8A80',
    },
  },
};

/** Токены мягких теней для оформления neumorphism (по схеме и режиму). */
export interface NeumorphismPaletteTokens {
  shadowLight: string;
  shadowDark: string;
  surfacePressed: string;
}

const NEU_TOKENS: Record<ColorPaletteId, Record<ColorScheme, NeumorphismPaletteTokens>> = {
  graphite: {
    light: { shadowLight: '#FFFFFF', shadowDark: '#D3CCBC', surfacePressed: '#EDE9DF' },
    dark: { shadowLight: '#25231D', shadowDark: '#080806', surfacePressed: '#151410' },
  },
  emerald: {
    light: { shadowLight: '#FFFFFF', shadowDark: '#C8D6C9', surfacePressed: '#E7F0E8' },
    dark: { shadowLight: '#1E2B22', shadowDark: '#070D09', surfacePressed: '#101A14' },
  },
  coral: {
    light: { shadowLight: '#FFFFFF', shadowDark: '#D8C7BE', surfacePressed: '#F1E5DF' },
    dark: { shadowLight: '#2A1E19', shadowDark: '#0A0604', surfacePressed: '#17100D' },
  },
};

/**
 * Проверяет, является ли значение корректным идентификатором цветовой схемы.
 * Используется при нормализации сохранённых настроек.
 */
export function isColorPaletteId(value: unknown): value is ColorPaletteId {
  return value === 'graphite' || value === 'emerald' || value === 'coral';
}

/**
 * Возвращает палитру схемы для светлого/тёмного режима.
 * Неизвестный id безопасно заменяется схемой по умолчанию.
 */
export function getColorPalette(id: ColorPaletteId, scheme: ColorScheme): ThemeColors {
  return (COLOR_PALETTES[id] ?? COLOR_PALETTES[DEFAULT_COLOR_PALETTE_ID])[scheme];
}

/** Возвращает токены neumorphism для выбранной схемы и режима. */
export function getNeumorphismPaletteTokens(
  id: ColorPaletteId,
  scheme: ColorScheme,
): NeumorphismPaletteTokens {
  return (NEU_TOKENS[id] ?? NEU_TOKENS[DEFAULT_COLOR_PALETTE_ID])[scheme];
}
