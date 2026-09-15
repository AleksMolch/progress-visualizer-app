/**
 * Назначение: сравнение двух фото «до/после» в режиме наложения (opacity).
 *
 * Функции:
 * - одно фото поверх другого, слайдер регулирует прозрачность верхнего фото;
 * - подпись «Видимость после: X%»;
 * - начальное значение 50%, не сохраняется в настройки.
 *
 * Слой: UI (/src/features/gallery/components). Файловую систему не трогает.
 */

import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

interface CompareOverlayProps {
  /** Путь к фото «до» (нижний слой). */
  beforeUri: string;
  /** Путь к фото «после» (верхний слой, прозрачность регулируется). */
  afterUri: string;
}

export function CompareOverlay({ beforeUri, afterUri }: CompareOverlayProps) {
  // Прозрачность верхнего фото (0..1), начальное значение 50%.
  const [opacity, setOpacity] = useState(0.5);

  return (
    <View style={styles.container}>
      <View style={styles.stage}>
        <Image source={{ uri: beforeUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <Image
          source={{ uri: afterUri }}
          style={[StyleSheet.absoluteFill, { opacity }]}
          contentFit="cover"
        />
      </View>

      <View style={styles.controls}>
        <AppText variant="caption" color="primaryText">
          Видимость после: {Math.round(opacity * 100)}%
        </AppText>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={opacity}
          onValueChange={setOpacity}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="rgba(255,255,255,0.4)"
          thumbTintColor="#FFFFFF"
          accessibilityLabel="Прозрачность верхнего фото"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  stage: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 4,
  },
  slider: {
    width: '100%',
    height: 32,
  },
});
