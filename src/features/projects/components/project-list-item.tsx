/**
 * Назначение: строка проекта в списке (карточка с контекстным меню).
 *
 * Функции:
 * - показывает имя, дату обновления и количество фото;
 * - тап по карточке открывает проект (через prop onOpen);
 * - вторичные действия («Переименовать», «Удалить») спрятаны в кнопку `...`
 *   и action sheet, чтобы не создавать визуальный шум;
 * - в «Простом» оформлении — компактный текстовый вид, иначе — cover-превью.
 *
 * Слой: UI (/src/features/projects/components). Данные получает через пропсы,
 * действия выполняет вызывающий код через store.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/app-card';
import { AppText } from '@/components/ui/app-text';
import { AdaptiveSurface } from '@/components/ui/adaptive-surface';
import { ActionSheet, type ActionSheetAction } from '@/features/gallery/components/action-sheet';
import { useI18n } from '@/i18n';
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
  /** Удалить проект (с подтверждением у вызывающего кода). */
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
  const { t, locale } = useI18n();

  // Видимость action sheet с вторичными действиями.
  const [sheetVisible, setSheetVisible] = useState(false);

  const actions: ActionSheetAction[] = [
    {
      key: 'rename',
      label: t('projects.rename'),
      icon: 'create-outline',
      onPress: () => {
        setSheetVisible(false);
        onRename();
      },
    },
    {
      key: 'delete',
      label: t('common.delete'),
      icon: 'trash-outline',
      destructive: true,
      onPress: () => {
        setSheetVisible(false);
        onDelete();
      },
    },
  ];

  const openSheet = () => setSheetVisible(true);

  return (
    <>
      {designTheme === 'simple' ? (
        <AppCard style={styles.card}>
          <View style={styles.simpleRow}>
            <Pressable onPress={onOpen} accessibilityRole="button" style={styles.simpleText}>
              <AppText variant="subtitle">{name}</AppText>
              <AppText color="textSecondary" variant="caption">
                {t('projects.photoCount', { count: photoCount })} · {formatDate(updatedAt, locale)}
              </AppText>
            </Pressable>
            <MoreButton onPress={openSheet} />
          </View>
        </AppCard>
      ) : (
        <PhotoCard
          name={name}
          photoCount={photoCount}
          updatedAt={updatedAt}
          coverUri={coverUri}
          onOpen={onOpen}
          onMore={openSheet}
        />
      )}

      <ActionSheet
        visible={sheetVisible}
        title={name}
        actions={actions}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
}

/**
 * Карточка с cover-превью: изображение и текст открывают проект, `...` — действия.
 */
function PhotoCard({
  name,
  photoCount,
  updatedAt,
  coverUri,
  onOpen,
  onMore,
}: {
  name: string;
  photoCount: number;
  updatedAt: number;
  coverUri?: string;
  onOpen: () => void;
  onMore: () => void;
}) {
  const { colors, metrics, material } = useAppTheme();
  const { t, locale } = useI18n();

  // Для «Современного» используем НЕпрозрачную поверхность + рамку, чтобы карточка
  // чётко отличалась от фона страницы. Neumorphism сохраняет свой мягкий материал.
  const isNeumorphic = material.card === 'neumorphic';
  const surfaceMaterial = isNeumorphic ? 'neumorphic' : 'solid';

  return (
    <AdaptiveSurface
      material={surfaceMaterial}
      backgroundColor={colors.surface}
      borderRadius={metrics.cardRadius}
      style={[styles.photoCard, !isNeumorphic && { borderWidth: 1, borderColor: colors.border }]}>
      <Pressable onPress={onOpen} accessibilityRole="button">
        {/* key перемонтирует обложку при смене URI, сбрасывая состояние ошибки. */}
        <ProjectCover key={coverUri} uri={coverUri} />
      </Pressable>

      <View style={styles.photoBody}>
        <Pressable onPress={onOpen} accessibilityRole="button" style={styles.photoBodyText}>
          <AppText variant="subtitle">{name}</AppText>
          <AppText color="textSecondary" variant="caption">
            {t('projects.photoCount', { count: photoCount })} · {formatDate(updatedAt, locale)}
          </AppText>
        </Pressable>
        <MoreButton onPress={onMore} />
      </View>
    </AdaptiveSurface>
  );
}

/**
 * Компактная кнопка `...` с touch target не меньше 44×44.
 */
function MoreButton({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('common.moreActions')}
      hitSlop={8}
      style={({ pressed }) => [styles.moreButton, pressed && styles.moreButtonPressed]}>
      <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

/**
 * Обложка проекта: фото или мягкая нейтральная заглушка.
 * При ошибке загрузки URI показывает заглушку вместо «чёрного» блока.
 */
function ProjectCover({ uri }: { uri?: string }) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[styles.coverPlaceholder, { backgroundColor: colors.surface }]}>
        <Ionicons name="images-outline" size={36} color="rgba(32,138,239,0.45)" />
        <AppText variant="caption" color="textSecondary">
          {t('projects.noPhotos')}
        </AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={styles.cover}
      contentFit="cover"
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  simpleText: {
    flex: 1,
    gap: spacing.xs,
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
    gap: spacing.xs,
  },
  photoBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  photoBodyText: {
    flex: 1,
    gap: spacing.xs,
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonPressed: {
    opacity: 0.6,
  },
});
