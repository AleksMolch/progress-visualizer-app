/**
 * Назначение: экран отдельного проекта.
 *
 * Функции:
 * - читает id проекта из параметров маршрута;
 * - показывает заглушку (позже — ленту фотографий проекта).
 *
 * Слой: UI (/src/app). Использует useLocalSearchParams из expo-router.
 */

import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Проект</Text>
      <Text style={styles.hint}>ID: {id}</Text>
      <Text style={styles.hint}>Здесь появится лента фотографий проекта.</Text>
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
