/**
 * Назначение: экран отдельного проекта — история прогресса (не просто сетка).
 *
 * Функции:
 * - верхний summary-блок (название, число фото, период, источник эталона);
 * - блок «Первое / Последнее» (сравнение первой и последней точки);
 * - блок «Быстрое сравнение» (Flow A): выбор двух снимков кружками 1/2;
 * - timeline фото с группировкой по месяцам и бейджами (эталон/избранное/скрытое);
 * - FAB «+» для нового снимка в текущем проекте;
 * - отдельные empty states: нет фото / все снимки скрыты / проект не найден.
 *
 * Слой: UI (/src/app). Фото отображаются через expo-image; файловую систему
 * не трогает напрямую — удаление идёт через useProjectStore.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppCard } from '@/components/ui/app-card';
import { AppScreen } from '@/components/ui/app-screen';
import { AppText } from '@/components/ui/app-text';
import { AdPlaceholder } from '@/features/ads/components/ad-placeholder';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { formatDate } from '@/utils/dates';
import { advanceQuickCompare, getDaysBetweenPhotos, groupPhotosByMonth } from '@/utils/progress';
import { getFirstVisiblePhoto, getLatestVisiblePhoto, getProjectPhotos } from '@/utils/photos';
import { getReferenceMode, resolveReferencePhoto } from '@/utils/reference';
import { triggerHaptic } from '@/utils/haptics';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t, locale } = useI18n();

  const project = useProjectStore((s) => s.projects.find((p) => p.id === id));
  const photos = useProjectStore((s) => s.photos);
  const deletePhoto = useProjectStore((s) => s.deletePhoto);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);

  // Режим быстрого сравнения (Flow A) и порядок выбранных снимков (1 = До, 2 = После).
  const [selectionMode, setSelectionMode] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);

  // Показывать ли скрытые фото (по умолчанию — нет).
  const [showHidden, setShowHidden] = useState(false);

  // Все фото проекта, свежие сверху.
  const projectPhotos = useMemo(() => getProjectPhotos(photos, id), [photos, id]);

  // Видимые и скрытые фото.
  const visiblePhotos = useMemo(() => projectPhotos.filter((p) => !p.isHidden), [projectPhotos]);
  const hiddenCount = projectPhotos.length - visiblePhotos.length;

  // Фото для timeline: видимые (или все, если включён показ скрытых).
  const timelinePhotos = useMemo(
    () => (showHidden ? projectPhotos : visiblePhotos),
    [projectPhotos, visiblePhotos, showHidden],
  );

  // Группировка по месяцам (вход уже отсортирован свежие сверху).
  const sections = useMemo(
    () =>
      groupPhotosByMonth(timelinePhotos, locale).map((g) => ({
        key: g.key,
        label: g.label,
        data: g.photos,
      })),
    [timelinePhotos, locale],
  );

  // Первая и последняя видимые точки для блока «Первое / Последнее».
  const firstPhoto = getFirstVisiblePhoto(photos, id);
  const lastPhoto = getLatestVisiblePhoto(photos, id);
  const daysBetween =
    firstPhoto && lastPhoto ? getDaysBetweenPhotos(firstPhoto, lastPhoto) : null;

  // Эталонное фото и подпись источника для summary.
  const referencePhoto = project ? resolveReferencePhoto(project, photos) : null;
  const referenceMode = project ? getReferenceMode(project) : 'latest';
  const referenceLabel =
    referenceMode === 'first'
      ? t('project.sourceFirst')
      : referenceMode === 'manual'
        ? t('project.sourceManual')
        : t('project.sourceLatest');

  // Удаление фото с подтверждением.
  const handleDeletePhoto = (photoId: string) => {
    Alert.alert(t('project.deletePhotoTitle'), t('project.deletePhotoMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => deletePhoto(photoId) },
    ]);
  };

  // Открыть камеру с выбранным текущим проектом.
  const handleAddPhoto = () => {
    if (!project) {
      return;
    }
    setActiveProjectId(project.id);
    void triggerHaptic('impact', hapticsEnabled);
    router.navigate('/camera');
  };

  // Открыть сравнение по явной паре.
  const openCompare = (beforeId: string, afterId: string) => {
    router.push(`/project/${id}/compare?before=${beforeId}&after=${afterId}`);
  };

  // Flow A: выбор снимков в режиме быстрого сравнения.
  const handleQuickSelect = (photoId: string) => {
    const next = advanceQuickCompare(selection, photoId);
    if (next.length === 2) {
      openCompare(next[0], next[1]);
      setSelection([]);
      return;
    }
    setSelection(next);
  };

  // Выход из режима выбора пары (снимает 1/2 и остаётся на экране).
  const cancelSelection = () => {
    setSelectionMode(false);
    setSelection([]);
  };

  // Открытие фото: в режиме выбора — выбор, иначе — viewer.
  const handlePhotoPress = (photoId: string) => {
    if (selectionMode) {
      handleQuickSelect(photoId);
    } else {
      router.push(`/project/${id}/viewer/${photoId}`);
    }
  };

  // Проект не найден (например, после удаления или неверная ссылка).
  if (!project) {
    return (
      <AppScreen>
        <View style={styles.empty}>
          <AppText variant="title">{t('project.notFound')}</AppText>
          <AppText color="textSecondary">{t('project.notFoundHint')}</AppText>
        </View>
      </AppScreen>
    );
  }

  const headerRight = () =>
    projectPhotos.length >= 2 ? (
      <AppButton
        label={t('nav.timelapse')}
        variant="ghost"
        onPress={() => router.push(`/project/${id}/timelapse`)}
      />
    ) : null;

  return (
    <AppScreen>
      <Stack.Screen options={{ title: project.name, headerRight }} />

      {/* Empty state: нет фото вообще. */}
      {projectPhotos.length === 0 ? (
        <View style={styles.empty}>
          <AppText variant="title">{t('project.noPhotosTitle')}</AppText>
          <AppText color="textSecondary" style={styles.emptyText}>
            {t('project.firstPhotoHint')}
          </AppText>
          <AppButton label={t('project.firstShotButton')} onPress={handleAddPhoto} />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <View style={styles.headerBlocks}>
              <SummaryBlock
                name={project.name}
                visibleCount={visiblePhotos.length}
                firstTakenAt={firstPhoto?.takenAt}
                lastTakenAt={lastPhoto?.takenAt}
                daysBetween={daysBetween}
                referenceLabel={referenceLabel}
                onCapture={handleAddPhoto}
              />

              {firstPhoto && lastPhoto ? (
                <FirstLastBlock
                  firstUri={firstPhoto.uri}
                  lastUri={lastPhoto.uri}
                  firstDate={firstPhoto.takenAt}
                  lastDate={lastPhoto.takenAt}
                  daysBetween={daysBetween}
                  onPress={() => openCompare(firstPhoto.id, lastPhoto.id)}
                />
              ) : null}

              <QuickCompareBlock
                visibleCount={visiblePhotos.length}
                selectionMode={selectionMode}
                selectionCount={selection.length}
                onToggle={() => {
                  setSelectionMode((v) => !v);
                  setSelection([]);
                }}
                onCancel={cancelSelection}
                onCapture={handleAddPhoto}
              />

              {/* Рекламный placeholder: после «Быстрого сравнения», перед «Историей». */}
              <AdPlaceholder />

              <View style={styles.toolbar}>
                <AppText variant="subtitle">{t('project.history')}</AppText>
                {hiddenCount > 0 ? (
                  <Pressable
                    onPress={() => setShowHidden((v) => !v)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: showHidden }}
                    style={styles.hiddenToggle}>
                    <AppText variant="caption" color="primary">
                      {showHidden ? t('project.hideRejected') : t('project.showHidden')}
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </View>
          }
          renderSectionHeader={({ section }) => (
            <AppText variant="subtitle" style={[styles.monthHeader, { color: colors.primary }]}>
              {section.label}
            </AppText>
          )}
          renderItem={({ item }) => (
            <PhotoRow
              photo={item}
              isReference={item.id === referencePhoto?.id}
              selectionNumber={selectionMode ? selection.indexOf(item.id) + 1 : 0}
              onPress={() => handlePhotoPress(item.id)}
              onDelete={() => handleDeletePhoto(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <AppText variant="title">{t('project.noPhotosTitle')}</AppText>
              <AppText color="textSecondary" style={styles.emptyText}>
                {t('project.allHiddenHint')}
              </AppText>
              <AppButton label={t('project.showHidden')} variant="secondary" onPress={() => setShowHidden(true)} />
            </View>
          }
        />
      )}

      <Pressable
        onPress={handleAddPhoto}
        accessibilityRole="button"
        accessibilityLabel={t('project.takeShot')}
        accessibilityHint={t('project.firstPhotoHint')}
        style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Ionicons name="add" size={28} color={colors.primaryText} />
      </Pressable>
    </AppScreen>
  );
}

/**
 * Верхний summary-блок проекта.
 */
function SummaryBlock({
  name,
  visibleCount,
  firstTakenAt,
  lastTakenAt,
  daysBetween,
  referenceLabel,
  onCapture,
}: {
  name: string;
  visibleCount: number;
  firstTakenAt?: number;
  lastTakenAt?: number;
  daysBetween: number | null;
  referenceLabel: string;
  onCapture: () => void;
}) {
  const { t, locale } = useI18n();
  return (
    <AppCard style={styles.summary}>
      <AppText variant="title">{name}</AppText>
      <AppText color="textSecondary">
        {visibleCount === 0
          ? t('project.noSnapshots')
          : t('projects.photoCount', { count: visibleCount })}
      </AppText>
      {firstTakenAt && lastTakenAt ? (
        <AppText color="textSecondary" variant="caption">
          {t('project.period', {
            from: formatDate(firstTakenAt, locale),
            to: formatDate(lastTakenAt, locale),
          })}
          {daysBetween !== null ? ` · ${t('time.days', { count: daysBetween })}` : ''}
        </AppText>
      ) : null}
      <AppText color="textSecondary" variant="caption">
        {t('project.sourceGhost', { source: referenceLabel })}
      </AppText>
      <AppButton label={t('project.takeShot')} onPress={onCapture} />
    </AppCard>
  );
}

/**
 * Блок «Первое и последнее»: заголовок, две крупные миниатюры с датами и период.
 */
function FirstLastBlock({
  firstUri,
  lastUri,
  firstDate,
  lastDate,
  daysBetween,
  onPress,
}: {
  firstUri: string;
  lastUri: string;
  firstDate: number;
  lastDate: number;
  daysBetween: number | null;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const { t, locale } = useI18n();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('project.compareFirstLast')}>
      <AppCard style={styles.firstLast}>
        <View style={styles.firstLastHead}>
          <AppText variant="subtitle">{t('project.firstLastTitle')}</AppText>
          <AppText color="textSecondary" variant="caption">
            {t('project.firstLastHint')}
          </AppText>
        </View>

        <View style={styles.firstLastRow}>
          <View style={styles.firstLastPane}>
            <Image source={{ uri: firstUri }} style={styles.firstLastImage} contentFit="cover" />
            <View style={styles.caption}>
              <AppText variant="caption" color="primaryText">
                {t('project.first')}
              </AppText>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          <View style={styles.firstLastPane}>
            <Image source={{ uri: lastUri }} style={styles.firstLastImage} contentFit="cover" />
            <View style={styles.caption}>
              <AppText variant="caption" color="primaryText">
                {t('project.last')}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.firstLastMeta}>
          <AppText variant="caption" color="textSecondary">
            {formatDate(firstDate, locale)}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {daysBetween !== null ? t('project.daysBetween', { count: daysBetween }) : ''}
          </AppText>
          <AppText variant="caption" color="textSecondary" style={{ textAlign: 'right' }}>
            {formatDate(lastDate, locale)}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

/**
 * Блок «Быстрое сравнение» (Flow A). Кнопка «Выбрать»/«Отмена» занимает одно
 * место (правая сторона карточки), не выходя за её границы на узких экранах.
 */
function QuickCompareBlock({
  visibleCount,
  selectionMode,
  selectionCount,
  onToggle,
  onCancel,
  onCapture,
}: {
  visibleCount: number;
  selectionMode: boolean;
  selectionCount: number;
  onToggle: () => void;
  onCancel: () => void;
  onCapture: () => void;
}) {
  const { t } = useI18n();

  // Один снимок: предложить сделать следующий.
  if (visibleCount === 1) {
    return (
      <AppCard style={styles.quickCompare}>
        <View style={styles.quickRow}>
          <View style={styles.quickText}>
            <AppText variant="subtitle">{t('project.quickCompare')}</AppText>
            <AppText color="textSecondary" variant="caption" numberOfLines={1}>
              {t('project.oneShotHint')}
            </AppText>
          </View>
          <AppButton label={t('project.nextShot')} onPress={onCapture} />
        </View>
      </AppCard>
    );
  }

  return (
    <AppCard style={styles.quickCompare}>
      <View style={styles.quickRow}>
        <View style={styles.quickText}>
          <AppText variant="subtitle">{t('project.quickCompare')}</AppText>
          <AppText color="textSecondary" variant="caption" numberOfLines={1}>
            {selectionMode
              ? selectionCount === 0
                ? t('project.selectTwo')
                : t('project.selected', { count: selectionCount })
              : t('project.quickCompareHint')}
          </AppText>
        </View>
        {selectionMode ? (
          <AppButton label={t('project.cancelSelection')} variant="secondary" onPress={onCancel} />
        ) : (
          <AppButton label={t('project.choose')} onPress={onToggle} />
        )}
      </View>
    </AppCard>
  );
}

/**
 * Строка фото в timeline: миниатюра + дата + заметка + бейджи + кружок выбора.
 */
function PhotoRow({
  photo,
  isReference,
  selectionNumber,
  onPress,
  onDelete,
}: {
  photo: { id: string; uri: string; takenAt: number; note?: string; isFavorite?: boolean; isHidden?: boolean };
  isReference: boolean;
  selectionNumber: number;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { colors } = useAppTheme();
  const { t, locale } = useI18n();

  return (
    <AppCard style={styles.photoRow}>
      <Pressable onPress={onPress} accessibilityRole="imagebutton" style={styles.photoRowBody}>
        <View style={styles.thumbWrap}>
          <Image source={{ uri: photo.uri }} style={styles.thumb} contentFit="cover" />
          {isReference ? (
            <View style={[styles.referenceBadge, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" color="primaryText">
                {t('project.reference')}
              </AppText>
            </View>
          ) : null}
          {selectionNumber > 0 ? (
            <View style={[styles.selectionCircle, { backgroundColor: colors.primary }]}>
              <AppText variant="caption" color="primaryText">
                {selectionNumber}
              </AppText>
            </View>
          ) : null}
        </View>
        <View style={styles.photoRowText}>
          <AppText variant="body">{formatDate(photo.takenAt, locale)}</AppText>
          {photo.note ? (
            <AppText color="textSecondary" variant="caption" numberOfLines={1}>
              {photo.note}
            </AppText>
          ) : null}
          <View style={styles.rowBadges}>
            {photo.isFavorite ? <Ionicons name="star" size={14} color={colors.primary} /> : null}
            {photo.isHidden ? <Ionicons name="eye-off" size={14} color={colors.textSecondary} /> : null}
          </View>
        </View>
      </Pressable>
      <Pressable
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={t('common.delete')}
        hitSlop={8}
        style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
      </Pressable>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    // Отступ снизу, чтобы последние фото не прятались под FAB «+».
    paddingBottom: 88,
    gap: spacing.md,
  },
  headerBlocks: {
    gap: spacing.md,
  },
  summary: {
    gap: spacing.xs,
  },
  firstLast: {
    gap: spacing.sm,
  },
  firstLastHead: {
    gap: spacing.xs,
  },
  firstLastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  firstLastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  firstLastPane: {
    flex: 1,
    borderRadius: radii.md,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  firstLastImage: {
    width: '100%',
    height: '100%',
  },
  caption: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  quickCompare: {
    gap: spacing.sm,
    // Фиксированная высота: блок не «прыгает» при смене кнопки «Выбрать»↔«Отмена»
    // и текста подсказки (текст обрезается одной строкой).
    minHeight: 96,
    justifyContent: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickText: {
    flex: 1,
    gap: spacing.xs,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  hiddenToggle: {
    padding: spacing.xs,
  },
  monthHeader: {
    marginTop: spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
  },
  photoRowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  referenceBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radii.sm,
  },
  selectionCircle: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoRowText: {
    flex: 1,
    gap: spacing.xs,
  },
  rowBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: [{ offsetX: 0, offsetY: 3, color: 'rgba(0,0,0,0.3)', blurRadius: 8 }],
  },
});
