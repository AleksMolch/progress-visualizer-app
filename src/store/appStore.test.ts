// Тесты хранилища общего состояния приложения.
// Проверяем значения по умолчанию и переключение premium-заглушки.

import { initMmkv } from '@/storage/mmkv';
import { useAppStore } from './appStore';

// Тестовый ключ шифрования (32 символа — как AES-256).
const TEST_KEY = 'test-encryption-key-0000000000';

beforeAll(() => {
  initMmkv(TEST_KEY);
});

// Сброс состояния перед каждым тестом.
beforeEach(() => {
  useAppStore.setState({ activeProjectId: null, isUnlocked: false, premiumEnabled: false });
});

describe('appStore', () => {
  it('возвращает premium по умолчанию выключенным', () => {
    expect(useAppStore.getState().premiumEnabled).toBe(false);
  });

  it('переключает premium-заглушку', () => {
    useAppStore.getState().setPremiumEnabled(true);

    expect(useAppStore.getState().premiumEnabled).toBe(true);
  });

  it('возвращает premium обратно в выключенное состояние', () => {
    useAppStore.getState().setPremiumEnabled(true);
    useAppStore.getState().setPremiumEnabled(false);

    expect(useAppStore.getState().premiumEnabled).toBe(false);
  });
});
