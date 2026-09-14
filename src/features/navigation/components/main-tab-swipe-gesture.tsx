/**
 * Назначение: жест смахивания между основными вкладками.
 *
 * Функции:
 * - горизонтальный pan переключает вкладки Проекты ↔ Камера ↔ Настройки;
 * - на первой/последней вкладке свайп «за край» ничего не делает;
 * - использует router.replace (не плодит историю);
 * - лёгкий haptic feedback при переключении (если включён).
 *
 * Слой: UI (/src/features/navigation/components). Использует Gesture Handler 2.
 * Ограничение: на экране камеры НЕ применяется — там уже есть горизонтальный
 * селектор проектов, слайдер и hold-to-peek жест (см. README_staff).
 */

import { useRouter } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useSettingsStore } from '@/store/settingsStore';
import { triggerHaptic } from '@/utils/haptics';

// Порядок вкладок (href роутов в Expo Router).
const TAB_HREFS = ['/', '/camera', '/settings'] as const;

// Пороги срабатывания горизонтального смахивания.
const ACTIVE_OFFSET_X = 60;
const FAIL_OFFSET_Y = 20;
const SWIPE_THRESHOLD = 40;

interface MainTabSwipeGestureProps {
  /** Индекс текущей вкладки в TAB_HREFS. */
  tabIndex: number;
  children: ReactNode;
}

export function MainTabSwipeGesture({ tabIndex, children }: MainTabSwipeGestureProps) {
  const router = useRouter();
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);

  // Горизонтальный pan: активируется только при явном горизонтальном движении
  // и не мешает вертикальной прокрутке списков. runOnJS — чтобы onEnd
  // вызывал router/haptic на JS-потоке, а не в worklet-рантайме.
  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-ACTIVE_OFFSET_X, ACTIVE_OFFSET_X])
        .failOffsetY([-FAIL_OFFSET_Y, FAIL_OFFSET_Y])
        .runOnJS(true)
        .onEnd((event) => {
          let target = tabIndex;
          if (event.translationX < -SWIPE_THRESHOLD) {
            target = Math.min(tabIndex + 1, TAB_HREFS.length - 1);
          } else if (event.translationX > SWIPE_THRESHOLD) {
            target = Math.max(tabIndex - 1, 0);
          }
          if (target !== tabIndex) {
            router.replace(TAB_HREFS[target]);
            void triggerHaptic('selection', hapticsEnabled);
          }
        }),
    [router, tabIndex, hapticsEnabled],
  );

  return <GestureDetector gesture={gesture}>{children}</GestureDetector>;
}
