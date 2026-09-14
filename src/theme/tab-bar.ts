/**
 * Назначение: размеры плавающей панели нижних вкладок (Liquid Glass).
 *
 * Функции:
 * - общие константы, чтобы layout таббара и экраны считали отступ под
 *   плавающую капсулу одинаково (без «магических» чисел в разных файлах).
 *
 * Слой: theme (/src/theme). Чистые константы.
 */

/** Высота плавающей капсулы. */
export const FLOATING_TAB_BAR_HEIGHT = 60;
/** Отступ капсулы над нижней safe area. */
export const FLOATING_TAB_BAR_GAP = 8;
/** Суммарный вертикальный отступ, который плавающая капсула занимает над safe area. */
export const FLOATING_TAB_BAR_INSET = FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_GAP;
