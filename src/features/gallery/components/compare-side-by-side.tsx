/**
 * Назначение: сравнение двух фото «до/после» рядом друг с другом.
 *
 * Функции:
 * - показывает два фото одинаковой ширины с подписями;
 * - «до» (предыдущее) слева, «после» (текущее) справа.
 *
 * Слой: UI (/src/features/gallery/components). Файловую систему не трогает.
 */

import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

interface CompareSideBySideProps {
  /** Путь к «предыдущему» фото. */
  beforeUri: string;
  /** Путь к «текущему» фото. */
  afterUri: string;
  /** Подпись-дата для «До» (необязательно). */
  beforeLabel?: string;
  /** Подпись-дата для «После» (необязательно). */
  afterLabel?: string;
}

export function CompareSideBySide({
  beforeUri,
  afterUri,
  beforeLabel,
  afterLabel,
}: CompareSideBySideProps) {
  return (
    <View style={styles.row}>
      <View style={styles.pane}>
        <Image source={{ uri: beforeUri }} style={styles.image} contentFit="cover" />
        <View style={styles.caption}>
          <AppText variant="caption" color="primaryText">
            До{beforeLabel ? ` · ${beforeLabel}` : ''}
          </AppText>
        </View>
      </View>

      <View style={styles.pane}>
        <Image source={{ uri: afterUri }} style={styles.image} contentFit="cover" />
        <View style={styles.caption}>
          <AppText variant="caption" color="primaryText">
            После{afterLabel ? ` · ${afterLabel}` : ''}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 2,
    backgroundColor: '#000000',
  },
  pane: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  caption: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});
