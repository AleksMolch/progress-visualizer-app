/**
 * Назначение: базовые типы i18n-словарей.
 *
 * Функции:
 * - Message: строка или plural-объект (формы one/few/many/other);
 * - Locale: поддерживаемые языки.
 *
 * Слой: i18n (/src/i18n). Чистые типы без логики.
 */

/** Формы множественного числа. */
export interface Plural {
  one?: string;
  few?: string;
  many?: string;
  other?: string;
}

/** Сообщение словаря: строка или plural-объект. */
export type Message = string | Plural;

/** Параметры интерполяции. */
export type TranslationParams = Record<string, string | number>;
