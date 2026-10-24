// Тесты цветовых схем: состав палитр, валидация и neumorphism-токены.

import {
  COLOR_PALETTE_IDS,
  COLOR_PALETTES,
  DEFAULT_COLOR_PALETTE_ID,
  getColorPalette,
  getNeumorphismPaletteTokens,
  isColorPaletteId,
} from './color-palettes';

const COLOR_KEYS = [
  'background',
  'surface',
  'text',
  'textSecondary',
  'primary',
  'primaryText',
  'border',
  'danger',
] as const;

describe('color-palettes', () => {
  it('содержит ровно три схемы и корректный default', () => {
    expect(COLOR_PALETTE_IDS).toEqual(['graphite', 'emerald', 'coral']);
    expect(COLOR_PALETTE_IDS).toContain(DEFAULT_COLOR_PALETTE_ID);
  });

  it('каждая схема имеет полный набор цветов в light и dark', () => {
    for (const id of COLOR_PALETTE_IDS) {
      for (const scheme of ['light', 'dark'] as const) {
        const colors = getColorPalette(id, scheme);
        for (const key of COLOR_KEYS) {
          expect(colors[key]).toBeTruthy();
        }
      }
    }
  });

  it('акценты схем различаются', () => {
    const primaries = COLOR_PALETTE_IDS.map((id) => COLOR_PALETTES[id].light.primary);
    expect(new Set(primaries).size).toBe(COLOR_PALETTE_IDS.length);
  });

  it('neumorphism-токены заданы для каждой схемы и режима', () => {
    for (const id of COLOR_PALETTE_IDS) {
      for (const scheme of ['light', 'dark'] as const) {
        const tokens = getNeumorphismPaletteTokens(id, scheme);
        expect(tokens.shadowLight).toBeTruthy();
        expect(tokens.shadowDark).toBeTruthy();
        expect(tokens.surfacePressed).toBeTruthy();
      }
    }
  });

  it('валидирует идентификатор схемы', () => {
    for (const id of COLOR_PALETTE_IDS) {
      expect(isColorPaletteId(id)).toBe(true);
    }
    expect(isColorPaletteId('blue')).toBe(false);
    expect(isColorPaletteId(undefined)).toBe(false);
    expect(isColorPaletteId(42)).toBe(false);
  });
});
