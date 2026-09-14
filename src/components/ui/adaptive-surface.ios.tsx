/**
 * Назначение: адаптивная поверхность (iOS) с native glass / blur / solid fallback.
 *
 * Функции:
 * - native-glass → GlassView (expo-glass-effect) при доступном Liquid Glass;
 * - frosted → BlurView (expo-blur);
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
        intensity={60}
        tint={scheme === 'dark' ? 'systemMaterialDark' : 'systemMaterialLight'}
        style={[styles.base, { borderRadius }, style]}
        {...rest}>
        {children}
      </BlurView>
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
});
