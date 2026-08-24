/**
 * Назначение: обёртка над expo-media-library (экспорт фото в галерею).
 *
 * Функции:
 * - requestMediaLibraryPermission(): запрашивает write-only доступ к галерее;
 * - exportPhotoToLibrary(fileUri): сохраняет файл фото в галерею устройства.
 *
 * Слой: storage (/src/storage). Единственное место вызова expo-media-library.
 * UI не должен обращаться к модулю напрямую.
 *
 * Важно (privacy): экспорт происходит ТОЛЬКО по явному действию пользователя.
 * По умолчанию фото хранятся в sandbox и в галерею не пишутся (CONSTITUTION.md).
 */

import * as MediaLibrary from 'expo-media-library';

/**
 * Запрашивает доступ к сохранению в галерею (write-only, без права чтения).
 * @returns true, если доступ в итоге выдан.
 */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  const current = await MediaLibrary.getPermissionsAsync(true);
  if (current.granted) {
    return true;
  }

  const requested = await MediaLibrary.requestPermissionsAsync(true);
  return requested.granted;
}

/**
 * Сохраняет файл фото в системную галерею устройства.
 *
 * @param fileUri — локальный путь к файлу фото (file:// uri из sandbox).
 * @returns true при успешном экспорте, false при ошибке.
 *
 * Важно: после экспорта фото находится ВНЕ sandbox приложения — в галерее,
 * где его могут видеть другие приложения. Это сообщается пользователю
 * в UI до выполнения экспорта.
 */
export async function exportPhotoToLibrary(fileUri: string): Promise<boolean> {
  try {
    await MediaLibrary.Asset.create(fileUri);
    return true;
  } catch (error) {
    console.error('Ошибка экспорта фото в галерею:', error);
    return false;
  }
}
