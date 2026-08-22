/**
 * Назначение: grid overlay — сетка-направляющая (правило третей) поверх камеры.
 *
 * Функции:
 * - рисует 2 вертикальные и 2 горизонтальные линии, делящие кадр на трети;
 * - не интерактивен (пропускает касания);
 * - ничего не рендерит, если выключен.
 *
 * Слой: UI (/src/features/camera/components).
 */

import { StyleSheet, View } from 'react-native';

interface GridOverlayProps {
  /** Показывать ли сетку. */
  enabled: boolean;
}

export function GridOverlay({ enabled }: GridOverlayProps) {
  if (!enabled) {
    return null;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.verticalLeft} />
      <View style={styles.verticalRight} />
      <View style={styles.horizontalTop} />
      <View style={styles.horizontalBottom} />
    </View>
  );
}

// Толщина линии сетки.
const LINE = 1;
// Прозрачный белый цвет линий, чтобы сетка читалась и на светлом, и на тёмном фоне.
const LINE_COLOR = 'rgba(255,255,255,0.55)';

const styles = StyleSheet.create({
  verticalLeft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: LINE,
    backgroundColor: LINE_COLOR,
  },
  verticalRight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: '33.33%',
    width: LINE,
    backgroundColor: LINE_COLOR,
  },
  horizontalTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33.33%',
    height: LINE,
    backgroundColor: LINE_COLOR,
  },
  horizontalBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '33.33%',
    height: LINE,
    backgroundColor: LINE_COLOR,
  },
});
