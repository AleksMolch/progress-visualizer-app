/**
 * Назначение: экран «Поддержать разработчика».
 *
 * Функции:
 * - честно описывает приватностную модель приложения (без рекламы, трекинга,
 *   данные только на устройстве);
 * - показывает статус premium и временную dev-заглушку переключения premium
 *   (In-App Purchase ещё не подключён).
 *
 * Слой: UI (/src/app). Данные — useAppStore. Навигация — нативный заголовок
 * стека (назад). IAP не подключается — см. DECISIONS.md.
 */

import { Stack } from 'expo-router';
import { StyleSheet, Switch, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SupportScreen() {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const premiumEnabled = useAppStore((s) => s.premiumEnabled);
  const setPremiumEnabled = useAppStore((s) => s.setPremiumEnabled);

  return (
    <AppScreen scroll>
      <Stack.Screen options={{ title: t('support.title') }} />

      <View style={styles.container}>
        <AppText variant="title">{t('support.header')}</AppText>

        {/* Честное описание приватностной модели приложения. */}
        <AppCard style={styles.card}>
          <AppText variant="subtitle">{t('support.about')}</AppText>
          <AppText color="textSecondary">{t('support.aboutText')}</AppText>
        </AppCard>

        {/* Premium: статус + dev-заглушка переключения (IAP отложен). */}
        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">{t('support.premium')}</AppText>
              <AppText color="textSecondary" variant="caption">
                {premiumEnabled ? t('support.active') : t('support.inactive')}
              </AppText>
            </View>
            <Switch
              value={premiumEnabled}
              onValueChange={(value) => setPremiumEnabled(value)}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <AppText color="textSecondary" variant="caption">
            {t('support.premiumNote')}
          </AppText>
        </AppCard>
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
