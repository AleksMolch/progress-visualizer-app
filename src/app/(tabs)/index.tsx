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

import { AppButton } from '@/components/ui/app-button';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { ProjectFormModal } from '@/features/projects/components/project-form-modal';
import { ProjectListItem } from '@/features/projects/components/project-list-item';
import { useProjectStore } from '@/store/projectStore';
import { spacing } from '@/theme';

export default function ProjectsScreen() {
  const projects = useProjectStore((s) => s.projects);
  const photos = useProjectStore((s) => s.photos);
  const createProject = useProjectStore((s) => s.createProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

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
      'Удалить проект?',
      `«${project.name}» и все его фотографии будут удалены без возможности восстановления.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => deleteProject(id) },
      ],
    );
  };

  return (
    <AppScreen>
      {projects.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title">Пока нет проектов</AppText>
          <AppText color="textSecondary" style={styles.emptyText}>
            Создайте проект, чтобы начать отслеживать прогресс по фотографиям.
          </AppText>
          <AppButton label="Создать проект" onPress={openCreateModal} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.header}>
              <AppText variant="title">Проекты</AppText>
              <AppButton label="Создать" onPress={openCreateModal} />
            </View>
          }
          renderItem={({ item }) => (
            <ProjectListItem
              name={item.name}
              photoCount={photoCount(item.id)}
              updatedAt={item.updatedAt}
              onOpen={() => router.push(`/project/${item.id}`)}
              onRename={() => openEditModal(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      {modalVisible ? (
        <ProjectFormModal
          initialName={editingProject?.name ?? ''}
          title={editingProject ? 'Переименовать проект' : 'Новый проект'}
          onSave={handleSave}
          onCancel={() => setModalVisible(false)}
        />
      ) : null}
    </AppScreen>
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
