/**
 * Назначение: кастомный таббар в стиле Liquid Glass (компактная плавающая капсула).
 *
 * Функции:
 * - центрированная капсула (не full-width), стеклянный материал + border + тень;
 * - активная вкладка — отдельная внутренняя пилюля с иконкой и подписью;
 * - неактивные — только иконка;
 * - использует navigation state/descriptors, не плодит историю переходов.
 *
 * Слой: UI (/src/features/navigation/components). Использует AdaptiveSurface
 * и тот же navigation state, что и стандартный JS Tabs.
 */

import { type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdaptiveSurface } from '@/components/ui/adaptive-surface';
import { AppText } from '@/components/ui/app-text';
import { FLOATING_TAB_BAR_GAP } from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';

// Радиус капсулы (пилюля).
const CAPSULE_RADIUS = 32;
// Максимальная ширина капсулы.
const MAX_WIDTH = 360;
// Доля ширины экрана, занимаемая капсулой.
const WIDTH_RATIO = '68%';

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Фон активной пилюли (полупрозрачный, зависит от схемы).
  const activePillBackground =
    scheme === 'dark' ? 'rgba(60,60,64,0.55)' : 'rgba(255,255,255,0.6)';
  // Цвет неактивных иконок — серый (светлая) / светло-серый (тёмная).
  const inactiveColor = colors.textSecondary;

  return (
    <View style={[styles.wrap, { bottom: insets.bottom + FLOATING_TAB_BAR_GAP }]}>
      <AdaptiveSurface
        material="native-glass"
        backgroundColor={colors.surface}
        borderRadius={CAPSULE_RADIUS}
        isInteractive
        style={styles.glass}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label = options.title ?? route.name;

            // Стандартный обработчик таба: не плодим историю переходов.
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };
            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={{ selected: focused }}
                accessibilityLabel={label}
                style={[styles.tab, focused && { backgroundColor: activePillBackground }]}>
                {options.tabBarIcon
                  ? options.tabBarIcon({
                      focused,
                      color: focused ? colors.primary : inactiveColor,
                      size: 22,
                    })
                  : null}
                {focused ? (
                  <AppText variant="caption" style={{ color: colors.primary }}>
                    {label}
                  </AppText>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </AdaptiveSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  glass: {
    width: WIDTH_RATIO,
    maxWidth: MAX_WIDTH,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    boxShadow: [{ offsetX: 0, offsetY: 8, color: 'rgba(0,0,0,0.18)', blurRadius: 24 }],
  },
  row: {
    flexDirection: 'row',
    padding: 6,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: CAPSULE_RADIUS,
    paddingHorizontal: 10,
    gap: 2,
  },
});
