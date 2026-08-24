/**
 * Назначение: обёртка над expo-notifications (локальные уведомления).
 *
 * Функции:
 * - configureNotificationHandler(): задаёт поведение уведомления в foreground;
 * - requestNotificationPermission(): запрашивает разрешение на уведомления;
 * - getNotificationPermission(): проверяет текущее разрешение;
 * - scheduleDailyReminder(hour, minute): ставит ежедневное напоминание;
 * - cancelDailyReminder(): отменяет ежедневное напоминание.
 *
 * Слой: storage (/src/storage). Единственное место вызова expo-notifications.
 * UI не должен обращаться к модулю напрямую.
 *
 * Приватность: используются только ЛОКАЛЬНЫЕ уведомления — без push-сервера,
 * без сетевых запросов и без передачи данных наружу (CONSTITUTION.md).
 */

import * as Notifications from 'expo-notifications';

/** Фиксированный идентификатор ежедневного напоминания (для отмены/замены). */
export const REMINDER_NOTIFICATION_ID = 'progress-daily-reminder';

/**
 * Задаёт поведение уведомления, пришедшего когда приложение на переднем плане.
 * Без этого обработчика iOS не показывает уведомление поверх открытого приложения.
 */
export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Проверяет, разрешены ли уведомления в данный момент.
 * @returns true, если уведомления разрешены.
 */
export async function getNotificationPermission(): Promise<boolean> {
  const status = await Notifications.getPermissionsAsync();
  return status.granted;
}

/**
 * Запрашивает разрешение на показ уведомлений (если ещё не выдано).
 * @returns true, если разрешение в итоге выдано.
 *
 * Важно: на iOS повторный запрос после отказа системой невозможен —
 * пользователь должен включить уведомления в настройках устройства.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });
  return requested.granted;
}

/**
 * Ставит ежедневное напоминание на указанное время.
 * Предыдущее напоминание с фиксированным id сначала отменяется,
 * чтобы не накапливать дубли.
 *
 * @param hour — час (0..23).
 * @param minute — минута (0..59).
 * @returns true при успешном создании, false при ошибке.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  try {
    // Отменяем существующее напоминание, чтобы id оставался уникальным.
    await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID);

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_NOTIFICATION_ID,
      content: {
        title: 'Время для фото прогресса',
        body: 'Сделайте новое фото, чтобы зафиксировать прогресс.',
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
    return true;
  } catch (error) {
    console.error('Ошибка планирования напоминания:', error);
    return false;
  }
}

/**
 * Отменяет ежедневное напоминание.
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_NOTIFICATION_ID);
}
