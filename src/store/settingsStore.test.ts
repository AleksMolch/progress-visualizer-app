// Тесты хранилища настроек.
// Проверяем частичное обновление настроек, значения по умолчанию,
// нормализацию сохранённых настроек и гидратацию старой записи без designTheme.

import { initMmkv, mmkvStorage } from '@/storage/mmkv';
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
    // Прозрачность сохраняется и не сбрасывается при выключении overlay.
    expect(settings.ghostOpacity).toBe(DEFAULT_SETTINGS.ghostOpacity);
  });

  it('переключает оформление, сохраняя остальные настройки', () => {
    useSettingsStore.getState().updateSettings({ designTheme: 'gallery' });

    const { settings } = useSettingsStore.getState();
    expect(settings.designTheme).toBe('gallery');
    expect(settings.ghostEnabled).toBe(DEFAULT_SETTINGS.ghostEnabled);
  });
});

describe('normalizeSettings', () => {
  it('добавляет designTheme=minimalism для старой записи без поля', () => {
    const settings = normalizeSettings({ ghostEnabled: true, themeMode: 'dark' });
    expect(settings.designTheme).toBe('minimalism');
    expect(settings.ghostEnabled).toBe(true);
    expect(settings.themeMode).toBe('dark');
  });

  it('неизвестный designTheme заменяется на minimalism', () => {
    const settings = normalizeSettings({ designTheme: 'future-theme' });
    expect(settings.designTheme).toBe('minimalism');
  });

  it('сохраняет валидный designTheme', () => {
    const settings = normalizeSettings({ designTheme: 'gallery' });
    expect(settings.designTheme).toBe('gallery');
  });

  it('неизвестный themeMode заменяется на system', () => {
    const settings = normalizeSettings({ themeMode: 'sepia' });
    expect(settings.themeMode).toBe('system');
  });

  it('обрабатывает null/undefined как значения по умолчанию', () => {
    expect(normalizeSettings(undefined).designTheme).toBe('minimalism');
    expect(normalizeSettings(null).themeMode).toBe('system');
    expect(normalizeSettings('not-an-object').ghostEnabled).toBe(DEFAULT_SETTINGS.ghostEnabled);
  });
});

describe('settingsStore: гидратация старой записи', () => {
  it('старая запись без designTheme → minimalism, прежние поля сохранены', async () => {
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
    expect(settings.designTheme).toBe('minimalism');
    expect(settings.ghostEnabled).toBe(true);
    expect(settings.ghostOpacity).toBe(0.8);
    expect(settings.requireBiometrics).toBe(true);
    // Отсутствовавшие поля получают значения по умолчанию.
    expect(settings.remindersEnabled).toBe(DEFAULT_SETTINGS.remindersEnabled);
  });

  it('сохраняет выбранный ранее designTheme после гидратации', async () => {
    mmkvStorage.setItem(
      'settings',
      JSON.stringify({ state: { settings: { designTheme: 'gallery' } }, version: 0 }),
    );

    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().settings.designTheme).toBe('gallery');
  });
});
