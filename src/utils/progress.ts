/**
 * Назначение: чистые функции прогресса проекта (дни между снимками, группировка,
 * валидация пары для сравнения).
 *
 * Функции:
 * - getDaysBetweenPhotos(a, b): количество дней между двумя фото;
 * - groupPhotosByMonth(photos): группировка фото по месяцам;
 * - validateComparePair(project, photos, beforeId, afterId): валидация и
 *   упорядочивание пары «до/после» по дате.
 *
 * Слой: util (/src/utils). Чистые функции без React и внешних зависимостей.
 */

import { type Project } from '@/models/project';
import { type PhotoMetadata } from '@/models/photo';

import { formatMonthLabel } from './dates';

// Количество миллисекунд в одном дне.
const DAY_MS = 86_400_000;

/**
 * Возвращает количество целых дней между двумя снимками.
 * @param a — первый снимок.
 * @param b — второй снимок.
 * @returns Число полных дней между takenAt (неотрицательное).
 */
export function getDaysBetweenPhotos(
  a: { takenAt: number },
  b: { takenAt: number },
): number {
  return Math.floor(Math.abs(b.takenAt - a.takenAt) / DAY_MS);
}

/** Группа фото за один календарный месяц. */
export interface MonthGroup {
  /** Ключ месяца (год-месяц), используется как React key. */
  key: string;
  /** Человекочитаемый заголовок месяца, например «Сентябрь 2026». */
  label: string;
  /** Фото месяца (в том же порядке, в каком пришли). */
  photos: PhotoMetadata[];
}

/**
 * Группирует фото по календарным месяцам, сохраняя исходный порядок.
 * Ожидается, что вход уже отсортирован (новые сверху).
 * @param photos — отсортированный список фото.
 * @param locale — локаль для заголовка месяца.
 * @returns Массив групп по месяцам в порядке появления.
 */
export function groupPhotosByMonth(photos: PhotoMetadata[], locale = 'en'): MonthGroup[] {
  const groups: MonthGroup[] = [];
  for (const photo of photos) {
    const date = new Date(photo.takenAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.photos.push(photo);
    } else {
      groups.push({ key, label: formatMonthLabel(photo.takenAt, locale), photos: [photo] });
    }
  }
  return groups;
}

/** Ошибка валидации пары для сравнения. */
export type ComparePairError =
  | 'no-project'
  | 'same-photo'
  | 'missing-photo'
  | null;

/** Результат валидации и упорядочивания пары для сравнения. */
export interface ComparePairResult {
  /** Фото «До» (более раннее) или null при ошибке. */
  before: PhotoMetadata | null;
  /** Фото «После» (более позднее) или null при ошибке. */
  after: PhotoMetadata | null;
  /** Код ошибки или null, если пара корректна. */
  error: ComparePairError;
}

/**
 * Валидирует пару фото для сравнения и упорядочивает её по дате съёмки.
 *
 * Правила:
 * - проект отсутствует → error 'no-project';
 * - beforeId === afterId → error 'same-photo';
 * - одно из фото не найдено или принадлежит другому проекту → error 'missing-photo';
 * - иначе пара упорядочивается так, что более раннее = «До», более позднее = «После».
 *
 * @param project — проект (или null/undefined).
 * @param photos — полный список метаданных фото.
 * @param beforeId — запрошенное фото «До».
 * @param afterId — запрошенное фото «После».
 * @returns Результат с упорядоченной парой и кодом ошибки.
 */
export function validateComparePair(
  project: Project | null | undefined,
  photos: PhotoMetadata[],
  beforeId: string,
  afterId: string,
): ComparePairResult {
  if (!project) {
    return { before: null, after: null, error: 'no-project' };
  }
  if (beforeId === afterId) {
    return { before: null, after: null, error: 'same-photo' };
  }

  const before = photos.find((p) => p.id === beforeId && p.projectId === project.id) ?? null;
  const after = photos.find((p) => p.id === afterId && p.projectId === project.id) ?? null;

  if (!before || !after) {
    return { before, after, error: 'missing-photo' };
  }

  // Упорядочиваем по дате: более раннее — «До».
  if (before.takenAt > after.takenAt) {
    return { before: after, after: before, error: null };
  }
  return { before, after, error: null };
}

/**
 * Продвигает состояние быстрого выбора пары (Flow A) на один тап.
 *
 * Логика:
 * - тап по уже выбранному фото снимает выбор;
 * - иначе фото добавляется в конец (порядок выбора: 1 = «До», 2 = «После»).
 *
 * @param selection — текущий список выбранных id (0..2 элемента).
 * @param photoId — id фото, по которому тапнули.
 * @returns Новый список выбранных id.
 */
export function advanceQuickCompare(selection: string[], photoId: string): string[] {
  if (selection.includes(photoId)) {
    return selection.filter((x) => x !== photoId);
  }
  return [...selection, photoId];
}
