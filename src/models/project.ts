/**
 * Назначение: модель проекта прогресс-фото.
 *
 * Функции:
 * - описывает структуру проекта, к которому привязываются фотографии.
 *
 * Слой: model (/src/models). Чистый тип без логики и зависимостей.
 */

/** Источник эталонного фото для ghost overlay (выбор на уровне проекта). */
export type ProjectReferenceMode = 'latest' | 'first' | 'manual';

export interface Project {
  /** Уникальный идентификатор проекта. */
  id: string;
  /** Название проекта, задаётся пользователем. */
  name: string;
  /** Метка времени создания (epoch ms). */
  createdAt: number;
  /** Метка времени последнего изменения (epoch ms). */
  updatedAt: number;
  /**
   * Источник эталонного фото для ghost overlay. Отсутствует у старых проектов —
   * трактуется как `latest` (см. resolveReferencePhoto).
   */
  referenceMode?: ProjectReferenceMode;
  /**
   * Идентификатор вручную выбранного эталонного фото (при referenceMode === 'manual').
   * null — эталон не выбран или сброшен.
   */
  referencePhotoId?: string | null;
}
