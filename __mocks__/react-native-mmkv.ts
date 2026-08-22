/**
 * Ручной мок react-native-mmkv для Jest.
 * Заменяет нативное хранилище in-memory Map-объектом, чтобы тесты стора
 * не зависели от нативных модулей (Nitro Modules).
 */

interface MockMmkv {
  set: (key: string, value: string | number | boolean) => void;
  getString: (key: string) => string | undefined;
  getBoolean: (key: string) => boolean | undefined;
  getNumber: (key: string) => number | undefined;
  remove: (key: string) => boolean;
  clearAll: () => void;
  contains: (key: string) => boolean;
  getAllKeys: () => string[];
}

export function createMMKV(_config?: unknown): MockMmkv {
  const storage = new Map<string, string | number | boolean>();

  return {
    set(key, value) {
      storage.set(key, value);
    },
    getString(key) {
      const value = storage.get(key);
      return typeof value === 'string' ? value : undefined;
    },
    getBoolean(key) {
      const value = storage.get(key);
      return typeof value === 'boolean' ? value : undefined;
    },
    getNumber(key) {
      const value = storage.get(key);
      return typeof value === 'number' ? value : undefined;
    },
    remove(key) {
      return storage.delete(key);
    },
    clearAll() {
      storage.clear();
    },
    contains(key) {
      return storage.has(key);
    },
    getAllKeys() {
      return Array.from(storage.keys());
    },
  };
}
