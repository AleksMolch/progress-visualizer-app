/**
 * Назначение: экран сравнения двух фото «до/после» (интерактивный, без экспорта).
 *
 * Функции:
 * - принимает пару через query-параметры (?before=&after=) и валидирует её;
 * - три режима: «Слайдер», «Рядом», «Наложение» (segmented control внизу);
 * - Flow C: кнопки «До»/«После» открывают лист выбора и меняют пару;
 * - пара упорядочивается по дате съёмки (более раннее = «До»).
 *
 * Слой: UI (/src/app). Данные — useProjectStore, навигация — expo-router.
 * Сравнение НЕ сохраняется в файл и НЕ меняет исходные фото.
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { CompareOverlay } from '@/features/gallery/components/compare-overlay';
import { CompareSideBySide } from '@/features/gallery/components/compare-side-by-side';
import { CompareSlider } from '@/features/gallery/components/compare-slider';
import { PhotoPickerSheet } from '@/features/gallery/components/photo-picker-sheet';
import { type MessageKey } from '@/i18n';
import { useI18n } from '@/i18n';
import { useProjectStore } from '@/store/projectStore';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/utils/dates';
import { validateComparePair } from '@/utils/progress';
import { getVisiblePhotos } from '@/utils/photos';

// Режимы сравнения.
type CompareMode = 'slider' | 'side-by-side' | 'overlay';

// Подписи режимов segmented control (по ключам).
const MODES: { value: CompareMode; key: MessageKey }[] = [
  { value: 'slider', key: 'compare.slider' },
  { value: 'side-by-side', key: 'compare.sideBySide' },
  { value: 'overlay', key: 'compare.overlay' },
];

export default function CompareScreen() {
  const { id, before, after } = useLocalSearchParams<{
    id: string;
    before?: string;
    after?: string;
  }>();
  const { colors } = useAppTheme();
  const { t, locale } = useI18n();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));
  const photos = useProjectStore((s) => s.photos);

  // Текущая пара (локальное состояние; Flow C меняет её без смены маршрута).
  const [beforeId, setBeforeId] = useState(before ?? '');
  const [afterId, setAfterId] = useState(after ?? '');

  const [mode, setMode] = useState<CompareMode>('slider');

  // Какую сторону меняет лист выбора (Flow C): null — лист закрыт.
  const [pickerTarget, setPickerTarget] = useState<'before' | 'after' | null>(null);

  // Валидация и упорядочивание пары (более раннее = «До»).
  const { before: beforePhoto, after: afterPhoto, error } = validateComparePair(
    project,
    photos,
    beforeId,
    afterId,
  );

  // Видимые фото проекта для листа выбора (хронологически).
  const visiblePhotos = project
    ? getVisiblePhotos(photos, project.id).sort((a, b) => a.takenAt - b.takenAt)
    : [];

  // Обработчик выбора фото для стороны «До»/«После».
  const handlePick = (photoId: string) => {
    if (!pickerTarget) {
      return;
    }
    const otherId = pickerTarget === 'before' ? afterId : beforeId;
    if (photoId === otherId) {
      Alert.alert(t('compare.samePhotoTitle'), t('compare.samePhotoMessage'));
      return;
    }
    if (pickerTarget === 'before') {
      setBeforeId(photoId);
    } else {
      setAfterId(photoId);
    }
    setPickerTarget(null);
  };

  // Безопасное состояние: пара не собрана.
  if (error) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: t('compare.title') }} />
        <AppText variant="title">{t('compare.noPairTitle')}</AppText>
        <AppText color="textSecondary" style={styles.emptyText}>
          {error === 'same-photo' ? t('compare.samePhoto') : t('compare.missing')}
        </AppText>
        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <AppText color="primary">{t('common.back')}</AppText>
        </Pressable>
      </View>
    );
  }

  // Гарантия не-null: validateComparePair возвращает оба фото при error === null.
  if (!beforePhoto || !afterPhoto) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('compare.title') }} />

      {/* Область сравнения. */}
      <View style={styles.stage}>
        {mode === 'slider' ? (
          <CompareSlider beforeUri={beforePhoto.uri} afterUri={afterPhoto.uri} />
        ) : mode === 'side-by-side' ? (
          <CompareSideBySide
            beforeUri={beforePhoto.uri}
            afterUri={afterPhoto.uri}
            beforeLabel={formatDate(beforePhoto.takenAt, locale)}
            afterLabel={formatDate(afterPhoto.takenAt, locale)}
          />
        ) : (
          <CompareOverlay beforeUri={beforePhoto.uri} afterUri={afterPhoto.uri} />
        )}
      </View>

      {/* Кнопки смены пары (Flow C). */}
      <View style={styles.pairBar}>
        <Pressable
          onPress={() => setPickerTarget('before')}
          accessibilityRole="button"
          style={[styles.pairButton, { backgroundColor: colors.surface }]}>
          <AppText variant="caption" color="textSecondary">
            {t('compare.before')}
          </AppText>
          <AppText variant="caption">{formatDate(beforePhoto.takenAt, locale)}</AppText>
        </Pressable>
        <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
        <Pressable
          onPress={() => setPickerTarget('after')}
          accessibilityRole="button"
          style={[styles.pairButton, { backgroundColor: colors.surface }]}>
          <AppText variant="caption" color="textSecondary">
            {t('compare.after')}
          </AppText>
          <AppText variant="caption">{formatDate(afterPhoto.takenAt, locale)}</AppText>
        </Pressable>
      </View>

      {/* Segmented control режимов — компактная плавающая капсула. */}
      <View style={[styles.modeBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={[styles.modeCapsule, { backgroundColor: colors.surface }]}>
          {MODES.map((m) => {
            const selected = mode === m.value;
            return (
              <Pressable
                key={m.value}
                onPress={() => setMode(m.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.modeChip,
                  { backgroundColor: selected ? colors.primary : 'transparent' },
                ]}>
                <AppText variant="caption" color={selected ? 'primaryText' : 'text'}>
                  {t(m.key)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <PhotoPickerSheet
        visible={pickerTarget !== null}
        title={pickerTarget === 'before' ? t('compare.pickBefore') : t('compare.pickAfter')}
        photos={visiblePhotos}
        selectedId={pickerTarget === 'before' ? beforeId : afterId}
        referenceId={project?.referencePhotoId ?? null}
        onSelect={handlePick}
        onClose={() => setPickerTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stage: {
    flex: 1,
  },
  pairBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pairButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  modeBar: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  modeCapsule: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.18)',
    boxShadow: [{ offsetX: 0, offsetY: 6, color: 'rgba(0,0,0,0.18)', blurRadius: 16 }],
  },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
  },
  backLink: {
    marginTop: spacing.sm,
  },
});
