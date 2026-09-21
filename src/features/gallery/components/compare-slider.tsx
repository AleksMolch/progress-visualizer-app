/**
 * Назначение: сравнение двух фото «до/после» перетаскиваемым разделителем.
 *
 * Функции:
 * - нижнее фото занимает всю область W × H;
 * - верхнее фото отрисовано на всей области W × H (тот же масштаб и позиция);
 * - разделитель меняет только ширину clipping-контейнера верхнего фото
 *   (видимую область), НЕ масштаб и НЕ кадрирование верхнего изображения;
 * - при повороте/изменении размера сохраняется относительная позиция разделителя.
 *
 * Слой: UI (/src/features/gallery/components). Reanimated + Gesture Handler (pan).
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

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';

interface CompareSliderProps {
  /** Путь к «предыдущему» (нижнему) фото. */
  beforeUri: string;
  /** Путь к «текущему» (верхнему) фото. */
  afterUri: string;
}

export function CompareSlider({ beforeUri, afterUri }: CompareSliderProps) {
  const { t } = useI18n();
  // Фактический размер области сравнения (заполняется после layout).
  const [size, setSize] = useState({ width: 0, height: 0 });
  // Относительная позиция разделителя (0..1), сохраняется при повороте/ресайзе.
  const ratio = useSharedValue(0.5);
  // Позиция разделителя (shared value на UI-потоке).
  const dividerX = useSharedValue(0);
  const savedDividerX = useSharedValue(0);

  // При появлении/изменении области ставим разделитель по сохранённой доле.
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
    dividerX.value = ratio.value * width;
    savedDividerX.value = dividerX.value;
  };

  // Pan: перетаскивание разделителя. runOnJS не нужен — работаем на UI-потоке.
  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedDividerX.value = dividerX.value;
    })
    .onUpdate((event) => {
      dividerX.value = clamp(savedDividerX.value + event.translationX, 0, size.width);
    })
    .onEnd(() => {
      if (size.width > 0) {
        ratio.value = dividerX.value / size.width;
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
      <View style={styles.container} onLayout={onLayout}>
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

        {/* Линия разделителя с ручкой. */}
        <Animated.View pointerEvents="none" style={[styles.divider, dividerStyle]}>
          <View style={styles.handle}>
            <AppText variant="caption" style={styles.handleGlyph}>
              {'‹›'}
            </AppText>
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginLeft: -1,
  },
  handle: {
    position: 'absolute',
    top: '50%',
    left: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(20,22,26,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: [{ offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.35)', blurRadius: 6 }],
  },
  handleGlyph: {
    color: '#FFFFFF',
    fontSize: 13,
    letterSpacing: -1,
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
