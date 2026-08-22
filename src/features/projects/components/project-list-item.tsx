/**
 * Назначение: строка проекта в списке (карточка с действиями).
 *
 * Функции:
 * - показывает имя, дату обновления и количество фото;
 * - тап по карточке открывает проект (через prop onOpen);
 * - кнопки «Переименовать» и «Удалить» вызывают соответствующие действия.
 *
 * Слой: UI (/src/features/projects/components). Данные получает через пропсы,
 * действия выполняет вызывающий код через store.
 */

import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { spacing } from '@/theme';
import { formatDate } from '@/utils/dates';

interface ProjectListItemProps {
  /** Название проекта. */
  name: string;
  /** Количество фото в проекте. */
  photoCount: number;
  /** Метка времени последнего изменения (epoch ms). */
  updatedAt: number;
  /** Открыть проект. */
  onOpen: () => void;
  /** Начать переименование. */
  onRename: () => void;
  /** Удалить проект. */
  onDelete: () => void;
}

export function ProjectListItem({
  name,
  photoCount,
  updatedAt,
  onOpen,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  return (
    <AppCard style={styles.card}>
      <Pressable onPress={onOpen} accessibilityRole="button">
        <AppText variant="subtitle">{name}</AppText>
        <AppText color="textSecondary" variant="caption">
          {photoCount} фото · {formatDate(updatedAt)}
        </AppText>
      </Pressable>

      <View style={styles.actions}>
        <AppButton label="Переименовать" variant="secondary" onPress={onRename} />
        <AppButton label="Удалить" variant="danger" onPress={onDelete} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
