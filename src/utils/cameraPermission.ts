/**
 * Назначение: чистое определение состояния permission-экрана камеры.
 *
 * Функции:
 * - resolveCameraPermissionView(permission): по ответу useCameraPermissions()
 *   возвращает, какой экран показывать — загрузка / запрос / постоянный отказ /
 *   превью камеры.
 *
 * Слой: util (/src/utils). Чистая функция без React и нативных зависимостей —
 * поэтому её можно тестировать без мокирования CameraView.
 */

/** Подмножество PermissionResponse expo-camera, нужное для выбора экрана. */
export interface CameraPermissionLike {
  /** Разрешение выдано. */
  granted: boolean;
  /** Системный диалог можно запросить повторно. */
  canAskAgain: boolean;
}

/** Состояние экрана камеры по permission. */
export type CameraPermissionView = 'loading' | 'request' | 'blocked' | 'granted';

/**
 * Определяет, какой экран показывать на вкладке камеры.
 *
 * @param permission — ответ useCameraPermissions() или null, пока он не загружен.
 * @returns 'loading' | 'request' | 'blocked' | 'granted'.
 */
export function resolveCameraPermissionView(
  permission: CameraPermissionLike | null,
): CameraPermissionView {
  if (!permission) {
    return 'loading';
  }
  if (permission.granted) {
    return 'granted';
  }
  return permission.canAskAgain ? 'request' : 'blocked';
}
