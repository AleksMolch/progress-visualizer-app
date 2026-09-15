/**
 * Назначение: полноэкранный просмотр фотографий проекта с действиями.
 *
 * Функции:
 * - горизонтальная лента фото со свайпом и pinch-to-zoom (ZoomablePhoto);
 * - лист действий («…»): сравнить, заметка, избранное, скрытие, эталон, экспорт,
 *   удаление;
 * - Flow B: «Сравнить» открывает лист вариантов (с предыдущим/первым/последним/
 *   вручную), затем переход на compare screen;
 * - экспорт в галерею — по явному действию с предупреждением.
 *
 * Слой: UI (/src/app). Данные — useProjectStore, действия — через store,
 * экспорт — через storage-слой (mediaLibrary.ts).
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ActionSheet, type ActionSheetAction } from '@/features/gallery/components/action-sheet';
import { NoteEditorModal } from '@/features/gallery/components/note-editor-modal';
import { PhotoPickerSheet } from '@/features/gallery/components/photo-picker-sheet';
import { ZoomablePhoto } from '@/features/gallery/components/zoomable-photo';
import { exportPhotoToLibrary, requestMediaLibraryPermission } from '@/storage/mediaLibrary';
import { useProjectStore } from '@/store/projectStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getFirstVisiblePhoto, getLatestVisiblePhoto, getProjectPhotos } from '@/utils/photos';
import { triggerHaptic } from '@/utils/haptics';
import { useSettingsStore } from '@/store/settingsStore';

export default function PhotoViewerScreen() {
  const { id, photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const router = useRouter();

  const photos = useProjectStore((s) => s.photos);
  const updatePhoto = useProjectStore((s) => s.updatePhoto);
  const deletePhoto = useProjectStore((s) => s.deletePhoto);
  const setProjectReference = useProjectStore((s) => s.setProjectReference);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);

  // Фото проекта, отсортированные от новых к старым (совпадает с timeline).
  const projectPhotos = useMemo(() => getProjectPhotos(photos, id), [photos, id]);
  // Видимые фото (без скрытых) для действий сравнения.
  const visiblePhotos = useMemo(() => projectPhotos.filter((p) => !p.isHidden), [projectPhotos]);

  // id фото, которое сейчас видно (обновляется при свайпе ленты).
  const [currentPhotoId, setCurrentPhotoId] = useState(photoId);

  // Состояния листов/модалок.
  const [actionsVisible, setActionsVisible] = useState(false);
  const [compareVisible, setCompareVisible] = useState(false);
  const [manualPickerVisible, setManualPickerVisible] = useState(false);
  const [noteVisible, setNoteVisible] = useState(false);

  // Текущее фото по id.
  const currentPhoto = projectPhotos.find((p) => p.id === currentPhotoId);

  // Точки сравнения относительно текущего фото.
  const previousPhoto =
    currentPhoto
      ? visiblePhotos.find((p) => p.takenAt < currentPhoto.takenAt) ?? null
      : null;
  const firstPhoto = getFirstVisiblePhoto(photos, id);
  const lastPhoto = getLatestVisiblePhoto(photos, id);

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

  // Переход на compare с парой.
  const openCompare = (beforeId: string, afterId: string) => {
    setCompareVisible(false);
    setActionsVisible(false);
    router.push(`/project/${id}/compare?before=${beforeId}&after=${afterId}`);
  };

  // Flow B: «Выбрать вручную» → лист выбора, затем compare.
  const handleManualCompare = (pickedId: string) => {
    if (currentPhoto) {
      setManualPickerVisible(false);
      openCompare(pickedId, currentPhoto.id);
    }
  };

  // Экспорт в галерею.
  const handleExport = () => {
    if (!currentPhoto) {
      return;
    }
    setActionsVisible(false);
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

  // Удаление фото с подтверждением.
  const handleDelete = () => {
    if (!currentPhoto) {
      return;
    }
    setActionsVisible(false);
    Alert.alert('Удалить фото?', 'Фотография будет удалена без возможности восстановления.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          deletePhoto(currentPhoto.id);
          router.back();
        },
      },
    ]);
  };

  if (!currentPhoto) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Фото' }} />
      </View>
    );
  }

  const canCompare = visiblePhotos.length >= 2;

  // Действия основного листа.
  const actions: ActionSheetAction[] = [
    {
      key: 'compare',
      label: 'Сравнить',
      icon: 'git-compare-outline',
      disabled: !canCompare,
      onPress: () => {
        setActionsVisible(false);
        setCompareVisible(true);
      },
    },
    {
      key: 'note',
      label: currentPhoto.note ? 'Редактировать заметку' : 'Добавить заметку',
      icon: 'create-outline',
      onPress: () => {
        setActionsVisible(false);
        setNoteVisible(true);
      },
    },
    {
      key: 'favorite',
      label: currentPhoto.isFavorite ? 'Убрать из избранного' : 'В избранное',
      icon: currentPhoto.isFavorite ? 'star' : 'star-outline',
      onPress: () => {
        setActionsVisible(false);
        updatePhoto(currentPhoto.id, { isFavorite: !currentPhoto.isFavorite });
        void triggerHaptic('selection', hapticsEnabled);
      },
    },
    {
      key: 'hide',
      label: currentPhoto.isHidden ? 'Показать снова' : 'Скрыть снимок',
      icon: currentPhoto.isHidden ? 'eye-outline' : 'eye-off-outline',
      onPress: () => {
        setActionsVisible(false);
        updatePhoto(currentPhoto.id, { isHidden: !currentPhoto.isHidden });
      },
    },
    {
      key: 'reference',
      label: 'Сделать эталоном',
      icon: 'aperture-outline',
      onPress: () => {
        setActionsVisible(false);
        setProjectReference(id, 'manual', currentPhoto.id);
        void triggerHaptic('success', hapticsEnabled);
      },
    },
    {
      key: 'export',
      label: 'Экспорт в галерею',
      icon: 'download-outline',
      onPress: handleExport,
    },
    {
      key: 'delete',
      label: 'Удалить',
      icon: 'trash-outline',
      destructive: true,
      onPress: handleDelete,
    },
  ];

  // Варианты сравнения (Flow B).
  const compareActions: ActionSheetAction[] = [
    {
      key: 'previous',
      label: 'С предыдущим',
      disabled: !previousPhoto,
      onPress: () => previousPhoto && openCompare(previousPhoto.id, currentPhoto.id),
    },
    {
      key: 'first',
      label: 'С первым',
      disabled: !firstPhoto || firstPhoto.id === currentPhoto.id,
      onPress: () => firstPhoto && openCompare(firstPhoto.id, currentPhoto.id),
    },
    {
      key: 'last',
      label: 'С последним',
      disabled: !lastPhoto || lastPhoto.id === currentPhoto.id,
      onPress: () => lastPhoto && openCompare(currentPhoto.id, lastPhoto.id),
    },
    {
      key: 'manual',
      label: 'Выбрать вручную',
      icon: 'images-outline',
      onPress: () => {
        setCompareVisible(false);
        setManualPickerVisible(true);
      },
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Фото',
          headerRight: () => (
            <Pressable
              onPress={() => setActionsVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Действия с фото"
              hitSlop={8}
              style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color={colors.primary} />
            </Pressable>
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

      <ActionSheet
        visible={actionsVisible}
        title="Действия"
        actions={actions}
        onClose={() => setActionsVisible(false)}
      />

      <ActionSheet
        visible={compareVisible}
        title="Сравнить с"
        actions={compareActions}
        onClose={() => setCompareVisible(false)}
      />

      <PhotoPickerSheet
        visible={manualPickerVisible}
        title="Выберите фото для сравнения"
        photos={visiblePhotos}
        selectedId={currentPhoto.id}
        referenceId={undefined}
        onSelect={handleManualCompare}
        onClose={() => setManualPickerVisible(false)}
      />

      <NoteEditorModal
        visible={noteVisible}
        initialNote={currentPhoto.note ?? ''}
        onSave={(note) => {
          setNoteVisible(false);
          updatePhoto(currentPhoto.id, { note: note.length > 0 ? note : undefined });
        }}
        onClose={() => setNoteVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  moreButton: {
    paddingHorizontal: 4,
  },
});
