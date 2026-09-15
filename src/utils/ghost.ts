/**
 * Назначение: чистые функции видимости ghost overlay (временное усиление).
 *
 * Функции:
 * - resolveGhostVisibility(): вычисляет видимость и эффективную непрозрачность
 *   призрака из постоянных настроек и временного усиления (tap по превью).
 *
 * Слой: util (/src/utils). Чистая функция без React и внешних зависимостей.
 */

/** Входные данные для расчёта видимости призрака. */
export interface GhostVisibilityInput {
  /** Включён ли обычный призрак в настройках. */
  ghostEnabled: boolean;
  /** Успешно ли загружено эталонное изображение. */
  referenceReady: boolean;
  /** Активно ли временное усиление видимости (tap по превью). */
  isBoosted: boolean;
  /** Обычная непрозрачность призрака из настроек (0..1). */
  ghostOpacity: number;
}

/** Результат расчёта видимости призрака. */
export interface GhostVisibilityResult {
  /** Показывать ли призрак. */
  visible: boolean;
  /** Итоговая непрозрачность (в усиленном режиме — фиксированные 0.85). */
  effectiveOpacity: number;
}

/** Непрозрачность при временном усилении (комфортный уровень выравнивания). */
export const BOOSTED_OPACITY = 0.85;

/**
 * Вычисляет видимость и непрозрачность призрака.
 *
 * Семантика:
 * - призрак виден, только если эталон загружен И (обычный призрак включён ИЛИ
 *   активно временное усиление);
 * - при временном усилении непрозрачность всегда ровно 0.85 (даже если обычная
 *   отличается) — это временное состояние, оно НЕ сохраняется в настройки;
 * - иначе используется обычная настройка ghostOpacity.
 */
export function resolveGhostVisibility(input: GhostVisibilityInput): GhostVisibilityResult {
  const visible = input.referenceReady && (input.ghostEnabled || input.isBoosted);
  const effectiveOpacity = input.isBoosted ? BOOSTED_OPACITY : input.ghostOpacity;
  return { visible, effectiveOpacity };
}
