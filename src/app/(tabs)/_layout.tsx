/**
 * Назначение: layout нижних вкладок приложения.
 *
 * Функции:
 * - объявляет три вкладки: Проекты (index), Камера, Настройки;
 * - задаёт иконки вкладок (Ionicons из @expo/vector-icons);
 * - отключает собственный заголовок вкладок (safe area берёт на себя AppScreen).
 *
 * Слой: UI (/src/app). Использует Tabs из expo-router/js-tabs.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';

// Акцентный цвет активной вкладки (фирменный #208AEF).
const ACTIVE_TINT = '#208AEF';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_TINT,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Проекты',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'images' : 'images-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Камера',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'camera' : 'camera-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Настройки',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
