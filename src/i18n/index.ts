/**
 * Назначение: движок интернационализации (i18n).
 *
 * Функции:
 * - translate(locale, key, params): перевод с интерполяцией и плюрализацией;
 * - useI18n(): реактивный хук, перерисовывает UI при смене языка.
 *
 * Слой: i18n (/src/i18n). Читает выбор языка из settingsStore.
 * Fallback: отсутствующий ключ → английский словарь; отсутствующий перевод → ключ.
 */

import { type AppLanguage } from '@/models/settings';
import { useSettingsStore } from '@/store/settingsStore';

import { en, type MessageKey } from './locales/en';
import { es } from './locales/es';
import { kk } from './locales/kk';
import { ru } from './locales/ru';
import { zhHans } from './locales/zh-Hans';
import type { Message, Plural, TranslationParams } from './types';

export type { MessageKey, TranslationParams };
export type Locale = AppLanguage;
export { LANGUAGE_NAMES, LANGUAGE_SHORT, LOCALES, isAppLanguage } from './locale';

/** Словари по локалям (en — канонический источник ключей). */
type Dict = Readonly<Record<MessageKey, Message>>;
const DICTS: Record<Locale, Dict> = { en, ru, 'zh-Hans': zhHans, kk, es };

/**
 * Выбирает форму множественного числа для локали.
 * ru — one/few/many; zh-Hans — other; en/kk/es — one/other.
 */
function pluralForm(locale: Locale, n: number): keyof Plural {
  if (locale === 'ru') {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) {
      return 'one';
    }
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      return 'few';
    }
    return 'many';
  }
  if (locale === 'zh-Hans') {
    return 'other';
  }
  return n === 1 ? 'one' : 'other';
}

/** Подставляет параметры вида {name} в шаблон. */
function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

/** Приводит значение count к числу (для плюрализации). */
function toCount(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Возвращает переведённую строку для локали.
 *
 * @param locale — целевая локаль.
 * @param key — ключ словаря.
 * @param params — параметры интерполяции (и count для плюрализации).
 * @returns Переведённая строка (fallback: en → сам ключ).
 */
export function translate(
  locale: Locale,
  key: MessageKey,
  params?: TranslationParams,
): string {
  const dict = DICTS[locale] ?? en;
  const message = dict[key] ?? en[key];

  if (message === undefined) {
    return key;
  }

  if (typeof message === 'string') {
    return interpolate(message, params);
  }

  const count = toCount(params?.count);
  const form = pluralForm(locale, count);
  const template = message[form] ?? message.other ?? message.one ?? message.few ?? message.many ?? '';
  return interpolate(template, params ? { ...params, count } : { count });
}

/**
 * Хук доступа к переводам. Подписан на settings.language — UI обновляется
 * реактивно при смене языка без перезапуска.
 */
export function useI18n(): { t: (key: MessageKey, params?: TranslationParams) => string; locale: Locale } {
  const locale = useSettingsStore((s) => s.settings.language);
  return {
    locale,
    t: (key: MessageKey, params?: TranslationParams) => translate(locale, key, params),
  };
}
