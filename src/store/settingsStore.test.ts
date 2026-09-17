// Тесты хранилища настроек.
// Проверяем частичное обновление, значения по умолчанию, нормализацию с
// платформенным дефолтом оформления и гидратацию старой записи.

import { Platform } from 'react-native';

import { initMmkv, mmkvStorage } from '@/storage/mmkv';
import { getDefaultDesignThemeId } from '@/theme/design-themes';
import { DEFAULT_SETTINGS, normalizeSettings, useSettingsStore } from './settingsStore';

// Тестовый ключ шифрования (32 символа — как AES-256).
const TEST_KEY = 'test-encryption-key-0000000000';

beforeAll(() => {
  initMmkv(TEST_KEY);
});

// Сброс состояния перед каждым тестом.
beforeEach(() => {
  useSettingsStore.setState({ settings: DEFAULT_SETTINGS });
});

describe('settingsStore', () => {
  it('возвращает настройки по умолчанию', () => {
    expect(useSettingsStore.getState().settings).toEqual(DEFAULT_SETTINGS);
  });

  it('частично обновляет настройки', () => {
    useSettingsStore.getState().updateSettings({ ghostOpacity: 0.8 });

    const { settings } = useSettingsStore.getState();
    expect(settings.ghostOpacity).toBe(0.8);
    // Остальные поля не изменились.
    expect(settings.themeMode).toBe(DEFAULT_SETTINGS.themeMode);
  });

  it('обновляет несколько полей сразу', () => {
    useSettingsStore.getState().updateSettings({ gridEnabled: false, requireBiometrics: true });

    const { settings } = useSettingsStore.getState();
    expect(settings.gridEnabled).toBe(false);
    expect(settings.requireBiometrics).toBe(true);
  });

  it('переключает ghost overlay независимо от прозрачности', () => {
    useSettingsStore.getState().updateSettings({ ghostEnabled: false });

    const { settings } = useSettingsStore.getState();
    expect(settings.ghostEnabled).toBe(false);
    expect(settings.ghostOpacity).toBe(DEFAULT_SETTINGS.ghostOpacity);
  });

  it('переключает оформление, сохраняя остальные настройки', () => {
    useSettingsStore.getState().updateSettings({ designTheme: 'simple' });

    const { settings } = useSettingsStore.getState();
    expect(settings.designTheme).toBe('simple');
    expect(settings.ghostEnabled).toBe(DEFAULT_SETTINGS.ghostEnabled);
  });

  it('hapticsEnabled по умолчанию включён', () => {
    expect(DEFAULT_SETTINGS.hapticsEnabled).toBe(true);
  });
});

describe('normalizeSettings (platform default + миграция)', () => {
  it('iOS: старая запись без designTheme → modern', () => {
    const settings = normalizeSettings({ ghostEnabled: true, themeMode: 'dark' }, 'ios');
    expect(settings.designTheme).toBe('modern');
    expect(settings.ghostEnabled).toBe(true);
    expect(settings.themeMode).toBe('dark');
  });

  it('Android: старая запись без designTheme → modern', () => {
    expect(normalizeSettings({}, 'android').designTheme).toBe('modern');
  });

  it('web/прочее: без designTheme → simple', () => {
    expect(normalizeSettings({}, 'web').designTheme).toBe('simple');
  });

  it('неизвестный designTheme заменяется на platform default', () => {
    expect(normalizeSettings({ designTheme: 'future-theme' }, 'ios').designTheme).toBe('modern');
    expect(normalizeSettings({ designTheme: 42 }, 'android').designTheme).toBe('modern');
  });

  it('старые идентификаторы мигрируют в новые', () => {
    expect(normalizeSettings({ designTheme: 'minimalism' }, 'ios').designTheme).toBe('simple');
    expect(normalizeSettings({ designTheme: 'liquid-glass' }, 'ios').designTheme).toBe('modern');
    expect(normalizeSettings({ designTheme: 'material' }, 'android').designTheme).toBe('modern');
    expect(normalizeSettings({ designTheme: 'gallery' }, 'android').designTheme).toBe('modern');
    expect(normalizeSettings({ designTheme: 'neumorphism' }, 'web').designTheme).toBe('neumorphism');
  });

  it('явный валидный designTheme сохраняется, не заменяется default', () => {
    expect(normalizeSettings({ designTheme: 'simple' }, 'ios').designTheme).toBe('simple');
    expect(normalizeSettings({ designTheme: 'modern' }, 'android').designTheme).toBe('modern');
    expect(normalizeSettings({ designTheme: 'neumorphism' }, 'web').designTheme).toBe('neumorphism');
  });

  it('неизвестный themeMode заменяется на system', () => {
    const settings = normalizeSettings({ themeMode: 'sepia' }, 'ios');
    expect(settings.themeMode).toBe('system');
  });

  it('сохраняет hapticsEnabled из старой записи', () => {
    expect(normalizeSettings({ hapticsEnabled: false }, 'ios').hapticsEnabled).toBe(false);
    expect(normalizeSettings({}, 'ios').hapticsEnabled).toBe(true);
  });

  it('обрабатывает null/undefined как значения по умолчанию', () => {
    expect(normalizeSettings(undefined, 'ios').designTheme).toBe('modern');
    expect(normalizeSettings(null, 'android').themeMode).toBe('system');
    expect(normalizeSettings('not-an-object', 'web').ghostEnabled).toBe(DEFAULT_SETTINGS.ghostEnabled);
  });

  it('Android: сохранённый simple/minimalism мигрирует в modern', () => {
    expect(normalizeSettings({ designTheme: 'simple' }, 'android').designTheme).toBe('modern');
    expect(normalizeSettings({ designTheme: 'minimalism' }, 'android').designTheme).toBe('modern');
  });

  it('iOS: simple сохраняется (доступен)', () => {
    expect(normalizeSettings({ designTheme: 'simple' }, 'ios').designTheme).toBe('simple');
  });
});

describe('normalizeSettings (язык)', () => {
  it('явный валидный язык сохраняется', () => {
    expect(normalizeSettings({ language: 'es' }, 'ios').language).toBe('es');
  });

  it('без сохранённого языка → русский (default)', () => {
    expect(normalizeSettings({}, 'ios').language).toBe('ru');
    expect(normalizeSettings({}, 'android').language).toBe('ru');
  });

  it('неизвестный язык → русский (default)', () => {
    expect(normalizeSettings({ language: 'fr' }, 'ios').language).toBe('ru');
  });

  it('значение по умолчанию в DEFAULT_SETTINGS — русский', () => {
    expect(DEFAULT_SETTINGS.language).toBe('ru');
  });
});

describe('settingsStore: гидратация старой записи', () => {
  it('старая запись без designTheme → platform default, прежние поля сохранены', async () => {
    // Имитируем сохранённую старым приложением запись (без designTheme).
    mmkvStorage.setItem(
      'settings',
      JSON.stringify({
        state: { settings: { ghostEnabled: true, ghostOpacity: 0.8, requireBiometrics: true } },
        version: 0,
      }),
    );

    await useSettingsStore.persist.rehydrate();

    const { settings } = useSettingsStore.getState();
    expect(settings.designTheme).toBe(getDefaultDesignThemeId(Platform.OS));
    expect(settings.ghostEnabled).toBe(true);
    expect(settings.ghostOpacity).toBe(0.8);
    expect(settings.requireBiometrics).toBe(true);
    // Отсутствовавшие поля получают значения по умолчанию.
    expect(settings.remindersEnabled).toBe(DEFAULT_SETTINGS.remindersEnabled);
  });

  it('сохраняет выбранный ранее designTheme после гидратации', async () => {
    mmkvStorage.setItem(
      'settings',
      JSON.stringify({ state: { settings: { designTheme: 'neumorphism' } }, version: 0 }),
    );

    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().settings.designTheme).toBe('neumorphism');
  });

  it('старый designTheme мигрирует после гидратации', async () => {
    mmkvStorage.setItem(
      'settings',
      JSON.stringify({ state: { settings: { designTheme: 'liquid-glass' } }, version: 0 }),
    );

    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().settings.designTheme).toBe('modern');
  });
});
