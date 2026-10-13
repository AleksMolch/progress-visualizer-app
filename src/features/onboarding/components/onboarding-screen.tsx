/**
 * Назначение: экран одного шага онбординга (презентационный компонент).
 *
 * Функции:
 * - показывает иконку, заголовок и описание шага;
 * - кнопка «Пропустить» в правом верхнем углу (доступна на каждом шаге);
 * - индикаторы прогресса (точки) и кнопка «Далее»/«Начать».
 *
 * Слой: UI (/src/features/onboarding/components). Данные и действия приходят
 * через пропсы; навигация и запись флага — в экране /src/app/onboarding.tsx.
 */

import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Имя иконки Ionicons (валидируется типами библиотеки). */
export type OnboardingIconName = ComponentProps<typeof Ionicons>['name'];

interface OnboardingScreenProps {
  /** Заголовок шага. */
  title: string;
  /** Описание шага. */
  description: string;
  /** Имя иконки Ionicons для иллюстрации. */
  icon: OnboardingIconName;
  /** Индекс текущего шага (с нуля). */
  currentStep: number;
  /** Всего шагов. */
  totalSteps: number;
  /** Последний ли это шаг (меняет подпись кнопки). */
  isLast?: boolean;
  /** Перейти к следующему шагу или завершить. */
  onNext: () => void;
  /** Пропустить онбординг. */
  onSkip: () => void;
}

export function OnboardingScreen({
  title,
  description,
  icon,
  currentStep,
  totalSteps,
  isLast = false,
  onNext,
  onSkip,
}: OnboardingScreenProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <View style={styles.root}>
      {/* Пропуск доступен на любом шаге. */}
      <View style={styles.skipRow}>
        <AppButton label={t('onboarding.skip')} variant="ghost" onPress={onSkip} />
      </View>

      {/* Иллюстрация и текст шага. */}
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
          <Ionicons name={icon} size={96} color={colors.primary} />
        </View>
        <AppText variant="title" style={styles.title}>
          {title}
        </AppText>
        <AppText color="textSecondary" style={styles.description}>
          {description}
        </AppText>
      </View>

      {/* Индикаторы прогресса и кнопка перехода. */}
      <View style={styles.bottom}>
        <View
          style={styles.indicators}
          accessibilityLabel={t('onboarding.stepLabel', {
            current: currentStep + 1,
            total: totalSteps,
          })}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor: index === currentStep ? colors.primary : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <AppButton label={isLast ? t('onboarding.start') : t('onboarding.next')} onPress={onNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
  },
  skipRow: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
  bottom: {
    gap: spacing.lg,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
