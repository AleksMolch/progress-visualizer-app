/**
 * Назначение: полноэкранный просмотр фотографий проекта.
 *
 * Функции:
 * - показывает фото проекта горизонтальной лентой со свайпом между ними;
 * - каждое фото можно увеличивать pinch-жестом (ZoomablePhoto);
 * - кнопка «Сравнить» открывает сравнение текущего фото с предыдущим;
 * - кнопка «Экспорт» сохраняет текущее фото в галерею (по явному действию,
 *   с предупреждением, что фото окажется вне sandbox приложения).
 *
 * Слой: UI (/src/app). Навигация — expo-router, данные — useProjectStore,
 * экспорт — через storage-слой (mediaLibrary.ts). Файловую систему не трогает.
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { ZoomablePhoto } from '@/features/gallery/components/zoomable-photo';
import { exportPhotoToLibrary, requestMediaLibraryPermission } from '@/storage/mediaLibrary';
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

  // id фото, которое сейчас видно (обновляется при свайпе ленты).
  const [currentPhotoId, setCurrentPhotoId] = useState(photoId);

  // Текущее фото по id (для экспорта и сравнения).
  const currentPhoto = projectPhotos.find((p) => p.id === currentPhotoId);

  // Есть ли предыдущее фото для сравнения у текущего фото.
  const hasPrevious = currentPhoto ? getPreviousPhoto(photos, id, currentPhoto.id) !== null : false;

  // Начальный индекс выбранного фото в ленте.
  const initialIndex = Math.max(
    projectPhotos.findIndex((p) => p.id === photoId),
    0,
  );

  // После завершения свайпа обновляем id текущего фото по смещению ленты.
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    const photo = projectPhotos[index];
    if (photo) {
      setCurrentPhotoId(photo.id);
    }
  };

  // Экспорт в галерею: сначала предупреждение, потом разрешение и сохранение.
  const handleExport = () => {
    if (!currentPhoto) {
      return;
    }
    Alert.alert(
      'Экспортировать в галерею?',
      'Фотография будет скопирована в общую галерею устройства и окажется вне защищённого хранилища приложения.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Экспортировать', onPress: () => void exportCurrent(currentPhoto.uri) },
      ],
    );
  };

  async function exportCurrent(uri: string): Promise<void> {
    const granted = await requestMediaLibraryPermission();
    if (!granted) {
      Alert.alert('Нет доступа к галерее', 'Разрешите сохранение фото в настройках устройства.');
      return;
    }

    const ok = await exportPhotoToLibrary(uri);
    if (ok) {
      Alert.alert('Готово', 'Фотография сохранена в галерею.');
    } else {
      Alert.alert('Ошибка', 'Не удалось экспортировать фотографию.');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Фото',
          headerRight: () => (
            <View style={styles.headerActions}>
              <AppButton label="Экспорт" variant="ghost" onPress={handleExport} />
              {hasPrevious ? (
                <AppButton
                  label="Сравнить"
                  variant="ghost"
                  onPress={() => router.push(`/project/${id}/compare/${currentPhotoId}`)}
                />
              ) : null}
            </View>
          ),
        }}
      />

      <FlatList
        data={projectPhotos}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        onMomentumScrollEnd={handleMomentumScrollEnd}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
