/**
 * Назначение: базовый экранный контейнер приложения.
 *
 * Функции:
 * - задаёт фоновый цвет по теме и учитывает safe area;
 * - опционально оборачивает содержимое в ScrollView.
 *
 * Слой: UI (/src/components/ui). Использует useAppTheme и safe-area-context.
 * Примечание: нижний отступ управляется таб-баром/навигатором, поэтому
 * нижняя safe area здесь не добавляется.
 */

import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';

interface AppScreenProps {
  children: ReactNode;
  /** Оборачивать ли содержимое в ScrollView. */
  scroll?: boolean;
  /** Дополнительные стили контейнера. */
  style?: ViewStyle;
}

export function AppScreen({ children, scroll = false, style }: AppScreenProps) {
  const { colors } = useAppTheme();

  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: colors.background }, style]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
