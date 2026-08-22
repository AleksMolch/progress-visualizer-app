/**
 * Назначение: корневой layout приложения (Expo Router).
 *
 * Функции:
 * - инициализирует локальное хранилище (SecureStore + MMKV) до отрисовки UI;
 * - оборачивает навигацию в ThemeProvider;
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
import { initializeStorage } from '@/storage/init';
import { ThemeProvider } from '@/theme/ThemeProvider';

// Держим splash-экран, пока не завершится инициализация хранилища.
SplashScreen.preventAutoHideAsync();

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
        <StatusBar style="auto" />
        <BiometricsGate>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="project/[id]" options={{ headerShown: false }} />
          </Stack>
        </BiometricsGate>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
