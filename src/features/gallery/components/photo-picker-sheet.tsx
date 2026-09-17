/**
 * Назначение: нижний лист выбора фото (миниатюры проекта).
 *
 * Функции:
 * - показывает список миниатюр фото проекта с датой, заметкой и бейджами
 *   (эталон/избранное/скрытое);
 * - подсвечивает выбранное фото;
 * - используется для ручного выбора эталона (камера) и выбора пары «До/После»
 *   (compare screen).
 *
 * Слой: UI (/src/features/gallery/components). Данные получает через пропсы,
 * выбор возвращает вызывающему коду через onSelect.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { type PhotoMetadata } from '@/models/photo';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/utils/dates';

interface PhotoPickerSheetProps {
  /** Виден ли лист. */
  visible: boolean;
  /** Заголовок листа. */
  title: string;
  /** Фото проекта (в хронологическом порядке, новые сверху или снизу — на усмотрение). */
  photos: PhotoMetadata[];
  /** Id выбранного фото (подсветка) или null. */
  selectedId?: string | null;
  /** Id эталонного фото (бейдж «Эталон») или null. */
  referenceId?: string | null;
  /** Выбор фото. */
  onSelect: (photoId: string) => void;
  /** Закрытие листа. */
  onClose: () => void;
}

export function PhotoPickerSheet({
  visible,
  title,
  photos,
  selectedId = null,
  referenceId = null,
  onSelect,
  onClose,
}: PhotoPickerSheetProps) {
  const { colors } = useAppTheme();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Внутренний Pressable гасит тап, чтобы клик по листу не закрывал его. */}
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}>
          <View style={styles.handle} />
          <AppText variant="subtitle">{title}</AppText>

          {photos.length === 0 ? (
            <AppText color="textSecondary" style={styles.empty}>
              {t('camera.noAvailablePhotos')}
            </AppText>
          ) : (
            <ScrollView contentContainerStyle={styles.list}>
              {photos.map((photo) => {
                const selected = photo.id === selectedId;
                const isReference = photo.id === referenceId;
                return (
                  <Pressable
                    key={photo.id}
                    onPress={() => onSelect(photo.id)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[
                      styles.row,
                      { borderColor: selected ? colors.primary : colors.border },
                    ]}>
                    <Image
                      source={{ uri: photo.uri }}
                      style={styles.thumb}
                      contentFit="cover"
                    />
                    <View style={styles.rowBody}>
                      <AppText variant="body">{formatDate(photo.takenAt, locale)}</AppText>
                      {photo.note ? (
                        <AppText color="textSecondary" variant="caption" numberOfLines={1}>
                          {photo.note}
                        </AppText>
                      ) : null}
                      <View style={styles.badges}>
                        {isReference ? <Badge label={t('project.reference')} /> : null}
                        {photo.isFavorite ? (
                          <Ionicons name="star" size={14} color={colors.primary} />
                        ) : null}
                        {photo.isHidden ? (
                          <Ionicons name="eye-off" size={14} color={colors.textSecondary} />
                        ) : null}
                      </View>
                    </View>
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? colors.primary : colors.border}
                    />
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Небольшой бейдж «Эталон» в левой части строки. */
function Badge({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.primary }]}>
      <AppText variant="caption" color="primaryText">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '75%',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
  },
  rowBody: {
    flex: 1,
    gap: spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
});
