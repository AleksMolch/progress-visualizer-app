/**
 * Назначение: layout нижних вкладок приложения.
 *
 * Функции:
 * - объявляет три вкладки: Проекты (index), Камера, Настройки;
 * - задаёт иконки вкладок (Ionicons из @expo/vector-icons);
 * - в оформлении Liquid Glass рисует плавающую капсулу с материалом
 *   (native-glass/blur/solid через AdaptiveSurface);
 * - отключает собственный заголовок вкладок (safe area берёт на себя AppScreen).
 *
 * Слой: UI (/src/app). Использует Tabs из expo-router/js-tabs.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdaptiveSurface } from '@/components/ui/adaptive-surface';
import {
  FLOATING_TAB_BAR_GAP,
  FLOATING_TAB_BAR_HEIGHT,
} from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';

// Горизонтальный отступ плавающей капсулы от краёв экрана.
const FLOATING_MARGIN = 16;

export default function TabLayout() {
  const { colors, metrics, material } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Плавающая капсула используется, когда у оформления задан радиус таббара.
  const isFloating = metrics.tabBarRadius > 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: isFloating
          ? {
              position: 'absolute',
              left: FLOATING_MARGIN,
              right: FLOATING_MARGIN,
              bottom: insets.bottom + FLOATING_TAB_BAR_GAP,
              height: FLOATING_TAB_BAR_HEIGHT,
              borderRadius: metrics.tabBarRadius,
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
              overflow: 'hidden',
            }
          : { backgroundColor: colors.background, borderTopColor: colors.border },
        tabBarBackground: isFloating
          ? () => (
              <AdaptiveSurface
                material={material.tabBar}
                backgroundColor={colors.surface}
                borderRadius={metrics.tabBarRadius}
                isInteractive
                style={StyleSheet.absoluteFill}
              />
            )
          : undefined,
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
