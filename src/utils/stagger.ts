/**
 * Назначение: каскадная задержка появления карточек списка (stagger).
 *
 * Функции:
 * - getStaggerDelay(index): задержка старта анимации для позиции в списке;
 *   возвращает null, если элемент анимировать не нужно (появляется мгновенно).
 *
 * Слой: util (/src/utils). Чистая функция без React и внешних зависимостей.
 */

/** Шаг задержки между соседними карточками (мс). */
export const STAGGER_DELAY_MS = 60;

/** Ограничение задержки сверху, чтобы список не «догонял» долго (мс). */
export const STAGGER_MAX_DELAY_MS = 600;

/**
 * Сколько первых элементов участвует в каскаде. Элементы дальше появляются
 * мгновенно — при скролле длинного списка анимация не нужна и экономит кадры.
 */
export const MAX_STAGGERED_ITEMS = 10;

/**
 * Вычисляет задержку старта анимации для карточки по её позиции.
 *
 * @param index — позиция элемента в списке (0 — первый).
 * @returns Задержка в мс или null, если элемент не должен анимироваться.
 */
export function getStaggerDelay(index: number): number | null {
  if (index < 0 || index >= MAX_STAGGERED_ITEMS) {
    return null;
  }
  return Math.min(index * STAGGER_DELAY_MS, STAGGER_MAX_DELAY_MS);
}
