/**
 * Назначение: сравнение двух фото «до/после» перетаскиваемым разделителем.
 *
 * Функции:
 * - нижнее фото занимает всю область W × H;
 * - верхнее фото отрисовано на всей области W × H (тот же масштаб и позиция);
 * - разделитель меняет только ширину clipping-контейнера верхнего фото
 *   (видимую область), НЕ масштаб и НЕ кадрирование верхнего изображения;
 * - при повороте/изменении размера сохраняется относительная позиция разделителя;
 * - intro-анимация 0% → 100% → 50% при первом показе (отменяется жестом);
 * - при отпускании разделитель доводится пружиной с учётом скорости жеста;
 * - лёгкий haptic у краёв (0% / 100%), если haptics включён в настройках;
 * - handle 44pt с иконками ‹ › и градиентная линия (встроенный RN-градиент).
 *
 * Слой: UI (/src/features/gallery/components). Reanimated + Gesture Handler (pan).
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  cancelAnimation,
  clamp,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { triggerHaptic } from '@/utils/haptics';

// Параметры intro-анимации: проход 0→100%, пауза и возврат к 50%.
const INTRO_SWEEP_MS = 1500;
const INTRO_PAUSE_MS = 300;
const INTRO_RETURN_MS = 600;

// Параметры пружины при отпускании и порог haptic у краёв.
const RELEASE_SPRING = { damping: 20, stiffness: 90 };
const VELOCITY_FACTOR = 0.1;
const EDGE_THRESHOLD = 0.05;

/**
 * Градиент линии разделителя: линия растворяется к верхнему и нижнему краю.
 * Используется встроенный в RN 0.86 градиент — без зависимости expo-linear-gradient.
 */
const DIVIDER_GRADIENT: ViewStyle = {
  experimental_backgroundImage: [
    {
      type: 'linear-gradient',
      direction: 'to bottom',
      colorStops: [
        { color: 'rgba(255,255,255,0)', positions: ['0%'] },
        { color: 'rgba(255,255,255,0.9)', positions: ['20%'] },
        { color: 'rgba(255,255,255,0.9)', positions: ['80%'] },
        { color: 'rgba(255,255,255,0)', positions: ['100%'] },
      ],
    },
  ],
};

interface CompareSliderProps {
  /** Путь к «предыдущему» (нижнему) фото. */
  beforeUri: string;
  /** Путь к «текущему» (верхнему) фото. */
  afterUri: string;
}

export function CompareSlider({ beforeUri, afterUri }: CompareSliderProps) {
  const { t } = useI18n();
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const reduceMotion = useReducedMotion();

  // Фактический размер области сравнения (заполняется после layout).
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Позиция разделителя в долях (0..1) для поворота/ресайза и accessibility.
  const [a11yPercent, setA11yPercent] = useState(50);

  // Позиция разделителя (shared value на UI-потоке).
  const dividerX = useSharedValue(0);
  const savedDividerX = useSharedValue(0);
  const ratio = useSharedValue(0.5);

  // Intro проигрывается один раз за жизнь экрана и только после измерения области.
  const hasPlayedIntro = useRef(false);
  const hasMeasured = useRef(false);

  // Haptic у краёв вызывается с UI-потока через runOnJS (уважает настройку).
  const notifyEdgeHaptic = () => {
    void triggerHaptic('impact', hapticsEnabled);
  };

  // Обновление accessibility-значения (проценты) при отпускании разделителя.
  const updateA11yPercent = (percent: number) => {
    setA11yPercent(percent);
  };

  // При появлении/изменении области ставим разделитель по сохранённой доле
  // и один раз запускаем intro (если не включён reduced motion).
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
    dividerX.value = ratio.value * width;
    savedDividerX.value = dividerX.value;

    if (!hasMeasured.current && width > 0) {
      hasMeasured.current = true;
      if (!hasPlayedIntro.current && !reduceMotion) {
        // Intro: 0% → 100% → 50%. Повторно не запускаем.
        hasPlayedIntro.current = true;
        ratio.value = 0.5;
        dividerX.value = 0;
        dividerX.value = withSequence(
          withTiming(width, {
            duration: INTRO_SWEEP_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          withDelay(INTRO_PAUSE_MS, withTiming(width / 2, { duration: INTRO_RETURN_MS })),
        );
      }
    }
  };

  // Pan: перетаскивание разделителя. runOnJS не нужен — работаем на UI-потоке.
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Пользователь начал раньше окончания intro — прерываем её.
      cancelAnimation(dividerX);
      savedDividerX.value = dividerX.value;
    })
    .onUpdate((event) => {
      dividerX.value = clamp(savedDividerX.value + event.translationX, 0, size.width);
    })
    .onEnd((event) => {
      if (size.width <= 0) {
        return;
      }
      // Доводим разделитель пружиной: скорость свайпа продолжает движение.
      const projected = dividerX.value + event.velocityX * VELOCITY_FACTOR;
      const finalX = clamp(projected, 0, size.width);
      dividerX.value = withSpring(finalX, {
        ...RELEASE_SPRING,
        velocity: event.velocityX,
      });
      ratio.value = finalX / size.width;

      const relative = finalX / size.width;
      runOnJS(updateA11yPercent)(Math.round(relative * 100));
      // Лёгкий тактильный отклик при достижении края (0% или 100%).
      if (relative <= EDGE_THRESHOLD || relative >= 1 - EDGE_THRESHOLD) {
        runOnJS(notifyEdgeHaptic)();
      }
    });

  // Клип-контейнер верхнего фото: меняется только его ширина (видимая область).
  const clipStyle = useAnimatedStyle(() => ({
    width: dividerX.value,
  }));

  // Линия разделителя двигается вместе с пальцем.
  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={styles.container}
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel={t('compare.sliderA11y')}
        accessibilityValue={{ min: 0, max: 100, now: a11yPercent }}>
        {/* Нижний слой — «до», на всю область. */}
        <Image source={{ uri: beforeUri }} style={StyleSheet.absoluteFill} contentFit="cover" />

        {/* Клип верхнего слоя: полная высота, ширина = позиция разделителя. */}
        <Animated.View style={[styles.afterClip, clipStyle]}>
          {/* Верхнее фото отрисовано на всю область (width/height = size), не сжимается. */}
          <Image
            source={{ uri: afterUri }}
            style={[styles.afterImage, { width: size.width, height: size.height }]}
            contentFit="cover"
          />
        </Animated.View>

        {/* Подписи «До»/«После» поверх изображения. */}
        <View pointerEvents="none" style={[styles.label, styles.labelBefore]}>
          <AppText variant="caption" color="primaryText">
            {t('compare.before')}
          </AppText>
        </View>
        <View pointerEvents="none" style={[styles.label, styles.labelAfter]}>
          <AppText variant="caption" color="primaryText">
            {t('compare.after')}
          </AppText>
        </View>

        {/* Линия разделителя с градиентным затуханием и крупной ручкой. */}
        <Animated.View pointerEvents="none" style={[styles.divider, DIVIDER_GRADIENT, dividerStyle]}>
          <View style={styles.handle}>
            <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
            <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  afterClip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  // Верхнее фото фиксировано по размеру области — обрезается только обёрткой.
  afterImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    left: -21,
    width: 44,
    height: 44,
    marginTop: -22,
    borderRadius: 22,
    backgroundColor: 'rgba(20,22,26,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Тень для iOS, elevation для Android — ручка видна на светлом фоне.
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
  },
  label: {
    position: 'absolute',
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  labelBefore: {
    left: 12,
  },
  labelAfter: {
    right: 12,
  },
});
