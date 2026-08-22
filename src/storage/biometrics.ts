/**
 * Назначение: обёртка над expo-local-authentication (биометрия).
 *
 * Функции:
 * - isBiometricsAvailable(): проверяет наличие железа и зарегистрированной
 *   биометрии на устройстве;
 * - authenticateWithBiometrics(): запускает системный диалог биометрии.
 *
 * Слой: storage (/src/storage). Единственное место вызова expo-local-authentication.
 * UI не должен обращаться к модулю напрямую.
 */

import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Проверяет, доступна ли биометрия на устройстве.
 * Возвращает true только если есть и железо, и зарегистрированная биометрия.
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);
  return hasHardware && isEnrolled;
}

/**
 * Запускает системный диалог биометрической аутентификации.
 * @returns true, если пользователь успешно прошёл проверку.
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Разблокируйте приложение',
    cancelLabel: 'Отмена',
  });
  return result.success;
}
