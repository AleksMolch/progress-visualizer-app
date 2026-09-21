/**
 * Назначение: размеры единой панели нижних вкладок (все оформления).
 *
 * Функции:
 * - общие константы, чтобы layout таббара и экраны считали отступ под
 *   панель одинаково (без «магических» чисел в разных файлах);
 * - getBottomInset(): единый расчёт нижнего отступа контента (safe area +
 *   высота меню + выступ центральной кнопки + буфер + при необходимости ad-слот).
 *
 * Слой: theme (/src/theme). Чистые константы и функция.
 */

/** Высота панели вкладок. */
export const MAIN_TAB_BAR_HEIGHT = 64;
/** Отступ панели над нижней safe area (для плавающих капсул). */
export const MAIN_TAB_BAR_GAP = 12;
/** Суммарный вертикальный отступ, который панель занимает над safe area. */
export const MAIN_TAB_BAR_INSET = MAIN_TAB_BAR_HEIGHT + MAIN_TAB_BAR_GAP;
/** Диаметр центральной круглой кнопки камеры/затвора. */
export const CENTER_BUTTON_SIZE = 56;
/** Насколько центральная кнопка выступает над верхней линией панели. */
export const CENTER_BUTTON_RAISED = 12;

// Единые компоненты нижнего отступа (для всех scroll-экранов).
/** Высота нижнего меню (псевдоним MAIN_TAB_BAR_HEIGHT). */
export const BOTTOM_NAV_HEIGHT = MAIN_TAB_BAR_HEIGHT;
/** Перекрытие меню поверх контента: зазор + выступ центральной кнопки. */
export const BOTTOM_NAV_OVERLAP = MAIN_TAB_BAR_GAP + CENTER_BUTTON_RAISED;
/** Дополнительный буфер под последний элемент контента. */
export const BOTTOM_BUFFER = 16;
/** Высота inline ad-слота (placeholder), если он включён. */
export const AD_SLOT_HEIGHT = 64;

/**
 * Единый расчёт нижнего отступа контента, чтобы нижнее меню (и при необходимости
 * ad-слот) не перекрывали последние элементы.
 *
 * @param safeAreaBottom — нижний safe-area inset.
 * @param adSlot — резервировать ли место под inline ad-слот.
 * @returns Суммарный нижний отступ контента.
 */
export function getBottomInset(safeAreaBottom: number, adSlot = false): number {
  const base = safeAreaBottom + BOTTOM_NAV_HEIGHT + BOTTOM_NAV_OVERLAP + BOTTOM_BUFFER;
  return adSlot ? base + AD_SLOT_HEIGHT : base;
}

