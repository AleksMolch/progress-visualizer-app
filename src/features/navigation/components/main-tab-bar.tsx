/**
 * Назначение: единая панель нижних вкладок для всех оформлений.
 *
 * Функции:
 * - структура «Проекты — [центральная кнопка камеры] — Настройки»;
 * - центральная круглая кнопка чуть выступает над панелью;
 * - на экране камеры центральная кнопка анимированно превращается в затвор
 *   (кроссфейд «камера → затвор» через Reanimated) и вызывает съёмку;
 * - материал панели зависит от оформления (glass / material / solid / soft UI).
 *
 * Слой: UI (/src/features/navigation/components). Использует тот же navigation
 * state, что и стандартный JS Tabs. Съёмку запускает через camera-shutter-bridge.
 */

import { Ionicons } from '@expo/vector-icons';
import { type BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AdaptiveSurface } from '@/components/ui/adaptive-surface';
import { AppText } from '@/components/ui/app-text';
import {
  CENTER_BUTTON_RAISED,
  CENTER_BUTTON_SIZE,
  MAIN_TAB_BAR_GAP,
  MAIN_TAB_BAR_HEIGHT,
} from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';
import { triggerShutter } from '../camera-shutter-bridge';

export function MainTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, metrics, material, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Находим маршруты по именам (порядок в state может не совпадать с макетом).
  const projectsRoute = state.routes.find((r) => r.name === 'index');
  const cameraRoute = state.routes.find((r) => r.name === 'camera');
  const settingsRoute = state.routes.find((r) => r.name === 'settings');

  const cameraIndex = cameraRoute ? state.routes.indexOf(cameraRoute) : -1;
  const isCameraFocused = cameraIndex >= 0 && state.index === cameraIndex;

  // Прогресс кроссфейда «камера → затвор» (1 = затвор).
  const shutterProgress = useSharedValue(isCameraFocused ? 1 : 0);
  useEffect(() => {
    shutterProgress.value = withTiming(isCameraFocused ? 1 : 0, { duration: 200 });
  }, [isCameraFocused, shutterProgress]);

  // Камера видна, когда НЕ на экране камеры; затвор — когда на экране камеры.
  const cameraStyle = useAnimatedStyle(() => ({ opacity: 1 - shutterProgress.value }));
  const shutterStyle = useAnimatedStyle(() => ({ opacity: shutterProgress.value }));

  // Плавающая капсула (tabBarRadius > 0) или полноширинная панель.
  const floating = metrics.tabBarRadius > 0;

  // Полупрозрачный тинт для glass-панели; иначе — обычный surface.
  const barBackground =
    material.tabBar === 'native-glass'
      ? scheme === 'dark'
        ? 'rgba(18,20,24,0.26)'
        : 'rgba(255,255,255,0.20)'
      : colors.surface;

  // Общий обработчик навигации по вкладке (с сохранением tabPress-события).
  const makePressHandler = (routeName: string, routeKey: string, isFocused: boolean) => () => {
    const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const renderSideItem = (
    route: (typeof state.routes)[number] | undefined,
    icon: keyof typeof Ionicons.glyphMap,
    iconInactive: keyof typeof Ionicons.glyphMap,
    label: string,
  ) => {
    if (!route) {
      return <View style={styles.sideSlot} />;
    }
    const focused = state.index === state.routes.indexOf(route);
    const options = descriptors[route.key].options;
    const fullLabel = options.title ?? label;
    const color = focused ? colors.primary : colors.textSecondary;

    return (
      <Pressable
        onPress={makePressHandler(route.name, route.key, focused)}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={fullLabel}
        style={[styles.sideSlot, isCameraFocused && styles.sideDimmed]}>
        <Ionicons name={focused ? icon : iconInactive} size={22} color={color} />
        <AppText
          variant="caption"
          numberOfLines={1}
          style={{ color, fontSize: 11 }}>
          {label}
        </AppText>
      </Pressable>
    );
  };

  const onCameraPress = () => {
    if (isCameraFocused) {
      triggerShutter();
    } else if (cameraRoute) {
      makePressHandler(cameraRoute.name, cameraRoute.key, false)();
    }
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        { bottom: insets.bottom + (floating ? MAIN_TAB_BAR_GAP : 0) },
      ]}>
      <AdaptiveSurface
        material={material.tabBar}
        backgroundColor={barBackground}
        borderRadius={floating ? MAIN_TAB_BAR_HEIGHT / 2 : 0}
        style={floating ? styles.capsule : styles.fullBar}>
        <View style={styles.row}>
          {renderSideItem(
            projectsRoute,
            'images',
            'images-outline',
            'Проекты',
          )}
          <View style={{ width: CENTER_BUTTON_SIZE }} />
          {renderSideItem(
            settingsRoute,
            'settings',
            'settings-outline',
            'Настройки',
          )}
        </View>
      </AdaptiveSurface>

      {/* Центральная кнопка: камера ↔ затвор (кроссфейд). */}
      <Pressable
        onPress={onCameraPress}
        accessibilityRole="button"
        accessibilityLabel={isCameraFocused ? 'Сделать снимок' : 'Камера'}
        style={[styles.centerButton, { marginTop: -CENTER_BUTTON_RAISED }]}>
        <Animated.View
          style={[
            styles.centerLayer,
            { backgroundColor: colors.primary },
            cameraStyle,
          ]}>
          <Ionicons name="camera" size={24} color={colors.primaryText} />
        </Animated.View>
        <Animated.View style={[styles.centerLayer, styles.shutter, shutterStyle]}>
          <View style={styles.shutterInner} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  capsule: {
    width: '64%',
    maxWidth: 340,
    minWidth: 250,
    height: MAIN_TAB_BAR_HEIGHT,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    boxShadow: [{ offsetX: 0, offsetY: 8, color: 'rgba(0,0,0,0.18)', blurRadius: 18 }],
    elevation: 8,
  },
  fullBar: {
    width: '100%',
    height: MAIN_TAB_BAR_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sideSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sideDimmed: {
    opacity: 0.6,
  },
  centerButton: {
    position: 'absolute',
    alignSelf: 'center',
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: [{ offsetX: 0, offsetY: 4, color: 'rgba(0,0,0,0.25)', blurRadius: 8 }],
    elevation: 6,
  },
  centerLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shutter: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  shutterInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },
});
