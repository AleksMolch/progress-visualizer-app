/**
 * Назначение: анимированное числовое значение (count-up) для статистики.
 *
 * Функции:
 * - AnimatedNumber: плавно меняет число от текущего к целевому;
 * - поддерживает decimals, prefix, suffix и настраиваемую длительность;
 * - уважает reduced motion — при нём показывает значение мгновенно;
 * - для скринридеров объявляет финальное значение.
 *
 * Слой: UI (/src/components/ui). Reanimated 4.
 *
 * Реализация: анимируем `text` у TextInput на UI-потоке (штатный паттерн
 * Reanimated 4 — так же устроен его PerformanceMonitor). `addWhitelistedNativeProps`
 * из старых версий Reanimated в 4.x отсутствует, поэтому TextInput + animatedProps.
 */

import { useEffect } from 'react';
import { StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppTheme } from '@/theme/ThemeProvider';

// Animated-обёртка TextInput: `text` обновляется на UI-потоке без ре-рендеров.
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedNumberProps {
  /** Целевое значение. */
  value: number;
  /** Длительность анимации в миллисекундах. */
  duration?: number;
  /** Количество знаков после запятой. */
  decimals?: number;
  /** Префикс строки (например, «+»). */
  prefix?: string;
  /** Суффикс строки (например, «%»). */
  suffix?: string;
  /** Стиль текста (размер, вес, цвет). */
  style?: StyleProp<TextStyle>;
}

export function AnimatedNumber({
  value,
  duration = 800,
  decimals = 0,
  prefix = '',
  suffix = '',
  style,
}: AnimatedNumberProps) {
  const { colors } = useAppTheme();
  const reduceMotion = useReducedMotion();
  const animatedValue = useSharedValue(0);

  // Двигаем число к цели; при reduced motion — мгновенно, без анимации.
  useEffect(() => {
    animatedValue.value = reduceMotion
      ? value
      : withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [animatedValue, duration, reduceMotion, value]);

  // Текст собирается на UI-потоке: React не перерисовывается ни на один кадр.
  const animatedProps = useAnimatedProps(() => {
    const text = `${prefix}${animatedValue.value.toFixed(decimals)}${suffix}`;
    return { text, defaultValue: text };
  });

  // Финальное значение для скринридеров — не зависит от кадров анимации.
  const finalText = `${prefix}${value.toFixed(decimals)}${suffix}`;

  return (
    <AnimatedTextInput
      editable={false}
      animatedProps={animatedProps}
      style={[styles.base, { color: colors.text }, style]}
      underlineColorAndroid="transparent"
      pointerEvents="none"
      accessible
      accessibilityLabel={finalText}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    // Убираем «инпутные» отступы, чтобы текст вёл себя как обычный Text.
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
  },
});
