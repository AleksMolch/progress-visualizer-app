/**
 * Назначение: чистые функции для выборки фотографий проекта.
 *
 * Функции:
 * - getLatestPhoto(): возвращает самое свежее фото проекта (по takenAt)
 *   или null, если фото ещё нет.
 *
 * Слой: util (/src/utils). Чистая функция без внешних зависимостей.
 */

import { type PhotoMetadata } from '@/models/photo';

/**
 * Возвращает последнее (самое свежее) фото проекта.
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @returns Последнее фото проекта или null, если фото ещё нет.
 */
export function getLatestPhoto(
  photos: PhotoMetadata[],
  projectId: string,
): PhotoMetadata | null {
  let latest: PhotoMetadata | null = null;
  for (const photo of photos) {
    if (photo.projectId !== projectId) {
      continue;
    }
    if (latest === null || photo.takenAt > latest.takenAt) {
      latest = photo;
    }
  }
  return latest;
}
