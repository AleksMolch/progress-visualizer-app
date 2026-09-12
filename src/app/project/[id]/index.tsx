/**
 * Назначение: экран отдельного проекта — лента фотографий прогресса.
 *
 * Функции:
 * - читает id проекта из параметров маршрута;
 * - показывает название проекта и сетку фотографий;
 * - показывает empty state, если фото ещё нет;
 * - удаляет фото с подтверждением (Alert) — удаляет и файл, и метаданные;
 * - показывает empty state «проект не найден», если id некорректен.
 *
 * Слой: UI (/src/app). Фото отображаются через expo-image; файловую систему
 * не трогает напрямую — удаление идёт через useProjectStore.deletePhoto.
 */

import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { useProjectStore } from '@/store/projectStore';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));
  const photos = useProjectStore((s) => s.photos);
  const deletePhoto = useProjectStore((s) => s.deletePhoto);

  // Фото текущего проекта, отсортированные по времени съёмки (свежие сверху).
  const projectPhotos = photos
    .filter((p) => p.projectId === id)
    .sort((a, b) => b.takenAt - a.takenAt);

  // Удаление фото с подтверждением.
  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Удалить фото?', 'Фотография будет удалена без возможности восстановления.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => deletePhoto(photoId) },
    ]);
  };

  // Проект не найден (например, после удаления или неверная ссылка).
  if (!project) {
    return (
      <AppScreen>
        <View style={styles.empty}>
          <AppText variant="title">Проект не найден</AppText>
          <AppText color="textSecondary">Возможно, он был удалён.</AppText>
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <Stack.Screen
        options={{
          title: project.name,
          headerRight: () =>
            projectPhotos.length >= 2 ? (
              <AppButton
                label="Timelapse"
                variant="ghost"
                onPress={() => router.push(`/project/${id}/timelapse`)}
              />
            ) : null,
        }}
      />

      {projectPhotos.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title">Пока нет фотографий</AppText>
          <AppText color="textSecondary" style={styles.emptyText}>
            Сделайте первый снимок на вкладке «Камера».
          </AppText>
        </View>
      ) : (
        <FlatList
          data={projectPhotos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <PhotoTile
              uri={item.uri}
              onOpen={() => router.push(`/project/${id}/viewer/${item.id}`)}
              onDelete={() => handleDeletePhoto(item.id)}
            />
          )}
        />
      )}
    </AppScreen>
  );
}

/**
 * Плитка одного фото: тап открывает viewer, крестик удаляет фото.
 */
function PhotoTile({
  uri,
  onOpen,
  onDelete,
}: {
  uri: string;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.tile}>
      <Pressable
        onPress={onOpen}
        accessibilityRole="imagebutton"
        accessibilityLabel="Открыть фото"
        style={styles.photoButton}>
        <Image source={{ uri }} style={styles.photo} contentFit="cover" />
      </Pressable>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel="Удалить фото"
        style={[styles.deleteButton, { backgroundColor: colors.danger }]}>
        <AppText color="primaryText" variant="caption">
          ✕
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    margin: spacing.xs,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  photoButton: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
  },
});
