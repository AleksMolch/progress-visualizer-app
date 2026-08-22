/**
 * Назначение: ghost overlay — полупрозрачное последнее фото поверх превью камеры.
 *
 * Функции:
 * - рендерит последнее фото выбранного проекта с заданной прозрачностью;
 * - не интерактивен (пропускает касания к камере/контролам);
 * - ничего не рендерит, если фото нет.
 *
 * Слой: UI (/src/features/camera/components). Файловую систему не трогает —
 * получает готовый uri из store через пропсы.
 */

import { Image } from 'expo-image';
import { StyleSheet, View, type ViewStyle } from 'react-native';

interface GhostOverlayProps {
  /** Путь к последнему фото проекта (null — фото ещё нет). */
  uri: string | null;
  /** Прозрачность overlay (0..1). */
  opacity: number;
  /** Показывать ли overlay. */
  enabled: boolean;
  /** Дополнительный стиль контейнера. */
  style?: ViewStyle;
}

export function GhostOverlay({ uri, opacity, enabled, style }: GhostOverlayProps) {
  if (!enabled || !uri) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={[styles.image, { opacity }]}
        contentFit="cover"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
});
