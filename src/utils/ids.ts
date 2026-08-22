/**
 * Назначение: генерация уникальных идентификаторов для локальных сущностей.
 *
 * Функции:
 * - generateId(): возвращает уникальную строку-идентификатор.
 *
 * Слой: util (/src/utils). Чистая функция без внешних зависимостей.
 * Примечание: идентификаторы не являются секретами, поэтому используется
 * timestamp + случайная составляющая (не криптографический генератор).
 */

let counter = 0;

export function generateId(): string {
  counter += 1;
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const sequence = counter.toString(36);
  return `${time}-${sequence}-${random}`;
}
