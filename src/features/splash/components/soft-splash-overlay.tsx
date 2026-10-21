/**
 * Назначение: мягкий JS-оверлей заставки поверх нативного splash.
 *
 * Функции:
 * - первый кадр совпадает с нативным splash (тот же фон, PNG, размер, центр);
 * - пока хранилище не готово — спокойное «дыхание» знака (scale 1 ↔ 1.018);
 * - после готовности — короткий цикл 1 → 1.025 → 1 и мягкий fade-out;
 * - reduced motion: без движения, оверлей скрывается сразу;
 * - onFinish вызывается ровно один раз (ref-guard);
 * - onOverlayLayout — после первого layout (можно скрыть нативный splash).
 *
 * Слой: UI (/src/features/splash/components). Reanimated 4, без новых зависимостей.
 */

import { useCallback, useEffect, useRef } from 'react';
import { Image, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import splashMark from '../../../../assets/images/splash-icon.png';

// Должно совпадать с expo-splash-screen в app.json (иначе будет скачок):
// тот же PNG (полный логотип с синим лепестком), фон и imageWidth.
const SPLASH_BACKGROUND = '#0B0D12';
const MARK_SIZE = 160;

// Параметры анимации.
const BREATH_SCALE = 1.018;
const BREATH_HALF_MS = 900;
const READY_SCALE = 1.025;
const READY_SCALE_MS = 220;
const FADE_MS = 200;

const AnimatedImage = Animated.createAnimatedComponent(Image);

interface SoftSplashOverlayProps {
  /** storageReady && nativeSplashHidden — можно завершать. */
  isReady: boolean;
  /** Нативный splash скрыт — можно начинать дыхание/финальный цикл. */
  startAnimation: boolean;
  /** Вызывается после fade-out (ровно один раз). */
  onFinish: () => void;
  /** Вызывается после первого layout оверлея. */
  onOverlayLayout: () => void;
}

export function SoftSplashOverlay({
  isReady,
  startAnimation,
  onFinish,
  onOverlayLayout,
}: SoftSplashOverlayProps) {
  const reduceMotion = useReducedMotion();

  // Начальное состояние строго 1/1 — первый кадр совпадает с нативным splash.
  const scale = useSharedValue(1);
  const overlayOpacity = useSharedValue(1);

  const finishedRef = useRef(false);
  const layoutReportedRef = useRef(false);
  // Колбэк завершения читаем через ref, чтобы не перезапускать анимацию.
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const finishOnce = useCallback(() => {
    if (finishedRef.current) {
      return;
    }
    finishedRef.current = true;
    onFinishRef.current();
  }, []);

  // Дыхание до готовности; после готовности — короткий цикл и fade-out.
  useEffect(() => {
    if (!startAnimation) {
      return;
    }

    // Reduced motion: без движения, сразу открыть приложение.
    if (reduceMotion) {
      if (isReady) {
        overlayOpacity.value = 0;
        finishOnce();
      }
      return;
    }

    if (!isReady) {
      scale.value = withRepeat(
        withSequence(
          withTiming(BREATH_SCALE, {
            duration: BREATH_HALF_MS,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1, { duration: BREATH_HALF_MS, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
      return;
    }

    // Готовность: остановить дыхание, мягко вдохнуть и раствориться.
    cancelAnimation(scale);
    scale.value = withSequence(
      withTiming(READY_SCALE, { duration: READY_SCALE_MS, easing: Easing.inOut(Easing.quad) }),
      withTiming(1, { duration: READY_SCALE_MS, easing: Easing.inOut(Easing.quad) }),
    );
    overlayOpacity.value = withDelay(
      READY_SCALE_MS * 2,
      withTiming(0, { duration: FADE_MS, easing: Easing.inOut(Easing.quad) }, (completed) => {
        if (completed) {
          runOnJS(finishOnce)();
        }
      }),
    );
  }, [finishOnce, isReady, overlayOpacity, reduceMotion, scale, startAnimation]);

  // При размонтировании останавливаем активные анимации.
  useEffect(() => {
    return () => {
      cancelAnimation(scale);
      cancelAnimation(overlayOpacity);
    };
  }, [overlayOpacity, scale]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Первый layout сообщаем один раз — родитель скроет нативный splash.
  const handleLayout = (_event: LayoutChangeEvent) => {
    if (layoutReportedRef.current) {
      return;
    }
    layoutReportedRef.current = true;
    onOverlayLayout();
  };

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={handleLayout}
      style={[styles.overlay, overlayStyle]}>
      <AnimatedImage source={splashMark} resizeMode="contain" style={[styles.logo, logoStyle]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: MARK_SIZE,
    height: MARK_SIZE,
  },
});
