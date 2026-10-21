/**
 * Назначение: корневой layout приложения (Expo Router).
 *
 * Функции:
 * - инициализирует локальное хранилище (SecureStore + MMKV) до отрисовки UI;
 * - оборачивает навигацию в ThemeProvider;
 * - настраивает нативный header/статус-бар в цветах текущей темы (не «белое
 *   верхнее меню» в тёмной/цветной теме);
 * - объявляет навигационный стек верхнего уровня (вкладки + экран проекта);
 * - через Stack.Protected показывает онбординг до его прохождения и не пускает
 *   на основные экраны до завершения;
 * - запускает фоновую миграцию миниатюр для старых фото;
 * - держит нативный splash до первого кадра JS-оверлея и проигрывает мягкую
 *   заставку («дыхание» знака + короткий fade-out).
 *
 * Слой: UI (/src/app). Использует Stack из expo-router/stack.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BiometricsGate } from '@/features/privacy/components/biometrics-gate';
import { SoftSplashOverlay } from '@/features/splash/components/soft-splash-overlay';
import { useI18n } from '@/i18n';
import { ToastProvider } from '@/components/ui/toast';
import { initializeStorage } from '@/storage/init';
import { configureNotificationHandler } from '@/storage/notifications';
import { useProjectStore } from '@/store/projectStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

// Держим splash-экран, пока не завершится инициализация хранилища.
SplashScreen.preventAutoHideAsync();

// Задаём поведение уведомлений при открытом приложении (показывать баннер).
configureNotificationHandler();

export default function RootLayout() {
  // storageReady — инициализация хранилища завершена;
  // nativeSplashHidden — нативный splash скрыт после layout JS-оверлея;
  // showSplashOverlay — JS-оверлей ещё виден.
  const [storageReady, setStorageReady] = useState(false);
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [showSplashOverlay, setShowSplashOverlay] = useState(true);
  const hideStartedRef = useRef(false);

  useEffect(() => {
    initializeStorage()
      .catch((error) => {
        // Ошибка инициализации не должна блокировать запуск, но логируется.
        console.error('Ошибка инициализации хранилища:', error);
      })
      .finally(() => {
        setStorageReady(true);
      });
  }, []);

  // Скрываем нативный splash только после первого layout оверлея.
  const handleOverlayLayout = useCallback(() => {
    if (hideStartedRef.current) {
      return;
    }
    hideStartedRef.current = true;
    void SplashScreen.hideAsync()
      .then(() => setNativeSplashHidden(true))
      .catch((error) => {
        console.error('Не удалось скрыть нативный splash:', error);
        // Не оставляем интерфейс заблокированным из-за ошибки hideAsync.
        setNativeSplashHidden(true);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        {storageReady ? <AppRoot /> : null}
        {showSplashOverlay ? (
          <SoftSplashOverlay
            isReady={storageReady && nativeSplashHidden}
            startAnimation={nativeSplashHidden}
            onOverlayLayout={handleOverlayLayout}
            onFinish={() => setShowSplashOverlay(false)}
          />
        ) : null}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Содержимое приложения после инициализации. Здесь доступна тема, поэтому
 * нативный header, статус-бар и фон стека окрашиваются в цвета текущей темы.
 */
function AppRoot() {
  const { t } = useI18n();
  const { colors, scheme } = useAppTheme();
  const hasCompletedOnboarding = useSettingsStore((s) => s.settings.hasCompletedOnboarding);
  const ensureThumbnails = useProjectStore((s) => s.ensureThumbnails);

  // Фоновая миграция миниатюр для фото, сохранённых до их внедрения.
  // Запускается один раз за запуск после гидратации и не блокирует UI.
  useEffect(() => {
    void ensureThumbnails();
  }, [ensureThumbnails]);

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ToastProvider>
        <BiometricsGate>
          <Stack
            screenOptions={{
              // Без текста на кнопке «назад» — иначе показывается имя группы «(tabs)».
              headerBackButtonDisplayMode: 'minimal',
              // Нативный header и контент в цветах темы (не белый в тёмной теме).
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.text,
              contentStyle: { backgroundColor: colors.background },
            }}>
            {/* Основные экраны — только после онбординга. */}
            <Stack.Protected guard={hasCompletedOnboarding}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="project/[id]/index" options={{ title: t('nav.project') }} />
              <Stack.Screen name="project/[id]/viewer/[photoId]" options={{ title: t('nav.photo') }} />
              <Stack.Screen name="project/[id]/compare" options={{ title: t('nav.compare') }} />
              <Stack.Screen name="project/[id]/timelapse" options={{ title: t('nav.timelapse') }} />
              <Stack.Screen name="support" options={{ title: t('nav.support') }} />
            </Stack.Protected>

            {/* Онбординг — только до его завершения; после переключения guard
                expo-router сам уводит на основной маршрут. */}
            <Stack.Protected guard={!hasCompletedOnboarding}>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack>
        </BiometricsGate>
      </ToastProvider>
    </>
  );
}
