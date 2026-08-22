/**
 * Назначение: чистые функции политики безопасности приложения.
 *
 * Функции:
 * - shouldLock(): решает, нужно ли блокировать приложение биометрией.
 *
 * Слой: util (/src/utils). Чистая функция без внешних зависимостей.
 */

/**
 * Решает, требуется ли блокировка приложения.
 *
 * @param requireBiometrics — включена ли защита в настройках.
 * @param biometricsAvailable — доступна ли биометрия на устройстве
 *   (есть железо и зарегистрированная биометрия).
 * @returns true, если нужно показать lock screen.
 *
 * Важно (fallback): если биометрия недоступна, приложение НЕ блокируется —
 * иначе пользователь не сможет войти. Это правило 10.5 из TODO.md.
 */
export function shouldLock(
  requireBiometrics: boolean,
  biometricsAvailable: boolean,
): boolean {
  return requireBiometrics && biometricsAvailable;
}
