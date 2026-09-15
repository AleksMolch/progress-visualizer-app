/**
 * Назначение: чистые функции выбора эталонного фото для ghost overlay.
 *
 * Функции:
 * - resolveReferencePhoto(project, photos): возвращает эталонное фото по режиму
 *   проекта (latest / first / manual) с fallback на latest при пропавшем manual;
 * - getReferenceMode(project): резолвит referenceMode со значением по умолчанию.
 *
 * Слой: util (/src/utils). Чистая функция без React и внешних зависимостей.
 */

import { type Project, type ProjectReferenceMode } from '@/models/project';
import { type PhotoMetadata } from '@/models/photo';

import { getFirstVisiblePhoto, getLatestVisiblePhoto } from './photos';

/**
 * Возвращает фактический режим эталонного фото проекта.
 * Отсутствующий referenceMode (старые проекты) трактуется как 'latest'.
 * @param project — проект.
 * @returns Режим эталонного фото.
 */
export function getReferenceMode(project: Project): ProjectReferenceMode {
  return project.referenceMode ?? 'latest';
}

/**
 * Резолвит эталонное фото проекта для ghost overlay.
 *
 * Логика:
 * - `first` → самое раннее НЕ скрытое фото по takenAt;
 * - `latest` → самое свежее НЕ скрытое фото по takenAt;
 * - `manual` → фото с referencePhotoId, если оно существует, принадлежит проекту
 *   и не скрыто; иначе fallback на latest (пропавший/удалённый/скрытый manual);
 * - если видимых фото нет → null.
 *
 * @param project — проект (с referenceMode/referencePhotoId).
 * @param photos — полный список метаданных фото.
 * @returns Эталонное фото или null.
 */
export function resolveReferencePhoto(
  project: Project,
  photos: PhotoMetadata[],
): PhotoMetadata | null {
  const mode = getReferenceMode(project);

  if (mode === 'first') {
    return getFirstVisiblePhoto(photos, project.id);
  }

  if (mode === 'manual') {
    const manual = project.referencePhotoId
      ? photos.find(
          (p) => p.id === project.referencePhotoId && p.projectId === project.id && !p.isHidden,
        ) ?? null
      : null;
    if (manual) {
      return manual;
    }
    // Manual-эталон пропал (удалён/скрыт) — откатываемся к latest.
    return getLatestVisiblePhoto(photos, project.id);
  }

  return getLatestVisiblePhoto(photos, project.id);
}

/**
 * Возвращает true, если проект использует manual-режим, но его manual-эталон
 * недоступен (удалён или скрыт). Используется UI для показа предупреждения.
 * @param project — проект.
 * @param photos — полный список метаданных фото.
 * @returns true, если manual-эталон нужно перевыбрать.
 */
export function isManualReferenceMissing(
  project: Project,
  photos: PhotoMetadata[],
): boolean {
  if (getReferenceMode(project) !== 'manual') {
    return false;
  }
  if (!project.referencePhotoId) {
    return true;
  }
  return !photos.some(
    (p) => p.id === project.referencePhotoId && p.projectId === project.id && !p.isHidden,
  );
}
