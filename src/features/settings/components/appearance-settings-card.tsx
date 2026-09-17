/**
 * Назначение: секция настроек «Оформление» и «Цветовой режим».
 *
 * Функции:
 * - выбор визуального оформления из доступных на платформе вариантов
 *   (с искусственным превью); на Android «Простой» скрыт;
 * - выбор цветового режима: системный / светлый / тёмный;
 * - выбор применяется сразу через settingsStore и персистится.
 *
 * Слой: UI (/src/features/settings/components). Палитру оформлений берёт из
 * DESIGN_THEMES; список платформы — getPlatformThemeIds; тексты — через useI18n.
 */

import { Ionicons } from '@expo/vector-icons';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { type MessageKey } from '@/i18n';
import { useI18n } from '@/i18n';
import { type DesignThemeId, type ThemeMode } from '@/models/settings';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import {
  DESIGN_THEMES,
  getPlatformThemeIds,
  type DesignThemeDefinition,
} from '@/theme/design-themes';
import { useAppTheme } from '@/theme/ThemeProvider';
import { triggerHaptic } from '@/utils/haptics';

// Ключи названий и описаний оформлений (по id).
const THEME_LABEL_KEYS: Record<DesignThemeId, MessageKey> = {
  modern: 'settings.modern',
  simple: 'settings.simple',
  neumorphism: 'settings.neumorphism',
};
const THEME_DESC_KEYS: Record<DesignThemeId, MessageKey> = {
  modern: 'settings.modernDesc',
  simple: 'settings.simpleDesc',
  neumorphism: 'settings.neumorphismDesc',
};

// Варианты цветового режима с ключами подписей.
const THEME_MODES: { value: ThemeMode; key: MessageKey }[] = [
  { value: 'system', key: 'settings.system' },
  { value: 'light', key: 'settings.light' },
  { value: 'dark', key: 'settings.dark' },
];

export function AppearanceSettingsCard() {
  const { colors, metrics } = useAppTheme();
  const { t } = useI18n();
  const designTheme = useSettingsStore((s) => s.settings.designTheme);
  const themeMode = useSettingsStore((s) => s.settings.themeMode);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // Доступные на этой платформе оформления.
  const platformThemeIds = getPlatformThemeIds(Platform.OS);

  return (
    <View style={styles.block}>
      <AppText variant="subtitle">{t('settings.appearance')}</AppText>

      <View style={styles.themeList}>
        {platformThemeIds.map((id) => {
          const def = DESIGN_THEMES[id];
          const selected = designTheme === id;
          const label = t(THEME_LABEL_KEYS[id]);
          return (
            <Pressable
              key={id}
              onPress={() => {
                updateSettings({ designTheme: id });
                void triggerHaptic('selection', hapticsEnabled);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
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
                <AppText variant="subtitle">{label}</AppText>
                <AppText color="textSecondary" variant="caption">
                  {t(THEME_DESC_KEYS[id])}
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

      <AppText color="textSecondary" variant="caption">
        {t('settings.modernNote')}
      </AppText>

      <AppText variant="subtitle">{t('settings.colorMode')}</AppText>
      <View style={styles.modeRow}>
        {THEME_MODES.map((mode) => {
          const selected = themeMode === mode.value;
          return (
            <Pressable
              key={mode.value}
              onPress={() => updateSettings({ themeMode: mode.value })}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t(mode.key)}
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
                {t(mode.key)}
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
  const palette = def.previewLight;

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
