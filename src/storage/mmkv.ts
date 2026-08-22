/**
 * Назначение: инициализация и доступ к зашифрованному MMKV-хранилищу.
 *
 * Функции:
 * - initMmkv(key): создаёт синглтон MMKV с шифрованием AES-256;
 * - getMmkv(): возвращает инициализированный экземпляр;
 * - mmkvStorage: адаптер для zustand persist поверх MMKV.
 *
 * Слой: storage (/src/storage). Единственное место работы с MMKV.
 * Ограничение: initMmkv должен быть вызван до любого обращения к getMmkv.
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

// Идентификатор хранилища MMKV.
const STORAGE_ID = 'progress-private';

let storage: MMKV | null = null;

/**
 * Создаёт зашифрованный экземпляр MMKV (идемпотентно).
 * @param encryptionKey — ключ шифрования (32 байта для AES-256).
 */
export function initMmkv(encryptionKey: string): void {
  if (storage) {
    return;
  }
  storage = createMMKV({
    id: STORAGE_ID,
    encryptionKey,
    encryptionType: 'AES-256',
  });
}

/**
 * Возвращает инициализированный экземпляр MMKV.
 * Бросает ошибку, если initMmkv ещё не вызывался.
 */
export function getMmkv(): MMKV {
  if (!storage) {
    throw new Error('MMKV не инициализирован: вызовите initMmkv перед обращением');
  }
  return storage;
}

// Адаптер синхронного MMKV-хранилища для zustand persist.
export const mmkvStorage: StateStorage = {
  setItem: (name, value) => getMmkv().set(name, value),
  getItem: (name) => getMmkv().getString(name) ?? null,
  removeItem: (name) => getMmkv().remove(name),
};
