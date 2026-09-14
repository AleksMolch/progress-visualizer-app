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
import { FLOATING_TAB_BAR_INSET } from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SettingsScreen() {
  const { colors, metrics } = useAppTheme();
  const requireBiometrics = useSettingsStore((s) => s.settings.requireBiometrics);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // Отступ под плавающую капсулу таббара (0 — стандартный таббар).
  const floatingInset = metrics.tabBarRadius > 0 ? FLOATING_TAB_BAR_INSET : 0;

  // null — ещё не определили доступность биометрии.
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    isBiometricsAvailable().then(setAvailable);
  }, []);

  return (
    <AppScreen scroll>
      <View style={[styles.container, { paddingBottom: floatingInset + spacing.lg }]}>
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

        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">Тактильный отклик</AppText>
              <AppText color="textSecondary" variant="caption">
                Лёгкая вибрация при съёмке и важных действиях
              </AppText>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </AppCard>

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
