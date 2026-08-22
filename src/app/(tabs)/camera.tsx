/**
 * Назначение: экран-заглушка вкладки «Камера».
 *
 * Функции:
 * - показывает заголовок и пустое состояние экрана съёмки.
 *
 * Слой: UI (/src/app). Позже будет заменён реальной камерой с ghost overlay (Фаза 6–7).
 */

import { StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';

export default function CameraScreen() {
  return (
    <AppScreen>
      <View style={styles.container}>
        <AppText variant="title">Камера</AppText>
        <AppText color="textSecondary">Здесь появится съёмка с ghost overlay.</AppText>
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
