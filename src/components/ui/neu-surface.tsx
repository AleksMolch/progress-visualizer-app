/**
 * Назначение: неоморфная поверхность (raised/pressed/flat).
 *
 * Функции:
 * - рисует мягкую поверхность с двойной тенью (светлая сверху-слева,
 *   тёмная снизу-справа) для raised-состояния;
 * - pressed/inset использует внутренние тени и более тёмную поверхность;
 * - flat — просто поверхность без теней.
 *
 * Слой: UI (/src/components/ui). Тени строятся через кросс-платформенный
 * `boxShadow` (RN 0.76+). Цвета берёт из неоморфных токенов темы (useAppTheme.neu).
 * При отсутствии токенов (другая тема) — нейтральные fallback-цвета.
 */

import { useMemo } from 'react';
import { View, type ViewProps, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';

/** Состояние неоморфной поверхности. */
export type NeuVariant = 'raised' | 'pressed' | 'flat';

interface NeuSurfaceProps extends ViewProps {
  /** Состояние поверхности. */
  variant?: NeuVariant;
  /** Радиус скругления. */
  radius?: number;
}

// Смещения и радиусы теней (константы; цвета — из токенов темы).
const RAISED_OFFSET = 6;
const RAISED_BLUR = 12;
const PRESSED_OFFSET = 4;
const PRESSED_BLUR = 8;

export function NeuSurface({
  variant = 'raised',
  radius = 20,
  style,
  children,
  ...rest
}: NeuSurfaceProps) {
  const { colors, neu } = useAppTheme();

  // Неоморфные токены с нейтральным fallback, если тема не neumorphism.
  const shadowLight = neu?.shadowLight ?? '#FFFFFF';
  const shadowDark = neu?.shadowDark ?? '#B7C4DD';
  const surface = colors.surface;
  const surfacePressed = neu?.surfacePressed ?? colors.surface;

  // Стиль теней зависит от состояния поверхности.
  const shadowStyle = useMemo<ViewStyle>(() => {
    if (variant === 'flat') {
      return { backgroundColor: surface };
    }
    if (variant === 'pressed') {
      return {
        backgroundColor: surfacePressed,
        boxShadow: [
          { offsetX: PRESSED_OFFSET, offsetY: PRESSED_OFFSET, color: shadowDark, blurRadius: PRESSED_BLUR, inset: true },
          { offsetX: -PRESSED_OFFSET, offsetY: -PRESSED_OFFSET, color: shadowLight, blurRadius: PRESSED_BLUR, inset: true },
        ],
      };
    }
    return {
      backgroundColor: surface,
      boxShadow: [
        { offsetX: -RAISED_OFFSET, offsetY: -RAISED_OFFSET, color: shadowLight, blurRadius: RAISED_BLUR },
        { offsetX: RAISED_OFFSET, offsetY: RAISED_OFFSET, color: shadowDark, blurRadius: RAISED_BLUR },
      ],
    };
  }, [variant, surface, surfacePressed, shadowLight, shadowDark]);

  return (
    <View style={[{ borderRadius: radius }, shadowStyle, style]} {...rest}>
      {children}
    </View>
  );
}
