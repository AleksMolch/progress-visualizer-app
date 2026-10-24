/**
 * Назначение: модель пользовательских настроек приложения.
 *
 * Функции:
 * - описывает настройки, которые сохраняются локально и персистятся между запусками.
 *
 * Слой: model (/src/models). Чистый тип без логики и зависимостей.
 */

/** Режим темы оформления. */
export type ThemeMode = 'system' | 'light' | 'dark';

/** Язык интерфейса приложения (id локали). */
export type AppLanguage = 'ru' | 'en' | 'zh-Hans' | 'kk' | 'es';

/**
 * Стабильные идентификаторы визуального оформления приложения.
 *
 * Только три пользовательских стиля:
 * - `modern` — платформенно-нативный (iOS Liquid Glass, Android Material 3);
 * - `simple` — минималистичный стабильный режим без тяжёлых эффектов;
 * - `neumorphism` — мягкий soft-UI.
 */
export type DesignThemeId = 'modern' | 'simple' | 'neumorphism';

/**
 * Стабильные идентификаторы цветовой схемы (акцентной палитры).
 *
 * Схемы ортогональны оформлению и светлой/тёмной теме:
 * - `graphite` — графит и тёплый золотой акцент (T-Bank/Yandex Go);
 * - `emerald` — глубокий зелёный и спокойные поверхности (Sber);
 * - `coral` — тёплый коралловый акцент (Alfa/Monzo).
 */
export type ColorPaletteId = 'graphite' | 'emerald' | 'coral';

export interface AppSettings {
  /** Визуальное оформление (тема дизайна). */
  designTheme: DesignThemeId;
  /** Цветовая схема (акцентная палитра). */
  colorScheme: ColorPaletteId;
  /** Режим темы: системная / светлая / тёмная. */
  themeMode: ThemeMode;
  /** Язык интерфейса. */
  language: AppLanguage;
  /** Включён ли тактильный отклик (haptics). */
  hapticsEnabled: boolean;
  /** Включён ли ghost overlay (показ последнего фото поверх камеры). */
  ghostEnabled: boolean;
  /** Прозрачность ghost overlay (0..1). */
  ghostOpacity: number;
  /** Включена ли сетка-направляющая поверх камеры. */
  gridEnabled: boolean;
  /** Требовать ли биометрическую аутентификацию при входе. */
  requireBiometrics: boolean;
  /** Включены ли локальные напоминания. */
  remindersEnabled: boolean;
  /** Время ежедневного напоминания в формате «HH:MM» (24 часа). */
  reminderTime: string;
  /** Пройден ли стартовый онбординг (показывается один раз). */
  hasCompletedOnboarding: boolean;
}
