/**
 * Назначение: экран-заглушка вкладки «Камера».
 *
 * Функции:
 * - показывает заголовок и пустое состояние экрана съёмки.
 *
 * Слой: UI (/src/app). Позже будет заменён реальной камерой с ghost overlay (Фаза 6–7).
 */

import { StyleSheet, Text, View } from 'react-native';

export default function CameraScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Камера</Text>
      <Text style={styles.hint}>Здесь появится съёмка с ghost overlay.</Text>
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
