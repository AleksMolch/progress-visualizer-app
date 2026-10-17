/**
 * Назначение: переиспользуемый placeholder-слот под будущую рекламу.
 *
 * Функции:
 * - рендерит нейтральную карточку-заглушку;
 * - не грузит сеть и не использует SDK — это только визуальное место;
 * - скрывается (null), если флаг SHOW_AD_PLACEHOLDERS выключен;
 * - варианты inlineCompact / inlineMedium (minHeight — растёт под текст);
 * - опционально участвует в каскадном появлении списка (prop animated).
 *
 * Слой: UI (/src/features/ads/components). Не кликабелен, чтобы пользователь
 * не принимал заглушку за настоящую рекламу.
 */

import { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getStaggerDelay } from '@/utils/stagger';

import { SHOW_AD_PLACEHOLDERS } from '../config';

/** Варианты высоты placeholder-слота. */
export type AdPlaceholderVariant = 'inlineCompact' | 'inlineMedium';

interface AdPlaceholderProps {
  /** Вариант (минимальная высота) слота. */
  variant?: AdPlaceholderVariant;
  /** Дополнительный стиль внешнего контейнера (отступы в списке). */
  style?: ViewStyle;
  /** Включает каскадное появление. Для inline-слота в списке — true. */
  animated?: boolean;
  /** Позиция в каскаде. Слот стоит после первой карточки, по умолчанию 1. */
  animationIndex?: number;
}

export function AdPlaceholder({
  variant = 'inlineCompact',
  style,
  animated = false,
  animationIndex = 1,
}: AdPlaceholderProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  // Минимальная высота вместо жёсткой: карточка растёт под локализованный текст.
  const minHeight = variant === 'inlineMedium' ? 88 : 64;

  // Задержка каскада; null означает «появляется мгновенно».
  const delay = animated && !reduceMotion ? getStaggerDelay(animationIndex) : null;

  const opacity = useSharedValue(delay === null ? 1 : 0);
  const translateY = useSharedValue(delay === null ? 0 : 20);

  useEffect(() => {
    if (delay === null) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    // Сброс к стартовым значениям — на случай смены animated без remount.
    opacity.value = 0;
    translateY.value = 20;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 90 }));
  }, [delay, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Заглушка выключена — не показываем пользователю (после всех хуков).
  if (!SHOW_AD_PLACEHOLDERS) {
    return null;
  }

  return (
    <Animated.View style={[style, animatedStyle]}>
      <View
        accessibilityRole="text"
        accessibilityLabel={t('ads.placeholderText')}
        style={[
          styles.card,
          { minHeight, backgroundColor: colors.surface, borderColor: colors.border },
        ]}>
        <AppText variant="caption" color="textSecondary" numberOfLines={1}>
          {t('ads.label')}
        </AppText>
        <AppText
          variant="caption"
          color="textSecondary"
          numberOfLines={2}
          style={styles.description}>
          {t('ads.placeholderText')}
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    // При minHeight вертикальные отступы должны быть заданы явно.
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    // Страховка: текст не рисуется за рамкой.
    overflow: 'hidden',
  },
  description: {
    // Не даёт описанию переполнять flex-контейнер.
    flexShrink: 1,
    // Только локально на Android; не выносить в AppText.
    includeFontPadding: false,
  },
});
