/**
 * Назначение: адаптивная поверхность (iOS) с native glass / blur / elevation / neu / solid.
 *
 * Функции:
 * - native-glass → GlassView (expo-glass-effect) при доступном Liquid Glass;
 * - frosted → BlurView (expo-blur);
 * - elevated → View с мягкой тенью (Material);
 * - neumorphic → NeuSurface;
 * - solid / Reduce Transparency → обычный View.
 *
 * Слой: UI (/src/components/ui). Используется на iOS (файл .ios.tsx).
 */

import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { BlurView } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';

import { resolveMaterial } from '@/theme/material';
import { useAppTheme } from '@/theme/ThemeProvider';

import type { AdaptiveSurfaceProps } from './adaptive-surface';
import { NeuSurface } from './neu-surface';

/**
 * Отслеживает системную настройку Reduce Transparency.
 * До завершения асинхронной проверки считаем, что прозрачность НЕ снижена.
 */
function useReduceTransparency(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled().then((value) => {
      if (mounted) {
        setReduced(value);
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduced,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
}

export function AdaptiveSurface({
  material,
  backgroundColor,
  borderRadius,
  isInteractive = false,
  style,
  children,
  ...rest
}: AdaptiveSurfaceProps) {
  const { scheme } = useAppTheme();
  const reduceTransparency = useReduceTransparency();

  const resolved = resolveMaterial(material, {
    isIos: true,
    glassApiAvailable: isGlassEffectAPIAvailable(),
    liquidGlassAvailable: isLiquidGlassAvailable(),
    reduceTransparency,
  });

  if (resolved === 'native-glass') {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor={backgroundColor}
        colorScheme={scheme}
        isInteractive={isInteractive}
        style={[styles.base, { borderRadius }, style]}
        {...rest}>
        {children}
      </GlassView>
    );
  }

  if (resolved === 'frosted') {
    return (
      <BlurView
        intensity={scheme === 'dark' ? 30 : 40}
        tint={scheme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'}
        style={[styles.base, { borderRadius }, style]}
        {...rest}>
        {children}
      </BlurView>
    );
  }

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
