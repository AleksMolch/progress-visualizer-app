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
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
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
      t('viewer.exportTitle'),
      t('viewer.exportMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('viewer.exportAction'), onPress: () => void exportCurrent(currentPhoto.uri) },
      ],
    );
  };

  async function exportCurrent(uri: string): Promise<void> {
    const granted = await requestMediaLibraryPermission();
    if (!granted) {
      Alert.alert(t('viewer.noGalleryAccess'), t('viewer.galleryPermissionHint'));
      return;
    }
    const ok = await exportPhotoToLibrary(uri);
    if (ok) {
      Alert.alert(t('viewer.exportDone'), t('viewer.exportSaved'));
    } else {
      Alert.alert(t('viewer.exportError'), t('viewer.exportFailed'));
    }
  }

  // Удаление фото с подтверждением.
  const handleDelete = () => {
    if (!currentPhoto) {
      return;
    }
    setActionsVisible(false);
    Alert.alert(t('project.deletePhotoTitle'), t('project.deletePhotoMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
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
        <Stack.Screen options={{ title: t('nav.photo') }} />
      </View>
    );
  }

  const canCompare = visiblePhotos.length >= 2;

  // Действия основного листа.
  const actions: ActionSheetAction[] = [
    {
      key: 'compare',
      label: t('viewer.compare'),
      icon: 'git-compare-outline',
      disabled: !canCompare,
      onPress: () => {
        setActionsVisible(false);
        setCompareVisible(true);
      },
    },
    {
      key: 'note',
      label: currentPhoto.note ? t('viewer.editNote') : t('viewer.addNote'),
      icon: 'create-outline',
      onPress: () => {
        setActionsVisible(false);
        setNoteVisible(true);
      },
    },
    {
      key: 'favorite',
      label: currentPhoto.isFavorite ? t('viewer.unfavorite') : t('viewer.favorite'),
      icon: currentPhoto.isFavorite ? 'star' : 'star-outline',
      onPress: () => {
        setActionsVisible(false);
        updatePhoto(currentPhoto.id, { isFavorite: !currentPhoto.isFavorite });
        void triggerHaptic('selection', hapticsEnabled);
      },
    },
    {
      key: 'hide',
      label: currentPhoto.isHidden ? t('viewer.unhide') : t('viewer.hide'),
      icon: currentPhoto.isHidden ? 'eye-outline' : 'eye-off-outline',
      onPress: () => {
        setActionsVisible(false);
        updatePhoto(currentPhoto.id, { isHidden: !currentPhoto.isHidden });
      },
    },
    {
      key: 'reference',
      label: t('viewer.makeReference'),
      icon: 'aperture-outline',
      onPress: () => {
        setActionsVisible(false);
        setProjectReference(id, 'manual', currentPhoto.id);
        void triggerHaptic('success', hapticsEnabled);
      },
    },
    {
      key: 'export',
      label: t('viewer.export'),
      icon: 'download-outline',
      onPress: handleExport,
    },
    {
      key: 'delete',
      label: t('common.delete'),
      icon: 'trash-outline',
      destructive: true,
      onPress: handleDelete,
    },
  ];

  // Варианты сравнения (Flow B).
  const compareActions: ActionSheetAction[] = [
    {
      key: 'previous',
      label: t('viewer.withPrevious'),
      disabled: !previousPhoto,
      onPress: () => previousPhoto && openCompare(previousPhoto.id, currentPhoto.id),
    },
    {
      key: 'first',
      label: t('viewer.withFirst'),
      disabled: !firstPhoto || firstPhoto.id === currentPhoto.id,
      onPress: () => firstPhoto && openCompare(firstPhoto.id, currentPhoto.id),
    },
    {
      key: 'last',
      label: t('viewer.withLast'),
      disabled: !lastPhoto || lastPhoto.id === currentPhoto.id,
      onPress: () => lastPhoto && openCompare(currentPhoto.id, lastPhoto.id),
    },
    {
      key: 'manual',
      label: t('viewer.pickCompare'),
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
          title: t('nav.photo'),
          headerRight: () => (
            <Pressable
              onPress={() => setActionsVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={t('viewer.actions')}
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
        title={t('viewer.actions')}
        actions={actions}
        onClose={() => setActionsVisible(false)}
      />

      <ActionSheet
        visible={compareVisible}
        title={t('viewer.compareWith')}
        actions={compareActions}
        onClose={() => setCompareVisible(false)}
      />

      <PhotoPickerSheet
        visible={manualPickerVisible}
        title={t('viewer.pickCompare')}
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
