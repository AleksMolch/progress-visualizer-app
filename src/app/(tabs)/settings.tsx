/**
 * Назначение: экран-заглушка вкладки «Настройки».
 *
 * Функции:
 * - показывает заголовок и пустое состояние экрана настроек.
 *
 * Слой: UI (/src/app). Позже будет заполнен настройками приватности
 * (биометрия, напоминания, экспорт) в Фазах 10–13.
 */

import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';

export default function SettingsScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <AppText variant="title">Настройки</AppText>
        <AppText color="textSecondary">Здесь появятся настройки приложения.</AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
});
