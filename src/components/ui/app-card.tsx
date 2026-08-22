/**
 * Назначение: базовый компонент карточки (поверхности).
 *
 * Функции:
 * - рендерит контейнер с фоном поверхности, скруглением и внутренним отступом.
 *
 * Слой: UI (/src/components/ui). Использует useAppTheme.
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export function AppCard({ style, children, ...rest }: ViewProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
  },
});
