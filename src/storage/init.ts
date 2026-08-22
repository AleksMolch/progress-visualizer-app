/**
 * Назначение: инициализация локального хранилища при старте приложения.
 *
 * Функции:
 * - initializeStorage(): получает/создаёт ключ шифрования, инициализирует MMKV
 *   и восстанавливает состояние сторов.
 *
 * Слой: storage (/src/storage). Вызывается один раз из root layout.
 */

import { rehydrateStores } from '@/store';

import { initMmkv } from './mmkv';
import { getOrCreateEncryptionKey } from './secureKeys';

/**
 * Полная инициализация хранилища.
 * Должна завершиться до первого обращения к store из UI.
 */
export async function initializeStorage(): Promise<void> {
  const key = await getOrCreateEncryptionKey();
  initMmkv(key);
  await rehydrateStores();
}
