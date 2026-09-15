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

/**
 * Стабильные идентификаторы визуального оформления приложения.
 *
 * Только три пользовательских стиля:
 * - `modern` — платформенно-нативный (iOS Liquid Glass, Android Material 3);
 * - `simple` — минималистичный стабильный режим без тяжёлых эффектов;
 * - `neumorphism` — мягкий soft-UI.
 */
export type DesignThemeId = 'modern' | 'simple' | 'neumorphism';

export interface AppSettings {
  /** Визуальное оформление (тема дизайна). */
  designTheme: DesignThemeId;
  /** Режим темы: системная / светлая / тёмная. */
  themeMode: ThemeMode;
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
}
