/**
 * Ручной мок expo-notifications для Jest.
 * Заменяет нативный модуль уведомлений заглушками, чтобы тесты storage-слоя
 * не зависели от нативных вызовов. Используется в тестах notifications.ts.
 *
 * Поддерживается набор API, который использует storage/notifications.ts:
 * getPermissionsAsync, requestPermissionsAsync, scheduleNotificationAsync,
 * cancelScheduledNotificationAsync, setNotificationHandler и
 * SchedulableTriggerInputTypes.
 */

/** Флаги разрешений, которые можно менять в тестах. */
export const __permissions = {
  granted: false,
  requested: true,
};

export const getPermissionsAsync = jest.fn(async () => ({
  granted: __permissions.granted,
  status: 'granted',
  canAskAgain: true,
}));

export const requestPermissionsAsync = jest.fn(async () => ({
  granted: __permissions.requested,
  status: 'granted',
  canAskAgain: true,
}));

export const scheduleNotificationAsync = jest.fn(async (_request: unknown) => 'notification-id');

export const cancelScheduledNotificationAsync = jest.fn(async (_identifier: string) => undefined);

export const setNotificationHandler = jest.fn();

/** Перечисление типов триггеров (подмножество реального API). */
export const SchedulableTriggerInputTypes = {
  TIME_INTERVAL: 'timeInterval',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  CALENDAR: 'calendar',
  DATE: 'date',
} as const;
