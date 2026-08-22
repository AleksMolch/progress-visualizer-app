/**
 * Назначение: сравнение двух фото «до/после» перетаскиваемым разделителем.
 *
 * Функции:
 * - показывает «предыдущее» фото под «текущим»;
 * - вертикальный разделитель, который пользователь перетаскивает влево/вправо,
 *   чтобы увидеть нижнее фото;
 * - использует Reanimated + Gesture Handler (pan).
 *
 * Слой: UI (/src/features/gallery/components). Файловую систему не трогает.
 */

import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

interface CompareSliderProps {
  /** Путь к «предыдущему» (нижнему) фото. */
  beforeUri: string;
  /** Путь к «текущему» (верхнему) фото. */
  afterUri: string;
}

export function CompareSlider({ beforeUri, afterUri }: CompareSliderProps) {
  // Ширина контейнера (заполняется после layout).
  const [width, setWidth] = useState(0);
  // Позиция разделителя (shared value на UI-потоке).
  const dividerX = useSharedValue(0);
  const savedDividerX = useSharedValue(0);

  // Устанавливаем начальную позицию разделителя по центру.
  const onLayout = (event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    setWidth(w);
    dividerX.value = w / 2;
    savedDividerX.value = w / 2;
  };

  // Pan: перетаскивание разделителя. runOnJS нужен, т.к. setWidth — JS-функция.
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedDividerX.value = dividerX.value;
    })
    .onUpdate((event) => {
      dividerX.value = clamp(savedDividerX.value + event.translationX, 0, width);
    });

  // Верхнее фото обрезается по ширине до разделителя (левый край остаётся видимым).
  const topStyle = useAnimatedStyle(() => ({
    width: dividerX.value,
  }));

  // Линия разделителя двигается вместе с пальцем.
  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dividerX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container} onLayout={onLayout}>
        {/* Нижний слой — «до». */}
        <Image source={{ uri: beforeUri }} style={StyleSheet.absoluteFill} contentFit="cover" />

        {/* Верхний слой — «после», видимый слева от разделителя. */}
        <Animated.View style={[styles.afterClip, topStyle]}>
          <Image source={{ uri: afterUri }} style={styles.afterImage} contentFit="cover" />
        </Animated.View>

        {/* Линия разделителя с ручкой. */}
        <Animated.View pointerEvents="none" style={[styles.divider, dividerStyle]}>
          <View style={styles.handle} />
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
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  // Верхнее фото фиксировано по размеру контейнера — обрезается только обёрткой.
  afterImage: {
    ...StyleSheet.absoluteFill,
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#FFFFFF',
    marginLeft: -1,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    left: -9,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
});
