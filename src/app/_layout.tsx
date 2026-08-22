/**
 * Назначение: корневой layout приложения (Expo Router).
 *
 * Функции:
 * - оборачивает навигацию в ThemeProvider (тема приложения);
 * - объявляет навигационный стек верхнего уровня;
 * - объединяет группу вкладок (tabs) и экран отдельного проекта.
 *
 * Слой: UI (/src/app). Использует Stack из expo-router/stack.
 */

import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Проект' }} />
      </Stack>
    </ThemeProvider>
  );
}
