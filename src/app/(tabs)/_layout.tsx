/**
 * Назначение: layout нижних вкладок приложения.
 *
 * Функции:
 * - объявляет три вкладки: Проекты (index), Камера, Настройки;
 * - использует единый кастомный таббар MainTabBar (центральная кнопка камеры)
 *   во всех оформлениях — материал панели зависит от выбранного стиля;
 * - отключает собственный заголовок вкладок (safe area берёт на себя AppScreen).
 *
 * Слой: UI (/src/app). Использует Tabs из expo-router/js-tabs.
 */

import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';

import { MainTabBar } from '@/features/navigation/components/main-tab-bar';
import { useI18n } from '@/i18n';

// Оборачивает кастомную панель в сигнатуру таббара (как прямой prop `tabBar`).
function renderMainTabBar(props: BottomTabBarProps) {
  return <MainTabBar {...props} />;
}

export default function TabLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      tabBar={renderMainTabBar}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: t('nav.projects') }} />
      <Tabs.Screen name="camera" options={{ title: t('nav.camera') }} />
      <Tabs.Screen name="settings" options={{ title: t('nav.settings') }} />
    </Tabs>
  );
}
