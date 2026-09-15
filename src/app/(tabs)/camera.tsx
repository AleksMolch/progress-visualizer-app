/**
 * Назначение: экран съёмки с выбором активного проекта и эталонным призраком.
 *
 * Функции:
 * - запрашивает разрешение камеры и показывает превью (CameraView);
 * - выбирает активный проект для съёмки;
 * - показывает ghost overlay по эталонному фото проекта (latest / first / manual);
 * - tap по свободной зоне превью временно усиливает призрак (не сохраняется);
 * - делает снимок и сохраняет его в sandbox (через store, не напрямую);
 * - съёмка запускается центральной кнопкой нижней панели (shutter bridge).
 *
 * Слой: UI (/src/app). Файловую систему не трогает: захват идёт через
 * useProjectStore.saveCapturedPhoto, который сам работает со storage-слоем.
 */

import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  AppState,
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
import { useAppStore } from '@/store/appStore';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import { MAIN_TAB_BAR_INSET } from '@/theme/tab-bar';
import { resolveGhostVisibility } from '@/utils/ghost';
import { triggerHaptic } from '@/utils/haptics';
import { getVisiblePhotos } from '@/utils/photos';
import { getReferenceMode, isManualReferenceMissing, resolveReferencePhoto } from '@/utils/reference';

/** Нижний отступ контролов от нижней панели вкладок. */
const CONTROLS_BOTTOM_GAP = 16;

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

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
  const referenceLabel = referenceMode === 'first' ? 'Первое' : referenceMode === 'manual' ? 'Вручную' : 'Последнее';

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
      const picture = await cameraRef.current?.takePictureAsync();
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
      setCaptureError('Не удалось сохранить снимок');
    } finally {
      setIsCapturing(false);
    }
  }, [activeProject, isCapturing, settings.hapticsEnabled, saveCapturedPhoto]);

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

  // Сброс временного усиления при уходе приложения в фон.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setBoosted(false);
      }
    });
    return () => subscription.remove();
  }, []);

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

  // Пока разрешение загружается — показываем индикатор.
  if (!permission) {
    return (
      <CenteredState>
        <ActivityIndicator />
      </CenteredState>
    );
  }

  // Разрешение не выдано — экран запроса.
  if (!permission.granted) {
    return (
      <CenteredState>
        <AppText variant="subtitle">Нужен доступ к камере</AppText>
        <AppText color="textSecondary">
          {permission.canAskAgain
            ? 'Разрешите доступ, чтобы делать фотографии прогресса.'
            : 'Доступ запрещён. Разрешите камеру в настройках устройства.'}
        </AppText>
        {permission.canAskAgain ? (
          <AppButton label="Разрешить доступ" onPress={requestPermission} />
        ) : null}
      </CenteredState>
    );
  }

  // Камера доступна, но проектов нет — съёмке некуда сохраняться.
  if (projects.length === 0) {
    return (
      <CenteredState>
        <AppText variant="subtitle">Пока нет проектов</AppText>
        <AppText color="textSecondary">
          Создайте проект на вкладке «Проекты», чтобы начать съёмку.
        </AppText>
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
        title="Выберите эталон"
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
 * Использует safe area сверху, как остальные экраны.
 */
function CenteredState({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.centered,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}>
      {children}
    </View>
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
              <AppText variant="caption" color={isActive ? 'primaryText' : 'text'}>
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
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  chipActive: {
    backgroundColor: '#208AEF',
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
