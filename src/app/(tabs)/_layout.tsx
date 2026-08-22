/**
 * Назначение: layout нижних вкладок приложения.
 *
 * Функции:
 * - объявляет три вкладки: Проекты (index), Камера, Настройки.
 *
 * Слой: UI (/src/app). Использует Tabs из expo-router/js-tabs.
 */

import { Tabs } from 'expo-router/js-tabs';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Проекты' }} />
      <Tabs.Screen name="camera" options={{ title: 'Камера' }} />
      <Tabs.Screen name="settings" options={{ title: 'Настройки' }} />
    </Tabs>
  );
}
