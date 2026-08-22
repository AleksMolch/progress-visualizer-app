/**
 * Назначение: управление ключом шифрования локального хранилища.
 *
 * Функции:
 * - getOrCreateEncryptionKey(): возвращает существующий ключ или создаёт новый,
 *   сохраняя его в SecureStore (Keychain/Keystore).
 *
 * Слой: storage (/src/storage). Единственное место работы с SecureStore.
 * Ограничение: ключ имеет длину 32 байта (AES-256 для MMKV).
 */

import { getRandomBytes } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Имя записи ключа в SecureStore.
const ENCRYPTION_KEY_NAME = 'progress-private.mmkv-key';

// Переводит байты в hex-строку (каждый байт — 2 символа).
function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Генерирует ключ из 16 случайных байт = 32 hex-символа = 32 байта (AES-256).
function generateKey(): string {
  return bytesToHex(getRandomBytes(16));
}

/**
 * Возвращает ключ шифрования из SecureStore либо создаёт и сохраняет новый.
 * Вызывается один раз при старте приложения, до инициализации MMKV.
 */
export async function getOrCreateEncryptionKey(): Promise<string> {
  const existing = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
  if (existing) {
    return existing;
  }

  const key = generateKey();
  await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
  return key;
}
