/**
 * Назначение: layout маршрута проекта (вложенный стек).
 *
 * Функции:
 * - объявляет вложенный Stack для экрана проекта и его дочерних маршрутов
 *   (viewer, compare);
 * - заголовок каждого экрана задаётся самим экраном через <Stack.Screen>.
 *
 * Слой: UI (/src/app). Использует Stack из expo-router/stack.
 */

import { Stack } from 'expo-router/stack';

export default function ProjectLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Проект' }} />
      <Stack.Screen name="viewer/[photoId]" options={{ title: 'Фото' }} />
      <Stack.Screen name="compare/[photoId]" options={{ title: 'Сравнение' }} />
      <Stack.Screen name="timelapse" options={{ title: 'Timelapse' }} />
    </Stack>
  );
}
