/**
 * Назначение: базовый компонент карточки (поверхности).
 *
 * Функции:
 * - рендерит контейнер с фоном поверхности, скруглением и внутренним отступом;
 * - материал (solid/frosted/native-glass) и радиус берутся из токенов текущего
 *   оформления через AdaptiveSurface.
 *
 * Слой: UI (/src/components/ui). Использует useAppTheme.
 */

import { StyleSheet, type ViewProps } from 'react-native';

import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AdaptiveSurface } from './adaptive-surface';

export function AppCard({ style, children, ...rest }: ViewProps) {
  const { colors, metrics, material } = useAppTheme();

  return (
    <AdaptiveSurface
      material={material.card}
      backgroundColor={colors.surface}
      borderRadius={metrics.cardRadius}
      style={[styles.card, style]}
      {...rest}>
      {children}
    </AdaptiveSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
});
