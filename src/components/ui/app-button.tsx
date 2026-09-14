/**
 * Назначение: базовый компонент кнопки приложения.
 *
 * Функции:
 * - рендерит нажимаемую кнопку с вариантами (primary/secondary/ghost/danger);
 * - поддерживает состояния disabled и loading.
 *
 * Слой: UI (/src/components/ui). Использует useAppTheme.
 */

import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { spacing, type ThemeColors } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Варианты оформления кнопки. */
type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  /** Текст на кнопке. */
  label: string;
  /** Обработчик нажатия. */
  onPress?: () => void;
  /** Вариант оформления. */
  variant?: AppButtonVariant;
  /** Кнопка недоступна. */
  disabled?: boolean;
  /** Показывать индикатор загрузки вместо текста. */
  loading?: boolean;
}

interface ButtonStyle {
  container: ViewStyle;
  textColor: string;
}

// Сопоставление варианта кнопки с цветами фона и текста.
function getButtonStyle(variant: AppButtonVariant, colors: ThemeColors): ButtonStyle {
  switch (variant) {
    case 'primary':
      return { container: { backgroundColor: colors.primary }, textColor: colors.primaryText };
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        },
        textColor: colors.text,
      };
    case 'danger':
      return { container: { backgroundColor: colors.danger }, textColor: colors.primaryText };
    case 'ghost':
      return { container: { backgroundColor: 'transparent' }, textColor: colors.primary };
  }
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: AppButtonProps) {
  const { colors, metrics } = useAppTheme();
  const { container, textColor } = getButtonStyle(variant, colors);
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        { borderRadius: metrics.buttonRadius },
        container,
        inactive && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
