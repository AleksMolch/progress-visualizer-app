/**
 * Назначение: экран-заглушка вкладки «Проекты».
 *
 * Функции:
 * - показывает заголовок и пустое состояние списка проектов;
 * - даёт переход на пример экрана проекта для проверки навигации.
 *
 * Слой: UI (/src/app). Позже будет заменён реальным списком проектов (Фаза 8).
 */

import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function ProjectsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Проекты</Text>
      <Text style={styles.hint}>Здесь появится список проектов.</Text>
      <Link href="/project/demo" style={styles.link}>
        Открыть пример проекта
      </Link>
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
  link: {
    fontSize: 16,
    color: '#208AEF',
    marginTop: 8,
  },
});
