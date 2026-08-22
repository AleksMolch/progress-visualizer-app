/**
 * Назначение: базовый текстовый компонент приложения.
 *
 * Функции:
 * - рендерит текст с вариантами типографики (title/subtitle/body/caption);
 * - красит текст семантическим цветом текущей темы.
 *
 * Слой: UI (/src/components/ui). Использует useAppTheme.
 */

import { Text, type TextProps, type TextStyle } from 'react-native';

import { fontSize, type ThemeColors } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Варианты типографики текста. */
type AppTextVariant = 'title' | 'subtitle' | 'body' | 'caption';

interface AppTextProps extends TextProps {
  /** Вариант типографики. */
  variant?: AppTextVariant;
  /** Семантический цвет текста из палитры темы. */
  color?: keyof ThemeColors;
}

// Стили вариантов текста: размер + насыщенность.
const variantStyles: Record<AppTextVariant, TextStyle> = {
  title: { fontSize: fontSize.xl, fontWeight: '700' },
  subtitle: { fontSize: fontSize.lg, fontWeight: '600' },
  body: { fontSize: fontSize.md, fontWeight: '400' },
  caption: { fontSize: fontSize.sm, fontWeight: '400' },
};

export function AppText({ variant = 'body', color = 'text', style, ...rest }: AppTextProps) {
  const { colors } = useAppTheme();

  return <Text style={[variantStyles[variant], { color: colors[color] }, style]} {...rest} />;
}
