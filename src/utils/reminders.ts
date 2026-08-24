/**
 * Назначение: чистые функции для работы со временем напоминаний.
 *
 * Функции:
 * - parseReminderTime(): разбирает строку «HH:MM» в часы и минуты.
 *
 * Слой: util (/src/utils). Чистая функция без внешних зависимостей.
 */

/** Разобранное время напоминания (часы и минуты, 24-часовой формат). */
export interface ReminderTime {
  hour: number;
  minute: number;
}

/**
 * Разбирает строку времени «HH:MM» в часы и минуты.
 *
 * @param value — строка вида «20:00» (допускаются ведущие пробелы).
 * @returns объект с полями hour (0..23) и minute (0..59), либо null,
 *   если строка не является корректным временем.
 */
export function parseReminderTime(value: string): ReminderTime | null {
  const match = /^\s*(\d{1,2}):(\d{2})\s*$/.exec(value);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  // Валидация диапазонов: часы 0..23, минуты 0..59.
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }

  return { hour, minute };
}
