/**
 * Назначение: корневой layout приложения (Expo Router).
 *
 * Функции:
 * - инициализирует локальное хранилище (SecureStore + MMKV) до отрисовки UI;
 * - оборачивает навигацию в ThemeProvider;
 * - настраивает нативный header/статус-бар в цветах текущей темы (не «белое
 *   верхнее меню» в тёмной/цветной теме);
 * - объявляет навигационный стек верхнего уровня (вкладки + экран проекта).
 *
 * Слой: UI (/src/app). Использует Stack из expo-router/stack.
 */

import { useEffect, useState } from 'react';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { BiometricsGate } from '@/features/privacy/components/biometrics-gate';
import { useI18n } from '@/i18n';
import { ToastProvider } from '@/components/ui/toast';
import { initializeStorage } from '@/storage/init';
import { configureNotificationHandler } from '@/storage/notifications';
import { ThemeProvider, useAppTheme } from '@/theme/ThemeProvider';

// Держим splash-экран, пока не завершится инициализация хранилища.
SplashScreen.preventAutoHideAsync();

// Задаём поведение уведомлений при открытом приложении (показывать баннер).
configureNotificationHandler();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initializeStorage()
      .catch((error) => {
        // Ошибка инициализации не должна блокировать запуск, но логируется.
        console.error('Ошибка инициализации хранилища:', error);
      })
      .finally(() => {
        setReady(true);
        SplashScreen.hideAsync();
      });
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppRoot />
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
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="project/[id]/index" options={{ title: t('nav.project') }} />
            <Stack.Screen name="project/[id]/viewer/[photoId]" options={{ title: t('nav.photo') }} />
            <Stack.Screen name="project/[id]/compare" options={{ title: t('nav.compare') }} />
            <Stack.Screen name="project/[id]/timelapse" options={{ title: t('nav.timelapse') }} />
            <Stack.Screen name="support" options={{ title: t('nav.support') }} />
          </Stack>
        </BiometricsGate>
      </ToastProvider>
    </>
  );
}
