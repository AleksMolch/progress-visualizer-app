// Тесты хранилища настроек.
// Проверяем частичное обновление настроек и значения по умолчанию.

import { initMmkv } from '@/storage/mmkv';
import { DEFAULT_SETTINGS, useSettingsStore } from './settingsStore';

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
});
