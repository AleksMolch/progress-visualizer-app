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
 * Возвращает предыдущее (более раннее) фото проекта относительно заданного.
 * Используется для сравнения «до/после»: текущее фото против предыдущего.
 * @param photos — полный список метаданных фото.
 * @param projectId — идентификатор проекта.
 * @param photoId — идентификатор текущего фото.
 * @returns Предыдущее фото (с меньшим takenAt) или null, если его нет.
 */
export function getPreviousPhoto(
  photos: PhotoMetadata[],
  projectId: string,
  photoId: string,
): PhotoMetadata | null {
  const current = photos.find((p) => p.id === photoId && p.projectId === projectId);
  if (!current) {
    return null;
  }

  let previous: PhotoMetadata | null = null;
  for (const photo of photos) {
    if (photo.projectId !== projectId || photo.id === photoId) {
      continue;
    }
    if (photo.takenAt < current.takenAt) {
      if (previous === null || photo.takenAt > previous.takenAt) {
        previous = photo;
      }
    }
  }
  return previous;
}
