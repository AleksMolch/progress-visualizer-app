/**
 * Назначение: переиспользуемые skeleton-блоки загрузки.
 *
 * Функции:
 * - SkeletonBlock: нейтральный блок с лёгким pulse-анимацией (Reanimated);
 * - ProjectListSkeleton / ProjectDetailsSkeleton: скелеты структуры экранов
 *   «Проекты» и «Проект» (повторяют реальную раскладку, не интерактивны).
 *
 * Слой: UI (/src/components/ui). Цвет поверхности берётся из темы.
 * Важно: скелет не должен восприниматься как настоящая фотография/контент.
 */

import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Один нейтральный блок-заглушка с pulse-анимацией. */
export function SkeletonBlock({ style }: { style?: ViewStyle }) {
  const { colors } = useAppTheme();
  const opacity = useSharedValue(0.45);

  // Лёгкое «дыхание» непрозрачности (без новой библиотеки).
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.block, { backgroundColor: colors.border }, style, animatedStyle]}
    />
  );
}

/** Скелет экрана «Проекты»: заголовок, кнопка создания и карточки. */
export function ProjectListSkeleton() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.list}>
      <View style={styles.header}>
        <SkeletonBlock style={{ width: 120, height: 24 }} />
        <SkeletonBlock style={{ width: 80, height: 36, borderRadius: 18 }} />
      </View>

      {[0, 1].map((i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface }]}>
          <SkeletonBlock style={styles.cover} />
          <View style={styles.cardBody}>
            <SkeletonBlock style={{ width: '60%', height: 18 }} />
            <SkeletonBlock style={{ width: '40%', height: 14 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Скелет экрана проекта: summary, hero, quick compare, timeline. */
export function ProjectDetailsSkeleton() {
  const { colors } = useAppTheme();
  return (
    <View style={styles.details}>
      {/* Summary. */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SkeletonBlock style={{ width: '70%', height: 20 }} />
        <SkeletonBlock style={{ width: '45%', height: 14 }} />
        <SkeletonBlock style={{ width: 120, height: 36, borderRadius: 18 }} />
      </View>

      {/* Hero «Первое и последнее». */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SkeletonBlock style={{ width: 140, height: 18 }} />
        <View style={styles.heroRow}>
          <SkeletonBlock style={styles.heroPane} />
          <SkeletonBlock style={styles.heroPane} />
        </View>
        <SkeletonBlock style={{ width: 120, height: 14, alignSelf: 'center' }} />
      </View>

      {/* Quick compare. */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <SkeletonBlock style={{ width: '55%', height: 18 }} />
        <SkeletonBlock style={{ width: '75%', height: 14 }} />
      </View>

      {/* Timeline. */}
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.card, styles.rowCard, { backgroundColor: colors.surface }]}>
          <SkeletonBlock style={styles.thumb} />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <SkeletonBlock style={{ width: '40%', height: 14 }} />
            <SkeletonBlock style={{ width: '70%', height: 12 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: 6,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: 14,
  },
  cover: {
    width: '100%',
    height: 160,
    borderRadius: 8,
  },
  cardBody: {
    gap: spacing.xs,
  },
  details: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroPane: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 8,
  },
});
