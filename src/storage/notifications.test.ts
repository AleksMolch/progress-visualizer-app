// Тесты storage-обёртки над expo-notifications.
// Проверяем логику расписания, отмены и запроса разрешения без нативного модуля.

import * as Notifications from 'expo-notifications';

import {
  cancelDailyReminder,
  getNotificationPermission,
  REMINDER_NOTIFICATION_ID,
  requestNotificationPermission,
  scheduleDailyReminder,
} from './notifications';

// Мок expo-notifications с контролируемыми флагами разрешений.
const mockNotifications = jest.mocked(Notifications);

// Служебное поле мока (отсутствует в реальных типах) для управления флагами.
const mockInternals = Notifications as unknown as {
  __permissions: { granted: boolean; requested: boolean };
};

// Сброс состояния мока перед каждым тестом.
beforeEach(() => {
  mockInternals.__permissions.granted = false;
  mockInternals.__permissions.requested = true;
  jest.clearAllMocks();
});

describe('scheduleDailyReminder', () => {
  it('отменяет старое и ставит новое ежедневное напоминание', async () => {
    const ok = await scheduleDailyReminder(20, 30);

    expect(ok).toBe(true);
    // Сначала отмена с фиксированным id.
    expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      REMINDER_NOTIFICATION_ID,
    );

    // Затем планирование с тем же id, ежедневным триггером и нужным временем.
    const request = mockNotifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(request.identifier).toBe(REMINDER_NOTIFICATION_ID);
    expect(request.trigger).toEqual({
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 30,
    });
  });

  it('возвращает false, если планирование падает с ошибкой', async () => {
    mockNotifications.scheduleNotificationAsync.mockRejectedValueOnce(new Error('fail'));

    const ok = await scheduleDailyReminder(9, 0);

    expect(ok).toBe(false);
  });
});

describe('cancelDailyReminder', () => {
  it('отменяет напоминание по фиксированному id', async () => {
    await cancelDailyReminder();

    expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      REMINDER_NOTIFICATION_ID,
    );
  });
});

describe('permission', () => {
  it('getNotificationPermission возвращает текущий флаг granted', async () => {
    mockInternals.__permissions.granted = true;

    await expect(getNotificationPermission()).resolves.toBe(true);
  });

  it('requestNotificationPermission не запрашивает повторно, если уже выдано', async () => {
    mockInternals.__permissions.granted = true;

    const ok = await requestNotificationPermission();

    expect(ok).toBe(true);
    expect(mockNotifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requestNotificationPermission запрашивает разрешение, когда его нет', async () => {
    mockInternals.__permissions.granted = false;
    mockInternals.__permissions.requested = true;

    const ok = await requestNotificationPermission();

    expect(ok).toBe(true);
    expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
  });
});
