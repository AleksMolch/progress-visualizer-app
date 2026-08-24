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
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function SupportScreen() {
  const { colors } = useAppTheme();
  const premiumEnabled = useAppStore((s) => s.premiumEnabled);
  const setPremiumEnabled = useAppStore((s) => s.setPremiumEnabled);

  return (
    <AppScreen scroll>
      <Stack.Screen options={{ title: 'Поддержка' }} />

      <View style={styles.container}>
        <AppText variant="title">Поддержать разработчика</AppText>

        {/* Честное описание приватностной модели приложения. */}
        <AppCard style={styles.card}>
          <AppText variant="subtitle">О приложении</AppText>
          <AppText color="textSecondary">
            ProgressPrivate не содержит рекламы, аналитики и трекинга. Все фотографии
            и метаданные прогресса хранятся только на вашем устройстве и никогда не
            отправляются на сервер или третьим лицам.
          </AppText>
        </AppCard>

        {/* Premium: статус + dev-заглушка переключения (IAP отложен). */}
        <AppCard style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <AppText variant="subtitle">Premium</AppText>
              <AppText color="textSecondary" variant="caption">
                {premiumEnabled ? 'Активен' : 'Не активен'}
              </AppText>
            </View>
            <Switch
              value={premiumEnabled}
              onValueChange={(value) => setPremiumEnabled(value)}
              trackColor={{ true: colors.primary }}
            />
          </View>

          <AppText color="textSecondary" variant="caption">
            In-App Purchase ещё не подключён — переключатель является временной
            заглушкой для разработки и не влечёт списаний.
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
