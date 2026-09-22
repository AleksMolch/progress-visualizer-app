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
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';

interface AppScreenProps {
  children: ReactNode;
  /** Оборачивать ли содержимое в ScrollView. */
  scroll?: boolean;
  /** Дополнительные стили контейнера. */
  style?: ViewStyle;
  /**
   * Какие safe-area края учитывать. По умолчанию — top/left/right (для экранов
   * без нативного header). Для стек-экранов с нативным header передайте
   * `['left', 'right']`, чтобы не применять верхний inset дважды.
   */
  edges?: Edge[];
}

export function AppScreen({ children, scroll = false, style, edges = ['top', 'left', 'right'] }: AppScreenProps) {
  const { colors } = useAppTheme();

  const content = scroll ? (
    <ScrollView contentContainerStyle={styles.scrollContent}>{children}</ScrollView>
  ) : (
    <View style={styles.content}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges}
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
