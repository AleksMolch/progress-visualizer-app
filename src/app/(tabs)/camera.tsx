/**
 * Назначение: экран съёмки с выбором активного проекта.
 *
 * Функции:
 * - запрашивает разрешение камеры;
 * - показывает превью камеры (CameraView);
 * - позволяет выбрать активный проект для съёмки;
 * - делает снимок и сохраняет его в sandbox (через store, не напрямую).
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
import { GridOverlay } from '@/features/camera/components/grid-overlay';
import { OverlayControls } from '@/features/camera/components/overlay-controls';
import { useAppStore } from '@/store/appStore';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import { FLOATING_TAB_BAR_INSET } from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';
import { resolveGhostVisibility } from '@/utils/ghost';
import { getLatestPhoto } from '@/utils/photos';

/** Мин. нижний отступ контролов от края экрана. */
const CONTROLS_BOTTOM_INSET = 24;

export default function CameraScreen() {
  const { metrics } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Временный режим быстрого показа призрака (hold-to-peek / доступная кнопка).
  // Это локальное состояние экрана — в persist/MMKV не записывается.
  const [isPeekActive, setPeekActive] = useState(false);

  // Активный проект берём из appStore, список — из projectStore.
  const projects = useProjectStore((s) => s.projects);
  const photos = useProjectStore((s) => s.photos);
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);
  const saveCapturedPhoto = useProjectStore((s) => s.saveCapturedPhoto);
  const settings = useSettingsStore((s) => s.settings);

  // Отступ под плавающую капсулу таббара (0 — стандартный таббар).
  const floatingInset = metrics.tabBarRadius > 0 ? FLOATING_TAB_BAR_INSET : 0;

  // Эффективный активный проект: выбранный или первый из списка.
  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0] ?? null;

  // Последнее фото активного проекта для ghost overlay (null — фото ещё нет).
  const latestPhoto = activeProject ? getLatestPhoto(photos, activeProject.id) : null;

  // Эталон доступен, если у активного проекта есть фото.
  const referenceReady = latestPhoto !== null;

  // Итоговая видимость и непрозрачность призрака (обычный + быстрый показ).
  const { visible: ghostVisible, effectiveOpacity: ghostEffectiveOpacity } =
    resolveGhostVisibility({
      ghostEnabled: settings.ghostEnabled,
      referenceReady,
      isPeekActive,
      ghostOpacity: settings.ghostOpacity,
    });

  // Жест быстрого показа: касание с удержанием пальца на свободной зоне превью
  // включает 90%, отпускание возвращает обычный режим.
  const peekGesture = useMemo(
    () =>
      Gesture.Tap()
        .onTouchesDown(() => setPeekActive(true))
        .onTouchesUp(() => setPeekActive(false)),
    [],
  );

  // Сброс быстрого показа при уходе с экрана (переключение вкладки/навигация).
  useFocusEffect(
    useCallback(() => {
      return () => setPeekActive(false);
    }, []),
  );

  // Сброс быстрого показа при уходе приложения в фон.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setPeekActive(false);
      }
    });
    return () => subscription.remove();
  }, []);

  // Захват кадра и сохранение в sandbox через store.
  const handleCapture = async () => {
    if (!activeProject || isCapturing) {
      return;
    }
    // Съёмка выходит из быстрого показа.
    setPeekActive(false);
    setIsCapturing(true);
    setCaptureError(null);
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
        uri={latestPhoto?.uri ?? null}
        opacity={ghostEffectiveOpacity}
        enabled={ghostVisible}
      />

      <GridOverlay enabled={settings.gridEnabled} />

      {/* Слой распознавания hold-to-peek: под контролами, поверх превью. */}
      <GestureDetector gesture={peekGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      <ProjectSelector
        projects={projects}
        activeId={activeProject?.id ?? null}
        onSelect={(id) => {
          // Смена проекта сбрасывает быстрый показ.
          setPeekActive(false);
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

      <View style={[styles.controlsWrap, { bottom: 120 + floatingInset }]}>
        <OverlayControls
          hasPhoto={latestPhoto !== null}
          isPeekActive={isPeekActive}
          onSetPeek={setPeekActive}
        />
      </View>

      <ShutterButton
        isCapturing={isCapturing}
        onPress={handleCapture}
        floatingInset={floatingInset}
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

/**
 * Круглая кнопка спуска затвора с индикатором съёмки.
 */
function ShutterButton({
  isCapturing,
  onPress,
  floatingInset,
}: {
  isCapturing: boolean;
  onPress: () => void;
  floatingInset: number;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.shutterWrap,
        { paddingBottom: insets.bottom + CONTROLS_BOTTOM_INSET + floatingInset },
      ]}>
      <Pressable
        onPress={onPress}
        disabled={isCapturing}
        accessibilityRole="button"
        accessibilityLabel="Сделать снимок"
        style={styles.shutter}>
        {isCapturing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <View style={styles.shutterInner} />
        )}
      </Pressable>
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
    bottom: 120,
  },
  shutterWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
});
