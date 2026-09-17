/**
 * Назначение: чистые функции форматирования дат и времени (locale-aware).
 *
 * Функции:
 * - formatDate(timestamp, locale): короткая дата в заданной локали;
 * - formatMonthLabel(timestamp, locale): заголовок месяца, например «Сентябрь 2026».
 *
 * Слой: util (/src/utils). Чистые функции без внешних зависимостей.
 */

// Названия месяцев по локалям (для детерминированного заголовка месяца).
const MONTHS: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
  kk: ['қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'],
  es: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
};

/** Возвращает первое слово с заглавной буквы. */
function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Форматирует метку времени в короткую дату в заданной локали.
 * @param timestamp — метка времени в миллисекундах (epoch ms).
 * @param locale — локаль (например 'ru', 'en', 'zh-Hans'); undefined — локаль устройства.
 * @returns Строку вида «22 авг. 2026 г.».
 */
export function formatDate(timestamp: number, locale?: string): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Форматирует метку времени в заголовок месяца, например «Сентябрь 2026».
 * @param timestamp — метка времени в миллисекундах (epoch ms).
 * @param locale — локаль ('ru' | 'en' | 'kk' | 'es' | 'zh-Hans'); по умолчанию 'en'.
 * @returns Строку вида «Сентябрь 2026» (для zh: «2026年9月»).
 */
export function formatMonthLabel(timestamp: number, locale = 'en'): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();

  if (locale === 'zh-Hans') {
    return `${year}年${date.getMonth() + 1}月`;
  }

  const months = MONTHS[locale] ?? MONTHS.en;
  const month = months[date.getMonth()];
  return `${capitalize(month)} ${year}`;
}
