/**
 * Назначение: экран отдельного проекта.
 *
 * Функции:
 * - читает id проекта из параметров маршрута;
 * - показывает заглушку (позже — лента фотографий проекта).
 *
 * Слой: UI (/src/app). Использует useLocalSearchParams из expo-router.
 */

import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText variant="title">Проект</AppText>
      <AppText color="textSecondary">ID: {id}</AppText>
      <AppText color="textSecondary">Здесь появится лента фотографий проекта.</AppText>
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
});
