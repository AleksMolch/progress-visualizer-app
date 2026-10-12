/**
 * Назначение: экран съёмки с выбором активного проекта и эталонным призраком.
 *
 * Функции:
 * - запрашивает разрешение камеры (полный flow: запрос / постоянный отказ
 *   с открытием настроек / автоперечитывание статуса после возврата);
 * - показывает превью (CameraView) при выданном разрешении;
 * - выбирает активный проект для съёмки;
 * - показывает ghost overlay по эталонному фото проекта (latest / first / manual);
 * - tap по свободной зоне превью временно усиливает призрак (не сохраняется);
 * - делает снимок (штатный звук затвора отключён) и сохраняет его в sandbox
 *   (через store, не напрямую);
 * - съёмка запускается центральной кнопкой нижней панели (shutter bridge).
 *
 * Слой: UI (/src/app). Файловую систему не трогает: захват идёт через
 * useProjectStore.saveCapturedPhoto, который сам работает со storage-слоем.
 */

import { CameraView, useCameraPermissions, type CameraPictureOptions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { GhostOverlay } from '@/features/camera/components/ghost-overlay';
import { GhostReferenceModal } from '@/features/camera/components/ghost-reference-modal';
import { GridOverlay } from '@/features/camera/components/grid-overlay';
import { OverlayControls } from '@/features/camera/components/overlay-controls';
import { setShutterHandler } from '@/features/navigation/camera-shutter-bridge';
import { PhotoPickerSheet } from '@/features/gallery/components/photo-picker-sheet';
import { useI18n } from '@/i18n';
import { useAppStore } from '@/store/appStore';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import { MAIN_TAB_BAR_INSET } from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';
import { resolveCameraPermissionView } from '@/utils/cameraPermission';
import { resolveGhostVisibility } from '@/utils/ghost';
import { triggerHaptic } from '@/utils/haptics';
import { getVisiblePhotos } from '@/utils/photos';
import { getReferenceMode, isManualReferenceMissing, resolveReferencePhoto } from '@/utils/reference';

/** Нижний отступ контролов от нижней панели вкладок. */
const CONTROLS_BOTTOM_GAP = 16;

/**
 * Параметры съёмки. Штатный shutter sound Expo отключён: на Android
 * `shutterSound: true` (значение по умолчанию) проигрывает системный
 * MediaActionSound.SHUTTER_CLICK чрезмерно громко и мешает основной функции
 * приложения. Подтверждение съёмки даёт визуальная анимация затвора и haptic
 * (если включён в настройках); собственный звук не добавляем.
 */
const CAPTURE_OPTIONS: CameraPictureOptions = { shutterSound: false };

export default function CameraScreen() {
  const { t } = useI18n();
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Permission flow: занятость запроса и ошибка открытия системных настроек.
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [settingsError, setSettingsError] = useState(false);
  const permissionView = resolveCameraPermissionView(permission);

  // Временное усиление видимости призрака (tap по превью). Локальное состояние —
  // НЕ сохраняется в persist/MMKV.
  const [isBoosted, setBoosted] = useState(false);

  // Видимость модалок выбора источника эталона.
  const [referenceModalVisible, setReferenceModalVisible] = useState(false);
  const [manualPickerVisible, setManualPickerVisible] = useState(false);

  // Активный проект берём из appStore, список — из projectStore.
  const projects = useProjectStore((s) => s.projects);
  const photos = useProjectStore((s) => s.photos);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const saveCapturedPhoto = useProjectStore((s) => s.saveCapturedPhoto);
  const setProjectReference = useProjectStore((s) => s.setProjectReference);
  const settings = useSettingsStore((s) => s.settings);

  const insets = useSafeAreaInsets();

  // Эффективный активный проект: выбранный или первый из списка.
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null;

  // Эталонное фото по режиму проекта (latest/first/manual).
  const referencePhoto = activeProject ? resolveReferencePhoto(activeProject, photos) : null;
  const referenceMode = activeProject ? getReferenceMode(activeProject) : 'latest';
  const manualMissing = activeProject ? isManualReferenceMissing(activeProject, photos) : false;
  const referenceReady = referencePhoto !== null;

  // Подпись текущего источника для панели.
  const referenceLabel =
    referenceMode === 'first'
      ? t('camera.sourceFirstShort')
      : referenceMode === 'manual'
        ? t('camera.sourceManualShort')
        : t('camera.sourceLatestShort');

  // Видимые фото проекта (хронологически, старые → новые) для ручного выбора.
  const visiblePhotos = useMemo(() => {
    if (!activeProject) {
      return [];
    }
    return getVisiblePhotos(photos, activeProject.id).sort((a, b) => a.takenAt - b.takenAt);
  }, [photos, activeProject]);

  // Итоговая видимость и непрозрачность призрака (обычный + временное усиление).
  const { visible: ghostVisible, effectiveOpacity: ghostEffectiveOpacity } =
    resolveGhostVisibility({
      ghostEnabled: settings.ghostEnabled,
      referenceReady,
      isBoosted,
      ghostOpacity: settings.ghostOpacity,
    });

  // Захват кадра и сохранение в sandbox через store.
  const handleCapture = useCallback(async () => {
    if (!activeProject || isCapturing) {
      return;
    }
    // Съёмка сбрасывает временное усиление.
    setBoosted(false);
    setIsCapturing(true);
    setCaptureError(null);
    void triggerHaptic('capture', settings.hapticsEnabled);
    try {
      const picture = await cameraRef.current?.takePictureAsync(CAPTURE_OPTIONS);
      if (!picture) {
        throw new Error('Камера ещё не готова');
      }
      await saveCapturedPhoto({
        projectId: activeProject.id,
        tempUri: picture.uri,
        width: picture.width,
        height: picture.height,
      });
    } catch {
      setCaptureError(t('camera.captureError'));
    } finally {
      setIsCapturing(false);
    }
  }, [activeProject, isCapturing, settings.hapticsEnabled, saveCapturedPhoto, t]);

  // Запрос разрешения: guard от повторного нажатия, результат приходит через hook.
  const handleRequestPermission = useCallback(async () => {
    if (isRequestingPermission) {
      return;
    }
    setIsRequestingPermission(true);
    setSettingsError(false);
    try {
      await requestPermission();
    } catch {
      // Системный диалог не открылся — статус не меняем, пользователь может
      // повторить нажатие (кнопка снова станет активной).
    } finally {
      setIsRequestingPermission(false);
    }
  }, [isRequestingPermission, requestPermission]);

  // Открытие системных настроек приложения (когда системный запрос недоступен).
  // Ошибка открытия показывается на экране с возможностью повторить.
  const handleOpenSettings = useCallback(async () => {
    setSettingsError(false);
    try {
      await Linking.openSettings();
    } catch {
      setSettingsError(true);
    }
  }, []);

  // Регистрируем съёмку для центральной кнопки нижней панели (shutter bridge).
  useEffect(() => {
    setShutterHandler(() => {
      void handleCapture();
    });
    return () => setShutterHandler(null);
  }, [handleCapture]);

  // Tap по превью: переключение временного усиления призрака.
  const boostGesture = useMemo(
    () =>
      Gesture.Tap()
        .runOnJS(true)
        .onEnd(() => setBoosted((v) => !v)),
    [],
  );

  // Сброс временного усиления при уходе с экрана.
  useFocusEffect(
    useCallback(() => {
      return () => setBoosted(false);
    }, []),
  );

  // Уход в фон сбрасывает временное усиление; возврат в active сбрасывает
  // ошибку настроек и перечитывает статус разрешения камеры (например, после
  // возврата из системных настроек). Подписка одна — без параллельных listener'ов.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setBoosted(false);
        return;
      }
      setSettingsError(false);
      void getPermission();
    });
    return () => subscription.remove();
  }, [getPermission]);

  // Выбор источника эталона (latest/first).
  const handleSelectMode = (mode: 'latest' | 'first' | 'manual') => {
    if (!activeProject) {
      return;
    }
    if (mode === 'manual') {
      setManualPickerVisible(true);
      return;
    }
    // Смена источника сбрасывает временное усиление.
    setBoosted(false);
    setProjectReference(activeProject.id, mode);
    setReferenceModalVisible(false);
  };

  // Выбор ручного эталона из листа.
  const handleSelectManualPhoto = (photoId: string) => {
    if (!activeProject) {
      return;
    }
    setBoosted(false);
    setProjectReference(activeProject.id, 'manual', photoId);
    setManualPickerVisible(false);
    setReferenceModalVisible(false);
  };

  // Состояние A: permission ещё загружается — индикатор, без диалога и без CameraView.
  if (permissionView === 'loading') {
    return (
      <CenteredState>
        <ActivityIndicator />
      </CenteredState>
    );
  }

  // Состояния B/C: запрос разрешения или постоянный отказ (открытие настроек).
  if (permissionView === 'request' || permissionView === 'blocked') {
    return (
      <PermissionState
        blocked={permissionView === 'blocked'}
        isRequesting={isRequestingPermission}
        settingsError={settingsError}
        onRequest={handleRequestPermission}
        onOpenSettings={handleOpenSettings}
        onBackToProjects={() => router.navigate('/')}
      />
    );
  }

  // Камера доступна, но проектов нет — съёмке некуда сохраняться.
  if (projects.length === 0) {
    return (
      <CenteredState>
        <AppText variant="subtitle">{t('camera.noProjects')}</AppText>
        <AppText color="textSecondary">{t('camera.noProjectsHint')}</AppText>
      </CenteredState>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        onMountError={(event) => setCaptureError(event.message)}
      />

      <GhostOverlay
        uri={referencePhoto?.uri ?? null}
        opacity={ghostEffectiveOpacity}
        enabled={ghostVisible}
      />

      <GridOverlay enabled={settings.gridEnabled} />

      {/* Слой tap-to-boost: под контролами, поверх превью. */}
      <GestureDetector gesture={boostGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      <ProjectSelector
        projects={projects}
        activeId={activeProject?.id ?? null}
        onSelect={(id) => {
          // Смена проекта сбрасывает временное усиление.
          setBoosted(false);
          setActiveProjectId(id);
        }}
      />

      {captureError ? (
        <View style={styles.errorBadge}>
          <AppText color="primaryText" variant="caption">
            {captureError}
          </AppText>
        </View>
      ) : null}

      <View
        style={[
          styles.controlsWrap,
          { bottom: insets.bottom + MAIN_TAB_BAR_INSET + CONTROLS_BOTTOM_GAP },
        ]}>
        <OverlayControls
          hasPhoto={referenceReady}
          isBoosted={isBoosted}
          effectiveOpacity={ghostEffectiveOpacity}
          referenceLabel={referenceLabel}
          onOpenReference={() => setReferenceModalVisible(true)}
          onResetBoost={() => setBoosted(false)}
        />
      </View>

      <GhostReferenceModal
        visible={referenceModalVisible}
        mode={referenceMode}
        manualPhoto={referenceMode === 'manual' ? referencePhoto : null}
        manualMissing={manualMissing}
        onSelectMode={handleSelectMode}
        onSelectManual={() => setManualPickerVisible(true)}
        onClose={() => setReferenceModalVisible(false)}
      />

      <PhotoPickerSheet
        visible={manualPickerVisible}
        title={t('camera.pickReference')}
        photos={visiblePhotos}
        selectedId={referenceMode === 'manual' ? activeProject?.referencePhotoId ?? null : null}
        referenceId={activeProject?.referencePhotoId ?? null}
        onSelect={handleSelectManualPhoto}
        onClose={() => setManualPickerVisible(false)}
      />
    </View>
  );
}

/**
 * Центрированный экран-состояние (загрузка / нет разрешения / нет проектов).
 * Фон и текст берутся из текущей темы — контраст не зависит от оформления;
 * safe area и нижняя панель вкладок учтены, чтобы контент не перекрывался меню.
 */
function CenteredState({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.centered,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom + MAIN_TAB_BAR_INSET,
        },
      ]}>
      {children}
    </View>
  );
}

/**
 * Экран разрешения камеры: запрос (canAskAgain) или постоянный отказ,
 * при котором открываются системные настройки приложения.
 */
function PermissionState({
  blocked,
  isRequesting,
  settingsError,
  onRequest,
  onOpenSettings,
  onBackToProjects,
}: {
  /** true — системный запрос недоступен, нужны настройки. */
  blocked: boolean;
  /** Системный диалог запрашивается прямо сейчас. */
  isRequesting: boolean;
  /** Не удалось открыть системные настройки. */
  settingsError: boolean;
  /** Запросить разрешение. */
  onRequest: () => void;
  /** Открыть системные настройки приложения. */
  onOpenSettings: () => void;
  /** Вернуться на вкладку проектов. */
  onBackToProjects: () => void;
}) {
  const { t } = useI18n();
  return (
    <CenteredState>
      <AppText variant="title" style={styles.permissionText}>
        {blocked ? t('camera.permissionDeniedTitle') : t('camera.needPermission')}
      </AppText>
      <AppText color="textSecondary" style={styles.permissionText}>
        {blocked ? t('camera.permissionSettingsHint') : t('camera.permissionHint')}
      </AppText>

      {settingsError ? (
        <AppText color="danger" variant="caption" style={styles.permissionText}>
          {t('camera.settingsError')}
        </AppText>
      ) : null}

      {blocked ? (
        <AppButton label={t('camera.openSettings')} onPress={onOpenSettings} />
      ) : (
        <AppButton
          label={isRequesting ? t('camera.permissionRequesting') : t('camera.allowCamera')}
          onPress={onRequest}
          disabled={isRequesting}
        />
      )}
      <AppButton label={t('camera.backToProjects')} variant="secondary" onPress={onBackToProjects} />
    </CenteredState>
  );
}

/**
 * Горизонтальный селектор активного проекта (чипы поверх камеры).
 */
function ProjectSelector({
  projects,
  activeId,
  onSelect,
}: {
  projects: { id: string; name: string }[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.selector, { paddingTop: insets.top + spacing.sm }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorContent}>
        {projects.map((project) => {
          const isActive = project.id === activeId;
          return (
            <Pressable
              key={project.id}
              onPress={() => onSelect(project.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[styles.chip, isActive && styles.chipActive]}>
              <AppText variant="caption" color="primaryText" numberOfLines={1}>
                {project.name}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  permissionText: {
    textAlign: 'center',
  },
  selector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  selectorContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    // Тёмная полупрозрачная подложка — не спорит с чёрным превью камеры
    // и соответствует тёмному нижнему меню.
    backgroundColor: 'rgba(20,22,26,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: '#208AEF',
    borderColor: '#208AEF',
  },
  errorBadge: {
    position: 'absolute',
    top: 96,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,59,48,0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
  },
  controlsWrap: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
});
