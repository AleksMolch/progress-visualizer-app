/**
 * Назначение: экран «Настройки».
 *
 * Функции:
 * - переключатель биометрической защиты (requireBiometrics);
 * - при недоступной биометрии — показывает подсказку и отключает переключатель;
 * - карточка локальных напоминаний (ReminderSettingsCard).
 *
 * Слой: UI (/src/app). Данные — useSettingsStore, доступность биометрии —
 * через storage-слой (isBiometricsAvailable).
 */

import { useEffect, useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppearanceSettingsCard } from '@/features/settings/components/appearance-settings-card';
import { ReminderSettingsCard } from '@/features/settings/components/reminder-settings-card';
import { isBiometricsAvailable } from '@/storage/biometrics';
import { useSettingsStore } from '@/store/settingsStore';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const requireBiometrics = useSettingsStore((s) => s.settings.requireBiometrics);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // null — ещё не определили доступность биометрии.
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    isBiometricsAvailable().then(setAvailable);
  }, []);

  return (
    <AppScreen scroll>
      <View style={styles.container}>
        <AppText variant="title">Настройки</AppText>

        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">Защита биометрией</AppText>
              <AppText color="textSecondary" variant="caption">
                Требовать Face ID / Touch ID при входе
              </AppText>
            </View>
            <Switch
              value={requireBiometrics}
              disabled={available === null || available === false}
              onValueChange={(value) => updateSettings({ requireBiometrics: value })}
              trackColor={{ true: colors.primary }}
            />
          </View>

          {available === false ? (
            <AppText color="textSecondary" variant="caption">
              Биометрия недоступна на этом устройстве.
            </AppText>
          ) : null}
        </AppCard>

        <ReminderSettingsCard />

        <AppearanceSettingsCard />

        <AppButton
          label="Поддержать разработчика"
          variant="secondary"
          onPress={() => router.push('/support')}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
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
});
