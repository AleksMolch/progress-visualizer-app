/**
 * Назначение: полноэкранный просмотр фотографий проекта.
 *
 * Функции:
 * - показывает фото проекта горизонтальной лентой со свайпом между ними;
 * - каждое фото можно увеличивать pinch-жестом (ZoomablePhoto);
 * - кнопка «Сравнить» открывает сравнение текущего фото с предыдущим.
 *
 * Слой: UI (/src/app). Навигация — expo-router, данные — useProjectStore.
 * Файловую систему не трогает.
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { ZoomablePhoto } from '@/features/gallery/components/zoomable-photo';
import { useProjectStore } from '@/store/projectStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPreviousPhoto, getProjectPhotos } from '@/utils/photos';

export default function PhotoViewerScreen() {
  const { id, photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const router = useRouter();

  const photos = useProjectStore((s) => s.photos);

  // Фото проекта, отсортированные от новых к старым (совпадает с сеткой).
  const projectPhotos = useMemo(() => getProjectPhotos(photos, id), [photos, id]);

  // Есть ли предыдущее фото для сравнения.
  const hasPrevious = getPreviousPhoto(photos, id, photoId) !== null;

  // Начальный индекс выбранного фото в ленте.
  const initialIndex = Math.max(
    projectPhotos.findIndex((p) => p.id === photoId),
    0,
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Фото',
          headerRight: () =>
            hasPrevious ? (
              <AppButton
                label="Сравнить"
                variant="ghost"
                onPress={() => router.push(`/project/${id}/compare/${photoId}`)}
              />
            ) : null,
        }}
      />

      <FlatList
        data={projectPhotos}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <ZoomablePhoto uri={item.uri} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
