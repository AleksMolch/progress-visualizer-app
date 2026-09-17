/**
 * Назначение: карточка настроек локальных напоминаний.
 *
 * Функции:
 * - переключает ежедневное напоминание (включить/выключить);
 * - при включении запрашивает разрешение на уведомления и ставит расписание;
 * - позволяет выбрать время напоминания из предустановленных вариантов;
 * - показывает подсказку, если разрешение не выдано.
 *
 * Слой: UI (/src/features/settings/components). Данные — useSettingsStore,
 * операции с уведомлениями — через storage-слой (notifications.ts).
 */

import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import {
  cancelDailyReminder,
  getNotificationPermission,
  requestNotificationPermission,
  scheduleDailyReminder,
} from '@/storage/notifications';
import { useSettingsStore } from '@/store/settingsStore';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { parseReminderTime } from '@/utils/reminders';

/** Предустановленные варианты времени ежедневного напоминания. */
const REMINDER_TIME_PRESETS = ['09:00', '13:00', '18:00', '20:00'] as const;

export function ReminderSettingsCard() {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const remindersEnabled = useSettingsStore((s) => s.settings.remindersEnabled);
  const reminderTime = useSettingsStore((s) => s.settings.reminderTime);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // null — ещё не определили текущее разрешение на уведомления.
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // При монтировании узнаём текущее разрешение, чтобы честно отразить состояние.
  useEffect(() => {
    getNotificationPermission().then(setPermissionGranted);
  }, []);

  // Ставит ежедневное напоминание на указанное время (если время корректно).
  async function applySchedule(time: string): Promise<void> {
    const parsed = parseReminderTime(time);
    if (!parsed) {
      return;
    }
    await scheduleDailyReminder(parsed.hour, parsed.minute);
  }

  // Обработчик переключения напоминаний.
  async function handleToggle(value: boolean): Promise<void> {
    // Выключение: просто отменяем расписание и снимаем флаг.
    if (!value) {
      await cancelDailyReminder();
      updateSettings({ remindersEnabled: false });
      return;
    }

    // Включение: сначала разрешение, затем расписание.
    const granted = await requestNotificationPermission();
    if (!granted) {
      setPermissionGranted(false);
      return;
    }

    setPermissionGranted(true);
    await applySchedule(reminderTime);
    updateSettings({ remindersEnabled: true });
  }

  // Обработчик выбора времени: обновляем настройку и пере-ставим расписание.
  async function handleTimeSelect(time: string): Promise<void> {
    updateSettings({ reminderTime: time });
    if (remindersEnabled) {
      await applySchedule(time);
    }
  }

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.rowText}>
          <AppText variant="subtitle">{t('settings.reminders')}</AppText>
          <AppText color="textSecondary" variant="caption">
            {t('settings.remindersHint')}
          </AppText>
        </View>
        <Switch
          value={remindersEnabled}
          onValueChange={(value) => void handleToggle(value)}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {/* Выбор времени виден всегда, но активен только при включённых напоминаниях. */}
      <View style={styles.timeRow}>
        {REMINDER_TIME_PRESETS.map((time) => {
          const selected = time === reminderTime;
          return (
            <Pressable
              key={time}
              onPress={() => void handleTimeSelect(time)}
              accessibilityRole="button"
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.background,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <AppText
                color={selected ? 'primaryText' : 'text'}
                variant="caption">
                {time}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Подсказка, когда разрешение не выдано, но напоминания включены/включаются. */}
      {permissionGranted === false ? (
        <AppText color="textSecondary" variant="caption">
          {t('settings.remindersDenied')}
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
});
