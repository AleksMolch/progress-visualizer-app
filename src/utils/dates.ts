/**
 * Назначение: чистые функции форматирования дат и времени.
 *
 * Функции:
 * - formatDate(): форматирует метку времени (epoch ms) в локализованную дату.
 *
 * Слой: util (/src/utils). Чистая функция без внешних зависимостей.
 */

/**
 * Форматирует метку времени в короткую локализованную дату.
 * @param timestamp — метка времени в миллисекундах (epoch ms).
 * @returns Строку вида «22 авг. 2026 г.» (в локали устройства).
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
