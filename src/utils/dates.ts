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

// Названия месяцев по-русски (для детерминированного заголовка месяца).
const MONTHS_RU = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь',
] as const;

/**
 * Форматирует метку времени в заголовок месяца, например «Сентябрь 2026».
 * Использует ручной список месяцев (детерминированно, без локали и «г.»).
 * @param timestamp — метка времени в миллисекундах (epoch ms).
 * @returns Строку вида «Сентябрь 2026».
 */
export function formatMonthLabel(timestamp: number): string {
  const date = new Date(timestamp);
  const month = MONTHS_RU[date.getMonth()];
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalized} ${date.getFullYear()}`;
}

/**
 * Форматирует количество дней с корректной русской плюрализацией.
 * @param days — количество дней (неотрицательное целое).
 * @returns Строку вида «1 день», «2 дня», «5 дней», «42 дня».
 */
export function formatDays(days: number): string {
  const n = Math.abs(days);
  const mod10 = n % 10;
  const mod100 = n % 100;

  let word: string;
  if (mod10 === 1 && mod100 !== 11) {
    word = 'день';
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    word = 'дня';
  } else {
    word = 'дней';
  }

  return `${n} ${word}`;
}
