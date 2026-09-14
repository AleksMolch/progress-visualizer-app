// Тесты определений визуальных оформлений, platform defaults и резолвера.
// Проверяем полный набор цветов, палитры тем, platform default и валидацию.

import {
  DESIGN_THEME_IDS,
  DESIGN_THEMES,
  getDefaultDesignThemeId,
  getPlatformThemeIds,
  isDesignThemeId,
  resolveDesignTheme,
} from './design-themes';

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
  it('содержит пять оформлений', () => {
    expect(DESIGN_THEME_IDS).toEqual([
      'minimalism',
      'liquid-glass',
      'gallery',
      'material',
      'neumorphism',
    ]);
    expect(Object.keys(DESIGN_THEMES).sort()).toEqual([
      'gallery',
      'liquid-glass',
      'material',
      'minimalism',
      'neumorphism',
    ]);
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
  });

  it('liquid-glass использует native-glass для таббара и frosted для карточек', () => {
    const r = resolveDesignTheme('liquid-glass', 'light');
    expect(r.material.tabBar).toBe('native-glass');
    expect(r.material.card).toBe('frosted');
  });

  it('material использует elevated-карточки и палитру MD3', () => {
    const r = resolveDesignTheme('material', 'light');
    expect(r.material.card).toBe('elevated');
    expect(r.colors.primary).toBe('#6750A4');
  });

  it('neumorphism имеет neu-токены и neumorphic поверхности', () => {
    const r = resolveDesignTheme('neumorphism', 'light');
    expect(r.material.card).toBe('neumorphic');
    expect(r.neu).toBeTruthy();
    expect(r.neu?.shadowLight).toBe('#FFFFFF');
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
    for (const id of DESIGN_THEME_IDS) {
      expect(isDesignThemeId(id)).toBe(true);
    }
    expect(isDesignThemeId('unknown')).toBe(false);
    expect(isDesignThemeId('')).toBe(false);
    expect(isDesignThemeId(undefined)).toBe(false);
    expect(isDesignThemeId(null)).toBe(false);
    expect(isDesignThemeId(42)).toBe(false);
  });
});

describe('getDefaultDesignThemeId', () => {
  it('iOS → liquid-glass', () => {
    expect(getDefaultDesignThemeId('ios')).toBe('liquid-glass');
  });

  it('Android → material', () => {
    expect(getDefaultDesignThemeId('android')).toBe('material');
  });

  it('web/прочее → minimalism', () => {
    expect(getDefaultDesignThemeId('web')).toBe('minimalism');
    expect(getDefaultDesignThemeId('macos')).toBe('minimalism');
  });
});

describe('getPlatformThemeIds', () => {
  it('iOS: Liquid Glass первым, содержит Простой и Неоморфизм', () => {
    const ids = getPlatformThemeIds('ios');
    expect(ids[0]).toBe('liquid-glass');
    expect(ids).toContain('minimalism');
    expect(ids).toContain('neumorphism');
  });

  it('Android: Material первым, содержит Простой и Неоморфизм', () => {
    const ids = getPlatformThemeIds('android');
    expect(ids[0]).toBe('material');
    expect(ids).toContain('minimalism');
    expect(ids).toContain('neumorphism');
  });

  it('web/прочее: Простой и Неоморфизм', () => {
    expect(getPlatformThemeIds('web')).toEqual(['minimalism', 'neumorphism']);
  });
});
