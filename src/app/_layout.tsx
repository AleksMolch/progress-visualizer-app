/**
 * Назначение: корневой layout приложения (Expo Router).
 *
 * Функции:
 * - объявляет навигационный стек верхнего уровня;
 * - объединяет группу вкладок (tabs) и экран отдельного проекта.
 *
 * Слой: UI (/src/app). Использует Stack из expo-router/stack.
 */

import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router/stack';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="project/[id]" options={{ title: 'Проект' }} />
      </Stack>
    </>
  );
}
