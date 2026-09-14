/**
 * Назначение: адаптивная поверхность (solid) для платформ без нативного blur.
 *
 * Функции:
 * - на Android/web материал всегда сводится к solid (см. theme/material.ts),
 *   поэтому здесь просто рендерится View с фоном и скруглением.
 *
 * Слой: UI (/src/components/ui). iOS-вариант — в adaptive-surface.ios.tsx.
 * Разделение нужно, чтобы не импортировать iOS-only модули (expo-glass-effect,
 * expo-blur) в неподдерживаемый runtime.
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import type { RequestedMaterial } from '@/theme/material';

export interface AdaptiveSurfaceProps extends ViewProps {
  /** Запрошенный материал (на этих платформах всегда solid). */
  material: RequestedMaterial;
  /** Фоновый цвет поверхности. */
  backgroundColor?: string;
  /** Радиус скругления. */
  borderRadius?: number;
  /** Интерактивность (для glass-поверхностей; здесь не используется). */
  isInteractive?: boolean;
}

export function AdaptiveSurface({
  material: _material,
  backgroundColor,
  borderRadius,
  isInteractive: _isInteractive,
  style,
  children,
  ...rest
}: AdaptiveSurfaceProps) {
  return (
    <View
      style={[styles.base, { backgroundColor, borderRadius }, style]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
