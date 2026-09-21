/**
 * Назначение: переиспользуемый placeholder-слот под будущую рекламу.
 *
 * Функции:
 * - рендерит нейтральную карточку-заглушку («Тестовое место под рекламу»);
 * - не грузит сеть и не использует SDK — это только визуальное место;
 * - скрывается (null), если флаг SHOW_AD_PLACEHOLDERS выключен;
 * - варианты: inlineCompact (50–64 dp) и inlineMedium (80–100 dp).
 *
 * Слой: UI (/src/features/ads/components). Не кликабелен, чтобы пользователь
 * не принимал заглушку за настоящую рекламу.
 */

import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

import { SHOW_AD_PLACEHOLDERS } from '../config';

/** Варианты высоты placeholder-слота. */
export type AdPlaceholderVariant = 'inlineCompact' | 'inlineMedium';

interface AdPlaceholderProps {
  /** Вариант (высота) слота. */
  variant?: AdPlaceholderVariant;
  /** Дополнительный стиль контейнера (отступы в списке). */
  style?: ViewStyle;
}

export function AdPlaceholder({ variant = 'inlineCompact', style }: AdPlaceholderProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  // Заглушка выключена — не показываем пользователю.
  if (!SHOW_AD_PLACEHOLDERS) {
    return null;
  }

  const height = variant === 'inlineMedium' ? 88 : 56;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={t('ads.placeholderDev')}
      style={[
        styles.card,
        {
          height,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}>
      <AppText variant="caption" color="textSecondary">
        {t('ads.label')}
      </AppText>
      <AppText variant="caption" color="textSecondary" numberOfLines={1}>
        {t('ads.placeholderDev')}
      </AppText>
      <AppText variant="caption" color="textSecondary" style={styles.sizeHint}>
        {t('ads.placeholderSize')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  sizeHint: {
    opacity: 0.6,
  },
});
