/**
 * Ручной мок expo-media-library для Jest.
 * Заменяет нативный модуль галереи заглушками, чтобы тесты storage-слоя
 * не зависели от нативных вызовов. Используется в тестах mediaLibrary.ts.
 *
 * Поддерживается набор API, который использует storage/mediaLibrary.ts:
 * getPermissionsAsync, requestPermissionsAsync и Asset.create.
 */

/** Флаги разрешений, которые можно менять в тестах. */
export const __permissions = {
  granted: false,
  requested: true,
};

export const getPermissionsAsync = jest.fn(async () => ({
  granted: __permissions.granted,
  status: 'granted',
  canAskAgain: true,
}));

export const requestPermissionsAsync = jest.fn(async () => ({
  granted: __permissions.requested,
  status: 'granted',
  canAskAgain: true,
}));

/** Заглушка класса Asset с статическим методом create. */
export class Asset {
  static create = jest.fn(async (_filePath: string) => ({} as unknown));
}
