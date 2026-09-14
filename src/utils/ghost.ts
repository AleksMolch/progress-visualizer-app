/**
 * Назначение: чистые функции видимости ghost overlay (быстрый показ призрака).
 *
 * Функции:
 * - resolveGhostVisibility(): вычисляет видимость и эффективную непрозрачность
 *   призрака из постоянных настроек и временного режима «быстрого показа».
 *
 * Слой: util (/src/utils). Чистая функция без React и внешних зависимостей.
 */

/** Входные данные для расчёта видимости призрака. */
export interface GhostVisibilityInput {
  /** Включён ли обычный призрак в настройках. */
  ghostEnabled: boolean;
  /** Успешно ли загружено эталонное изображение. */
  referenceReady: boolean;
  /** Активен ли временный режим быстрого показа (hold-to-peek / кнопка). */
  isPeekActive: boolean;
  /** Обычная непрозрачность призрака из настроек (0..1). */
  ghostOpacity: number;
}

/** Результат расчёта видимости призрака. */
export interface GhostVisibilityResult {
  /** Показывать ли призрак. */
  visible: boolean;
  /** Итоговая непрозрачность (в быстром режиме — фиксированные 0.9). */
  effectiveOpacity: number;
}

/** Непрозрачность в режиме быстрого показа (видимость старого снимка 90%). */
export const PEEK_OPACITY = 0.9;

/**
 * Вычисляет видимость и непрозрачность призрака.
 *
 * Семантика:
 * - призрак виден, только если эталон загружен И (обычный призрак включён ИЛИ
 *   активен быстрый показ);
 * - в быстром режиме непрозрачность всегда ровно 0.9 (даже если обычная равна 1);
 * - иначе используется обычная настройка ghostOpacity.
 */
export function resolveGhostVisibility(input: GhostVisibilityInput): GhostVisibilityResult {
  const visible = input.referenceReady && (input.ghostEnabled || input.isPeekActive);
  const effectiveOpacity = input.isPeekActive ? PEEK_OPACITY : input.ghostOpacity;
  return { visible, effectiveOpacity };
}
