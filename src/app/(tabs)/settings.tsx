/**
 * Назначение: экран-заглушка вкладки «Настройки».
 *
 * Функции:
 * - показывает заголовок и пустое состояние экрана настроек.
 *
 * Слой: UI (/src/app). Позже будет заполнен настройками приватности
 * (биометрия, напоминания, экспорт) в Фазах 10–13.
 */

import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Настройки</Text>
      <Text style={styles.hint}>Здесь появятся настройки приложения.</Text>
    </View>
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
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#666666',
  },
});
