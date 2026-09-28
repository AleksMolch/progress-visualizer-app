/**
 * Назначение: обёртка над expo-image-picker (выбор фото с устройства).
 *
 * Функции:
 * - pickImageFromDevice(): открывает системный photo picker и возвращает uri
 *   выбранного изображения (или null при отмене/ошибке).
 *
 * Слой: storage (/src/storage). Единственное место вызова expo-image-picker.
 * UI не должен обращаться к модулю напрямую.
 *
 * Важно (privacy): используется системный photo picker (Android 13+/iOS 14+),
 * поэтому широкое разрешение на чтение галереи НЕ запрашивается. Приложение
 * получает временный доступ только к выбранному файлу.
 */

import * as ImagePicker from 'expo-image-picker';

/**
 * Открывает системный picker для выбора одного изображения с устройства.
 *
 * @returns { uri } выбранного файла или null (отмена/ошибка/нет актива).
 */
export async function pickImageFromDevice(): Promise<{ uri: string } | null> {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset) {
      return null;
    }

    return { uri: asset.uri };
  } catch (error) {
    console.error('Ошибка выбора фото с устройства:', error);
    return null;
  }
}
