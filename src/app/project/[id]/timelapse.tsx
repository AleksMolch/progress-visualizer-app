/**
 * Назначение: псевдо-timelapse — последовательный показ фото прогресса.
 *
 * Функции:
 * - показывает фото проекта в хронологическом порядке с авто-прокруткой;
 * - пауза/продолжение и зацикливание по окончании;
 * - показывает номер текущего кадра.
 *
 * Слой: UI (/src/app). Данные — useProjectStore, порядок — getChronologicalPhotos.
 * Это НЕ генерация видеофайла: файл не создаётся, всё происходит в UI
 * (см. DECISIONS.md, решение по timelapse).
 */

import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { useProjectStore } from '@/store/projectStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getChronologicalPhotos } from '@/utils/photos';

// Интервал смены кадра (мс).
const FRAME_INTERVAL_MS = 700;

export default function TimelapseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();

  const photos = useProjectStore((s) => s.photos);

  // Фото проекта в хронологическом порядке (от ранних к поздним).
  const sequence = useMemo(() => getChronologicalPhotos(photos, id), [photos, id]);

  // Текущий кадр и режим воспроизведения.
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Авто-прокрутка кадров, пока включено воспроизведение.
  useEffect(() => {
    if (!playing || sequence.length < 2) {
      return;
    }
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % sequence.length);
    }, FRAME_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [playing, sequence.length]);

  // Текущее фото с защитой от выхода за границы (если фото удалили).
  const current = sequence[Math.min(index, Math.max(sequence.length - 1, 0))];

  return (
    <AppScreen style={styles.screen}>
      <Stack.Screen options={{ title: 'Timelapse' }} />

      {!current ? (
        <View style={styles.empty}>
          <AppText variant="title">Недостаточно фото</AppText>
          <AppText color="textSecondary" style={styles.emptyText}>
            Для просмотра прогресса нужно хотя бы одно фото.
          </AppText>
        </View>
      ) : (
        <View style={[styles.player, { backgroundColor: colors.background }]}>
          <Image
            source={{ uri: current.uri }}
            style={styles.image}
            contentFit="contain"
            transition={100}
          />

          <View style={styles.controls}>
            <AppText color="textSecondary" variant="caption">
              {Math.min(index, sequence.length - 1) + 1} / {sequence.length}
            </AppText>
            <AppButton
              label={playing ? 'Пауза' : 'Продолжить'}
              variant="secondary"
              onPress={() => setPlaying((value) => !value)}
            />
          </View>
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  player: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
  },
});
