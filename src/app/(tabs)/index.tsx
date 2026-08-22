/**
 * Назначение: экран-заглушка вкладки «Проекты».
 *
 * Функции:
 * - показывает заголовок и пустое состояние списка проектов;
 * - демонстрирует базовые UI-компоненты и переход на экран проекта.
 *
 * Слой: UI (/src/app). Позже будет заменён реальным списком проектов (Фаза 8).
 */

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { spacing } from '@/theme';

export default function ProjectsScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <AppText variant="title">Проекты</AppText>
        <AppText color="textSecondary">Здесь появится список проектов.</AppText>

        <AppCard style={styles.card}>
          <View style={styles.cardBody}>
            <AppText variant="subtitle">Демо-навигация</AppText>
            <AppText color="textSecondary">Проверка перехода на экран проекта.</AppText>
            <AppButton
              label="Открыть пример проекта"
              onPress={() => router.push('/project/demo')}
            />
          </View>
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    width: '100%',
  },
  cardBody: {
    gap: spacing.sm,
  },
});
