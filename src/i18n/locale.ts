/**
 * Назначение: чистая часть i18n — список языков и их метаданные.
 *
 * Функции:
 * - LOCALES / LANGUAGE_NAMES / LANGUAGE_SHORT: список языков, самоназвания и короткие коды;
 * - isAppLanguage(value): валидация локали.
 *
 * Слой: i18n (/src/i18n). Без зависимостей от store — чтобы settingsStore
 * мог импортировать это без циклической зависимости.
 */

import type { AppLanguage } from '@/models/settings';

/** Поддерживаемые языки (порядок — для селектора). */
export const LOCALES: AppLanguage[] = ['ru', 'en', 'zh-Hans', 'kk', 'es'];

/** Самоназвания языков (каждый на своём языке). */
export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  ru: 'Русский',
  en: 'English',
  'zh-Hans': '简体中文',
  kk: 'Қазақша',
  es: 'Español',
};

/** Короткие коды языков для компактного отображения (язык, НЕ флаг/страна). */
export const LANGUAGE_SHORT: Record<AppLanguage, string> = {
  ru: 'RU',
  en: 'EN',
  'zh-Hans': 'ZH',
  kk: 'KZ',
  es: 'ES',
};

/** Проверяет, является ли значение корректным языком. */
export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'ru' || value === 'en' || value === 'zh-Hans' || value === 'kk' || value === 'es';
}
