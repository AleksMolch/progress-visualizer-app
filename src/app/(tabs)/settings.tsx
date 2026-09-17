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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AppearanceSettingsCard } from '@/features/settings/components/appearance-settings-card';
import { LanguageSwitcher } from '@/features/settings/components/language-switcher';
import { ReminderSettingsCard } from '@/features/settings/components/reminder-settings-card';
import { MainTabSwipeGesture } from '@/features/navigation/components/main-tab-swipe-gesture';
import { useI18n } from '@/i18n';
import { LANGUAGE_NAMES } from '@/i18n/locale';
import { isBiometricsAvailable } from '@/storage/biometrics';
import { useSettingsStore } from '@/store/settingsStore';
import { spacing } from '@/theme';
import { MAIN_TAB_BAR_INSET } from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SettingsScreen() {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const requireBiometrics = useSettingsStore((s) => s.settings.requireBiometrics);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const language = useSettingsStore((s) => s.settings.language);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // Отступ контента под плавающую панель вкладок.
  const bottomInset = insets.bottom + MAIN_TAB_BAR_INSET;

  // null — ещё не определили доступность биометрии.
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    isBiometricsAvailable().then(setAvailable);
  }, []);

  return (
    <MainTabSwipeGesture tabIndex={2}>
      <AppScreen scroll>
        <View style={[styles.container, { paddingBottom: bottomInset }]}>
          <AppText variant="title">{t('settings.title')}</AppText>

        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">{t('settings.biometrics')}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t('settings.biometricsHint')}
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
              {t('settings.biometricsUnavailable')}
            </AppText>
          ) : null}
        </AppCard>

        <ReminderSettingsCard />

        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">{t('settings.haptics')}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t('settings.hapticsHint')}
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

        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">{t('settings.language')}</AppText>
              <AppText color="textSecondary" variant="caption">
                {LANGUAGE_NAMES[language]}
              </AppText>
            </View>
            <LanguageSwitcher variant="clean" />
          </View>
        </AppCard>

        <AppButton
          label={t('settings.support')}
          variant="secondary"
          onPress={() => router.push('/support')}
        />
      </View>
      </AppScreen>
    </MainTabSwipeGesture>
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
