/**
 * Назначение: чистые функции для выборки фотографий проекта.
 *
 * Функции:
 * - getProjectPhotos(): фото проекта, свежие сверху;
 * - getChronologicalPhotos(): фото проекта от ранних к поздним;
 * - getVisiblePhotos(): НЕ скрытые фото проекта;
 * - getFirstVisiblePhoto() / getLatestVisiblePhoto(): первая/последняя видимая точка.
 *
 * Слой: util (/src/utils). Чистые функции без внешних зависимостей.
 */

import { type PhotoMetadata } from '@/models/photo';

/**
 * Возвращает фото проекта, отсортированные по времени съёмки (свежие сверху).
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @returns Массив фото проекта, отсортированный по takenAt (новые первыми).
 */
export function getProjectPhotos(
  photos: PhotoMetadata[],
  projectId: string,
): PhotoMetadata[] {
  return photos
    .filter((photo) => photo.projectId === projectId)
    .sort((a, b) => b.takenAt - a.takenAt);
}

/**
 * Возвращает фото проекта в хронологическом порядке (от ранних к поздним).
 * Используется для «псевдо-timelapse»: последовательный показ прогресса.
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @returns Массив фото проекта, отсортированный по takenAt (старые первыми).
 */
export function getChronologicalPhotos(
  photos: PhotoMetadata[],
  projectId: string,
): PhotoMetadata[] {
  return photos
    .filter((photo) => photo.projectId === projectId)
    .sort((a, b) => a.takenAt - b.takenAt);
}

/**
 * Возвращает НЕ скрытые фото проекта (без учёта порядка).
 * Скрытые фото не участвуют в обычном timeline и авто-выборе first/latest/reference.
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @returns Массив видимых фото проекта.
 */
export function getVisiblePhotos(
  photos: PhotoMetadata[],
  projectId: string,
): PhotoMetadata[] {
  return photos.filter((p) => p.projectId === projectId && !p.isHidden);
}

/**
 * Возвращает первое (самое раннее) НЕ скрытое фото проекта.
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @returns Самое раннее видимое фото или null, если видимых фото нет.
 */
export function getFirstVisiblePhoto(
  photos: PhotoMetadata[],
  projectId: string,
): PhotoMetadata | null {
  const visible = getVisiblePhotos(photos, projectId);
  if (visible.length === 0) {
    return null;
  }
  let first = visible[0];
  for (const photo of visible) {
    if (photo.takenAt < first.takenAt) {
      first = photo;
    }
  }
  return first;
}

/**
 * Возвращает последнее (самое свежее) НЕ скрытое фото проекта.
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @returns Самое свежее видимое фото или null, если видимых фото нет.
 */
export function getLatestVisiblePhoto(
  photos: PhotoMetadata[],
  projectId: string,
): PhotoMetadata | null {
  const visible = getVisiblePhotos(photos, projectId);
  if (visible.length === 0) {
    return null;
  }
  let latest = visible[0];
  for (const photo of visible) {
    if (photo.takenAt > latest.takenAt) {
      latest = photo;
    }
  }
  return latest;
}
