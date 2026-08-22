/**
 * Назначение: полноэкранное фото с pinch-to-zoom и панорамированием.
 *
 * Функции:
 * - pinch жест масштабирует фото (1x..4x);
 * - pan жест перемещает увеличенное фото;
 * - при возврате к масштабу 1x перевод сбрасывается.
 *
 * Слой: UI (/src/features/gallery/components). Использует Reanimated 4 и
 * Gesture Handler 2. Файловую систему не трогает — получает uri через пропсы.
 */

import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// Максимальный коэффициент увеличения.
const MAX_SCALE = 4;
// Минимальный коэффициент увеличения (обычный вид).
const MIN_SCALE = 1;

interface ZoomablePhotoProps {
  /** Путь к файлу фото. */
  uri: string;
}

export function ZoomablePhoto({ uri }: ZoomablePhotoProps) {
  // Текущий масштаб и смещение (shared values, работают на UI-потоке).
  const scale = useSharedValue(MIN_SCALE);
  const savedScale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pinch: масштабирование. Отслеживаем стартовое значение, чтобы
  // каждый новый жест продолжал текущий масштаб, а не сбрасывал его.
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      // При возврате к 1x сбрасываем смещение плавно.
      if (scale.value <= MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
      }
    });

  // Pan: панорамирование увеличенного фото (работает только при scale > 1).
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (scale.value > MIN_SCALE) {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    });

  // Совмещаем pinch и pan: они не конфликтуют (разное число пальцев).
  const composed = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={styles.container}>
        <Animated.View style={[styles.imageWrap, animatedStyle]}>
          <Image source={{ uri }} style={styles.image} contentFit="contain" />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  imageWrap: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
});
