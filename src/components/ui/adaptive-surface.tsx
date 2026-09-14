/**
 * Назначение: адаптивная поверхность для платформ без нативного blur/glass.
 *
 * Функции:
 * - на Android/web материалы frosted/native-glass сводятся к solid
 *   (см. theme/material.ts); elevated → View с тенью; neumorphic → NeuSurface;
 *   solid → обычный View.
 *
 * Слой: UI (/src/components/ui). iOS-вариант — в adaptive-surface.ios.tsx.
 * Разделение нужно, чтобы не импортировать iOS-only модули (expo-glass-effect,
 * expo-blur) в неподдерживаемый runtime.
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import { type RequestedMaterial } from '@/theme/material';
import { resolveMaterial } from '@/theme/material';

import { NeuSurface } from './neu-surface';

export interface AdaptiveSurfaceProps extends ViewProps {
  /** Запрошенный материал. */
  material: RequestedMaterial;
  /** Фоновый цвет поверхности. */
  backgroundColor?: string;
  /** Радиус скругления. */
  borderRadius?: number;
  /** Интерактивность (для glass-поверхностей; здесь не используется). */
  isInteractive?: boolean;
}

export function AdaptiveSurface({
  material,
  backgroundColor,
  borderRadius,
  isInteractive: _isInteractive,
  style,
  children,
  ...rest
}: AdaptiveSurfaceProps) {
  const resolved = resolveMaterial(material, {
    isIos: false,
    glassApiAvailable: false,
    liquidGlassAvailable: false,
    reduceTransparency: false,
  });

  if (resolved === 'neumorphic') {
    return (
      <NeuSurface radius={borderRadius} style={style} {...rest}>
        {children}
      </NeuSurface>
    );
  }

  if (resolved === 'elevated') {
    return (
      <View style={[styles.base, styles.elevated, { backgroundColor, borderRadius }, style]} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.base, { backgroundColor, borderRadius }, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  elevated: {
    boxShadow: [{ offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.15)', blurRadius: 6 }],
  },
});
