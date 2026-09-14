/**
 * Назначение: кастомный таббар в стиле Liquid Glass (компактная плавающая капсула).
 *
 * Функции:
 * - центрированная капсула (64% ширины, maxWidth 340), стеклянный материал
 *   + тонкая граница + мягкая тень;
 * - активная вкладка — отдельная внутренняя пилюля (absolute-fill под иконкой);
 * - активная: иконка + подпись акцентным цветом; неактивная: только иконка;
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
import { FLOATING_TAB_BAR_GAP, FLOATING_TAB_BAR_HEIGHT } from '@/theme/tab-bar';
import { useAppTheme } from '@/theme/ThemeProvider';

// Геометрия капсулы.
const WIDTH_RATIO = '64%';
const MAX_WIDTH = 340;
const MIN_WIDTH = 250;

// Короткие подписи для узкой капсулы (полное имя остаётся в accessibilityLabel).
const SHORT_LABELS: Record<string, string> = {
  'Настройки': 'Опции',
};

export function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Цвета, зависящие от схемы (light/dark).
  const isDark = scheme === 'dark';
  const activePillBackground = isDark ? 'rgba(70,70,74,0.62)' : 'rgba(255,255,255,0.68)';
  const activePillBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)';
  const inactiveColor = isDark ? 'rgba(255,255,255,0.72)' : 'rgba(80,80,86,0.74)';
  const capsuleBorder = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.55)';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.overlay, { bottom: insets.bottom + FLOATING_TAB_BAR_GAP }]}>
      <AdaptiveSurface
        material="native-glass"
        backgroundColor={colors.surface}
        borderRadius={FLOATING_TAB_BAR_HEIGHT / 2}
        isInteractive
        style={[styles.capsule, { borderColor: capsuleBorder }]}>
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            // Полное имя — для доступности; короткое — для компактной капсулы.
            const fullLabel = options.title ?? route.name;
            const label = SHORT_LABELS[fullLabel] ?? fullLabel;

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
                accessibilityLabel={fullLabel}
                style={styles.tab}>
                {/* Внутренняя активная пилюля — слой под иконкой/подписью. */}
                {focused ? (
                  <View
                    style={[
                      styles.activePill,
                      { backgroundColor: activePillBackground, borderColor: activePillBorder },
                    ]}
                  />
                ) : null}
                {options.tabBarIcon
                  ? options.tabBarIcon({
                      focused,
                      color: focused ? colors.primary : inactiveColor,
                      size: 22,
                    })
                  : null}
                {focused ? (
                  <AppText
                    variant="caption"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    style={{ color: colors.primary }}>
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
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  capsule: {
    width: WIDTH_RATIO,
    maxWidth: MAX_WIDTH,
    minWidth: MIN_WIDTH,
    height: FLOATING_TAB_BAR_HEIGHT,
    borderWidth: 1,
    boxShadow: [{ offsetX: 0, offsetY: 8, color: 'rgba(0,0,0,0.18)', blurRadius: 18 }],
    elevation: 8,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  tab: {
    height: 50,
    minWidth: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 2,
  },
  activePill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 999,
    borderWidth: 1,
  },
});
