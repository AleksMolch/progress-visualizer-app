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

export interface AppSettings {
  /** Режим темы: системная / светлая / тёмная. */
  themeMode: ThemeMode;
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
}
