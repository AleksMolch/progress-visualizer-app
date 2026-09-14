/**
 * Назначение: layout нижних вкладок приложения.
 *
 * Функции:
 * - объявляет три вкладки: Проекты (index), Камера, Настройки;
 * - задаёт иконки вкладок (Ionicons из @expo/vector-icons);
 * - в оформлении Liquid Glass использует кастомный капсульный таббар
 *   (LiquidGlassTabBar), в остальных — стандартный таббар;
 * - отключает собственный заголовок вкладок (safe area берёт на себя AppScreen).
 *
 * Слой: UI (/src/app). Использует Tabs из expo-router/js-tabs.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { LiquidGlassTabBar } from '@/features/navigation/components/liquid-glass-tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function TabLayout() {
  const { colors, designTheme } = useAppTheme();

  // Кастомная капсула — только для Liquid Glass.
  const isGlass = designTheme === 'liquid-glass';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        ...(isGlass
          ? { tabBar: (props: BottomTabBarProps) => <LiquidGlassTabBar {...props} /> }
          : { tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border } }),
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
