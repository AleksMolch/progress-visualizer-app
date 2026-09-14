// Тесты определений визуальных оформлений и резолвера темы.
// Проверяем: полный набор цветов для каждой пары «оформление + схема»,
// корректные палитры Галереи и валидацию идентификатора оформления.

import { DESIGN_THEME_IDS, DESIGN_THEMES, isDesignThemeId, resolveDesignTheme } from './design-themes';

// Все обязательные семантические цвета палитры.
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

describe('design-themes', () => {
  it('содержит три оформления в каноническом порядке', () => {
    expect(DESIGN_THEME_IDS).toEqual(['minimalism', 'liquid-glass', 'gallery']);
    expect(Object.keys(DESIGN_THEMES).sort()).toEqual(['gallery', 'liquid-glass', 'minimalism']);
  });

  it('резолвит минимализм в фирменную синюю палитру', () => {
    const r = resolveDesignTheme('minimalism', 'light');
    expect(r.id).toBe('minimalism');
    expect(r.colors.primary).toBe('#208AEF');
    expect(r.material.tabBar).toBe('solid');
  });

  it('резолвит галерею в тёмную палитру с бирюзовым акцентом', () => {
    const r = resolveDesignTheme('gallery', 'dark');
    expect(r.colors.primary).toBe('#66D9E8');
    expect(r.colors.background).toBe('#0E171C');
    expect(r.colors.surface).toBe('#17242A');
  });

  it('liquid-glass использует материал native-glass для таббара и frosted для карточек', () => {
    const r = resolveDesignTheme('liquid-glass', 'light');
    expect(r.material.tabBar).toBe('native-glass');
    expect(r.material.card).toBe('frosted');
  });

  it('каждая пара «оформление + схема» даёт полный набор цветов', () => {
    for (const id of DESIGN_THEME_IDS) {
      for (const scheme of ['light', 'dark'] as const) {
        const { colors } = resolveDesignTheme(id, scheme);
        for (const key of COLOR_KEYS) {
          expect(colors[key]).toBeTruthy();
        }
      }
    }
  });

  it('различает радиусы оформлений (галерея крупнее минимализма)', () => {
    const gallery = resolveDesignTheme('gallery', 'light').metrics;
    const minimalism = resolveDesignTheme('minimalism', 'light').metrics;
    expect(gallery.cardRadius).toBeGreaterThan(minimalism.cardRadius);
    expect(gallery.buttonRadius).toBeGreaterThan(minimalism.buttonRadius);
  });

  it('валидирует идентификатор оформления', () => {
    expect(isDesignThemeId('minimalism')).toBe(true);
    expect(isDesignThemeId('liquid-glass')).toBe(true);
    expect(isDesignThemeId('gallery')).toBe(true);
    expect(isDesignThemeId('unknown')).toBe(false);
    expect(isDesignThemeId('')).toBe(false);
    expect(isDesignThemeId(undefined)).toBe(false);
    expect(isDesignThemeId(null)).toBe(false);
    expect(isDesignThemeId(42)).toBe(false);
  });
});
