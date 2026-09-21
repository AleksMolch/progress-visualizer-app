/**
 * Назначение: экран «Проекты» — список проектов с CRUD-действиями.
 *
 * Функции:
 * - показывает список проектов или empty state;
 * - создаёт проект через модальное окно;
 * - переименовывает проект через модальное окно;
 * - удаляет проект с подтверждением (Alert);
 * - открывает экран проекта по тапу на карточку.
 *
 * Слой: UI (/src/app). Данные и действия — через useProjectStore,
 * навигация — через expo-router. Файловую систему не трогает напрямую.
 */

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AdPlaceholder } from '@/features/ads/components/ad-placeholder';
import { ProjectFormModal } from '@/features/projects/components/project-form-modal';
import { ProjectListItem } from '@/features/projects/components/project-list-item';
import { MainTabSwipeGesture } from '@/features/navigation/components/main-tab-swipe-gesture';
import { useI18n } from '@/i18n';
import { useProjectStore } from '@/store/projectStore';
import { spacing } from '@/theme';
import { getBottomInset } from '@/theme/tab-bar';
import { getLatestVisiblePhoto } from '@/utils/photos';

export default function ProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const projects = useProjectStore((s) => s.projects);
  const photos = useProjectStore((s) => s.photos);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  // Единый нижний отступ: safe area + меню + выступ кнопки + буфер.
  const bottomInset = getBottomInset(insets.bottom);

  // Состояние модального окна: открыто ли, и какой проект редактируется (null — создание).
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Имя проекта, который сейчас редактируется (для заголовка и начального значения).
  const editingProject = projects.find((p) => p.id === editingId) ?? null;

  // Количество фото для проекта (для подписи в списке).
  const photoCount = (projectId: string) =>
    photos.filter((p) => p.projectId === projectId).length;

  const openCreateModal = () => {
    setEditingId(null);
    setModalVisible(true);
  };

  const openEditModal = (id: string) => {
    setEditingId(id);
    setModalVisible(true);
  };

  // Сохранение из модалки: создание или переименование.
  const handleSave = (name: string) => {
    if (editingId) {
      updateProject(editingId, name);
    } else {
      createProject(name);
    }
    setModalVisible(false);
  };

  // Удаление проекта с подтверждением.
  const handleDelete = (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return;
    }
    Alert.alert(
      t('projects.deleteTitle'),
      t('projects.deleteMessage', { name: project.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => deleteProject(id) },
      ],
    );
  };

  return (
    <MainTabSwipeGesture tabIndex={0}>
      <AppScreen>
      {projects.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title">{t('projects.emptyTitle')}</AppText>
          <AppText color="textSecondary" style={styles.emptyText}>
            {t('projects.emptyDescription')}
          </AppText>
          <AppButton label={t('projects.emptyButton')} onPress={openCreateModal} />
          {/* Рекламный placeholder — ниже CTA, не над основной кнопкой. */}
          <AdPlaceholder style={styles.emptyAd} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomInset }]}
          ListHeaderComponent={
            <View style={styles.header}>
              <AppText variant="title">{t('projects.header')}</AppText>
              <AppButton label={t('projects.create')} onPress={openCreateModal} />
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.itemWrap}>
              <ProjectListItem
                name={item.name}
                photoCount={photoCount(item.id)}
                updatedAt={item.updatedAt}
                coverUri={getLatestVisiblePhoto(photos, item.id)?.uri}
                onOpen={() => router.push(`/project/${item.id}`)}
                onRename={() => openEditModal(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
              {/* Inline placeholder после первой карточки проекта. */}
              {index === 0 ? <AdPlaceholder /> : null}
            </View>
          )}
        />
      )}

      {modalVisible ? (
        <ProjectFormModal
          initialName={editingProject?.name ?? ''}
          title={editingProject ? t('projects.renameProject') : t('projects.newProject')}
          onSave={handleSave}
          onCancel={() => setModalVisible(false)}
        />
      ) : null}
      </AppScreen>
    </MainTabSwipeGesture>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  itemWrap: {
    gap: spacing.md,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  emptyAd: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
});
