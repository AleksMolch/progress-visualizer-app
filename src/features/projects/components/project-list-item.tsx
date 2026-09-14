/**
 * Назначение: строка проекта в списке (карточка с действиями).
 *
 * Функции:
 * - показывает имя, дату обновления и количество фото;
 * - тап по карточке открывает проект (через prop onOpen);
 * - кнопки «Переименовать» и «Удалить» вызывают соответствующие действия;
 * - в оформлениях «Галерея» и «Liquid Glass» показывает cover-превью последнего
 *   фото (или нейтральную заглушку, если фото нет); «Минимализм» — текстовый вид.
 *
 * Слой: UI (/src/features/projects/components). Данные получает через пропсы,
 * действия выполняет вызывающий код через store.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/utils/dates';

interface ProjectListItemProps {
  /** Название проекта. */
  name: string;
  /** Количество фото в проекте. */
  photoCount: number;
  /** Метка времени последнего изменения (epoch ms). */
  updatedAt: number;
  /** URI последнего фото (обложка) или undefined, если фото нет. */
  coverUri?: string;
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
  coverUri,
  onOpen,
  onRename,
  onDelete,
}: ProjectListItemProps) {
  const { designTheme } = useAppTheme();

  // В минимализме сохраняем прежний компактный текстовый вид.
  if (designTheme === 'minimalism') {
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

  // Фото-карточка для «Галереи» и «Liquid Glass»: обложка + заголовок + метаданные.
  return (
    <PhotoCard
      name={name}
      photoCount={photoCount}
      updatedAt={updatedAt}
      coverUri={coverUri}
      onOpen={onOpen}
      onRename={onRename}
      onDelete={onDelete}
    />
  );
}

/**
 * Карточка с cover-превью: изображение наверху, текст и действия под ним.
 * Поверхность, радиус и цвета берутся из токенов текущего оформления.
 */
function PhotoCard({
  name,
  photoCount,
  updatedAt,
  coverUri,
  onOpen,
  onRename,
  onDelete,
}: Omit<ProjectListItemProps, 'coverUri'> & { coverUri?: string }) {
  const { colors, metrics } = useAppTheme();

  return (
    <View
      style={[
        styles.photoCard,
        { backgroundColor: colors.surface, borderRadius: metrics.cardRadius },
      ]}>
      <Pressable onPress={onOpen} accessibilityRole="button">
        {coverUri ? (
          <Image source={{ uri: coverUri }} style={styles.cover} contentFit="cover" />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: colors.surface }]}>
            <Ionicons name="images-outline" size={32} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.photoBody}>
          <AppText variant="subtitle">{name}</AppText>
          <AppText color="textSecondary" variant="caption">
            {photoCount} фото · {formatDate(updatedAt)}
          </AppText>
        </View>
      </Pressable>

      <View style={styles.actionsPadded}>
        <AppButton label="Переименовать" variant="secondary" onPress={onRename} />
        <AppButton label="Удалить" variant="danger" onPress={onDelete} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  photoCard: {
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: 160,
  },
  coverPlaceholder: {
    width: '100%',
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionsPadded: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
