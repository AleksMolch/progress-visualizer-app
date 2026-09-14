/**
 * Назначение: базовый компонент карточки (поверхности).
 *
 * Функции:
 * - рендерит контейнер с фоном поверхности, скруглением и внутренним отступом;
 * - радиус берётся из токенов текущего оформления (metrics.cardRadius).
 *
 * Слой: UI (/src/components/ui). Использует useAppTheme.
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function AppCard({ style, children, ...rest }: ViewProps) {
  const { colors, metrics } = useAppTheme();

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderRadius: metrics.cardRadius }, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
});
