/**
 * Назначение: секция настроек «Оформление» и «Цветовой режим».
 *
 * Функции:
 * - выбор визуального оформления из трёх вариантов (с искусственным превью);
 * - выбор цветового режима: системный / светлый / тёмный;
 * - выбор применяется сразу через settingsStore и персистится.
 *
 * Слой: UI (/src/features/settings/components). Палитру оформлений берёт из
 * DESIGN_THEMES; состояние — из useSettingsStore. Не монтирует настоящий
 * навигатор/камеру внутри превью.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { type DesignThemeId, type ThemeMode } from '@/models/settings';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import {
  DESIGN_THEME_IDS,
  DESIGN_THEMES,
  type DesignThemeDefinition,
} from '@/theme/design-themes';
import { useAppTheme } from '@/theme/ThemeProvider';

// Короткие описания оформлений (UI-текст, не логика темы).
const THEME_DESCRIPTIONS: Record<DesignThemeId, string> = {
  minimalism: 'Простой и лёгкий интерфейс',
  'liquid-glass': 'Стеклянные поверхности и плавающее меню',
  gallery: 'Крупные фото и выразительная типографика',
};

// Варианты цветового режима с подписями.
const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'Как в системе' },
  { value: 'light', label: 'Светлый' },
  { value: 'dark', label: 'Тёмный' },
];

export function AppearanceSettingsCard() {
  const { colors, metrics } = useAppTheme();
  const designTheme = useSettingsStore((s) => s.settings.designTheme);
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <View style={styles.block}>
      <AppText variant="subtitle">Оформление</AppText>

      <View style={styles.themeList}>
        {DESIGN_THEME_IDS.map((id) => {
          const def = DESIGN_THEMES[id];
          const selected = designTheme === id;
          return (
            <Pressable
              key={id}
              onPress={() => updateSettings({ designTheme: id })}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Оформление: ${def.label}`}
              style={[
                styles.themeCard,
                {
                  backgroundColor: colors.surface,
                  borderRadius: metrics.cardRadius,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <ThemePreview def={def} />
              <View style={styles.themeText}>
                <AppText variant="subtitle">{def.label}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {THEME_DESCRIPTIONS[id]}
                </AppText>
              </View>
              <Ionicons
                name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={selected ? colors.primary : colors.border}
              />
            </Pressable>
          );
        })}
      </View>

      <AppText variant="subtitle">Цветовой режим</AppText>
      <View style={styles.modeRow}>
        {THEME_MODES.map((mode) => {
          const selected = themeMode === mode.value;
          return (
            <Pressable
              key={mode.value}
              onPress={() => updateSettings({ themeMode: mode.value })}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Цветовой режим: ${mode.label}`}
              style={[
                styles.modeChip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                },
              ]}>
              <AppText
                variant="caption"
                color={selected ? 'primaryText' : 'text'}>
                {mode.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * Искусственное превью оформления: цветная мини-карточка и мини-таббар.
 * Строится на палитре темы, без пользовательских фото и реального навигатора.
 */
function ThemePreview({ def }: { def: DesignThemeDefinition }) {
  const palette = def.light;

  return (
    <View style={styles.preview}>
      <View
        style={[
          styles.previewCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}>
        <View style={[styles.previewCover, { backgroundColor: palette.primary }]} />
        <View style={styles.previewLines}>
          <View style={[styles.previewLine, { backgroundColor: palette.text }]} />
          <View
            style={[styles.previewLineShort, { backgroundColor: palette.textSecondary }]}
          />
        </View>
      </View>
      <View
        style={[
          styles.previewTabBar,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}>
        <View style={[styles.previewDot, { backgroundColor: palette.textSecondary }]} />
        <View style={[styles.previewDot, { backgroundColor: palette.primary }]} />
        <View style={[styles.previewDot, { backgroundColor: palette.textSecondary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  themeList: {
    gap: spacing.sm,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  themeText: {
    flex: 1,
    gap: spacing.xs,
  },
  preview: {
    gap: spacing.xs,
  },
  previewCard: {
    width: 56,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewCover: {
    height: 20,
  },
  previewLines: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 6,
  },
  previewLine: {
    height: 3,
    borderRadius: 2,
    width: '80%',
  },
  previewLineShort: {
    height: 3,
    borderRadius: 2,
    width: '55%',
  },
  previewTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: 56,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
});
