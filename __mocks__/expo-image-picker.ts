/**
 * Ручной мок expo-image-picker для Jest.
 * Заменяет нативный модуль заглушкой, чтобы тесты storage-слоя не зависели
 * от нативных вызовов. Используется в тестах imagePicker.ts.
 */

/** Управляемый результат picker (можно менять в тестах). */
export const __result = {
  canceled: false,
  assets: [{ uri: 'file:///picker/photo.jpg' }],
};

export const launchImageLibraryAsync = jest.fn(async () => __result);
