// Тесты определений визуальных оформлений, platform defaults, миграции и резолвера.
// Проверяем три оформления, platform-рендер modern, миграцию старых id и валидацию.

import {
  DESIGN_THEME_IDS,
  DESIGN_THEMES,
  getDefaultDesignThemeId,
  getPlatformThemeIds,
  isDesignThemeId,
  migrateDesignThemeId,
  resolveDesignTheme,
  resolveDesignThemeId,
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
  it('содержит ровно три оформления', () => {
    expect(DESIGN_THEME_IDS).toEqual(['modern', 'simple', 'neumorphism']);
    expect(Object.keys(DESIGN_THEMES).sort()).toEqual(['modern', 'neumorphism', 'simple']);
  });

  it('simple использует фирменную палитру и solid-поверхности', () => {
    const r = resolveDesignTheme('simple', 'light', 'ios');
    expect(r.id).toBe('simple');
    expect(r.colors.primary).toBe('#208AEF');
    expect(r.material.card).toBe('solid');
    expect(r.material.tabBar).toBe('solid');
  });

  it('neumorphism имеет neu-токены и neumorphic поверхности', () => {
    const r = resolveDesignTheme('neumorphism', 'light', 'ios');
    expect(r.material.card).toBe('neumorphic');
    expect(r.material.tabBar).toBe('neumorphic');
    expect(r.neu).toBeTruthy();
    expect(r.neu?.shadowLight).toBe('#FFFFFF');
  });

  it('modern на iOS — Liquid Glass (native-glass таббар, frosted-карточки)', () => {
    const r = resolveDesignTheme('modern', 'light', 'ios');
    expect(r.material.tabBar).toBe('native-glass');
    expect(r.material.card).toBe('frosted');
  });

  it('modern на Android — Material (elevated-карточки, solid таббар)', () => {
    const r = resolveDesignTheme('modern', 'dark', 'android');
    expect(r.material.card).toBe('elevated');
    expect(r.material.tabBar).toBe('solid');
  });

  it('modern на web/прочее — solid fallback без native glass', () => {
    const r = resolveDesignTheme('modern', 'light', 'web');
    expect(r.material.card).toBe('solid');
    expect(r.material.tabBar).toBe('solid');
  });

  it('каждая пара «оформление + схема» даёт полный набор цветов на каждой платформе', () => {
    for (const id of DESIGN_THEME_IDS) {
      for (const scheme of ['light', 'dark'] as const) {
        for (const platform of ['ios', 'android', 'web']) {
          const { colors } = resolveDesignTheme(id, scheme, platform);
          for (const key of COLOR_KEYS) {
            expect(colors[key]).toBeTruthy();
          }
        }
      }
    }
  });

  it('валидирует идентификатор оформления', () => {
    for (const id of DESIGN_THEME_IDS) {
      expect(isDesignThemeId(id)).toBe(true);
    }
    expect(isDesignThemeId('unknown')).toBe(false);
    expect(isDesignThemeId('minimalism')).toBe(false);
    expect(isDesignThemeId('')).toBe(false);
    expect(isDesignThemeId(undefined)).toBe(false);
    expect(isDesignThemeId(null)).toBe(false);
    expect(isDesignThemeId(42)).toBe(false);
  });
});

describe('getDefaultDesignThemeId', () => {
  it('iOS → modern', () => {
    expect(getDefaultDesignThemeId('ios')).toBe('modern');
  });

  it('Android → modern', () => {
    expect(getDefaultDesignThemeId('android')).toBe('modern');
  });

  it('web/прочее → simple', () => {
    expect(getDefaultDesignThemeId('web')).toBe('simple');
    expect(getDefaultDesignThemeId('macos')).toBe('simple');
  });
});

describe('getPlatformThemeIds', () => {
  it('iOS/web: три стиля (Современный, Простой, Неоморфизм)', () => {
    expect(getPlatformThemeIds('ios')).toEqual(['modern', 'simple', 'neumorphism']);
    expect(getPlatformThemeIds('web')).toEqual(['modern', 'simple', 'neumorphism']);
  });

  it('Android: только Современный и Неоморфизм (без «Простого»)', () => {
    expect(getPlatformThemeIds('android')).toEqual(['modern', 'neumorphism']);
  });
});

describe('resolveDesignThemeId', () => {
  it('на Android мигрирует simple/minimalism в modern', () => {
    expect(resolveDesignThemeId('simple', 'android')).toBe('modern');
    expect(resolveDesignThemeId('minimalism', 'android')).toBe('modern');
  });

  it('на iOS/прочее оставляет simple без изменений', () => {
    expect(resolveDesignThemeId('simple', 'ios')).toBe('simple');
    expect(resolveDesignThemeId('simple', 'web')).toBe('simple');
  });

  it('возвращает null для неизвестного значения', () => {
    expect(resolveDesignThemeId('unknown', 'android')).toBeNull();
    expect(resolveDesignThemeId(42, 'ios')).toBeNull();
  });
});

describe('migrateDesignThemeId', () => {
  it('оставляет новые значения без изменений', () => {
    expect(migrateDesignThemeId('modern')).toBe('modern');
    expect(migrateDesignThemeId('simple')).toBe('simple');
    expect(migrateDesignThemeId('neumorphism')).toBe('neumorphism');
  });

  it('переносит старые значения в новые', () => {
    expect(migrateDesignThemeId('minimalism')).toBe('simple');
    expect(migrateDesignThemeId('liquid-glass')).toBe('modern');
    expect(migrateDesignThemeId('material')).toBe('modern');
    expect(migrateDesignThemeId('gallery')).toBe('modern');
    expect(migrateDesignThemeId('neumorphism')).toBe('neumorphism');
  });

  it('возвращает null для неизвестного значения', () => {
    expect(migrateDesignThemeId('unknown')).toBeNull();
    expect(migrateDesignThemeId('')).toBeNull();
    expect(migrateDesignThemeId(42)).toBeNull();
    expect(migrateDesignThemeId(undefined)).toBeNull();
    expect(migrateDesignThemeId(null)).toBeNull();
  });
});
