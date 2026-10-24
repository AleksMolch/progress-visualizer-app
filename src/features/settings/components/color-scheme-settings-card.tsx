/**
 * Назначение: секция настроек «Цветовая схема» (3 акцентные палитры).
 *
 * Функции:
 * - показывает три схемы (Графит / Изумруд / Коралл) с превью палитры;
 * - применяет выбор сразу через settingsStore (persist в MMKV);
 * - сообщает текущую схему скринридеру и сопровождает выбор haptic.
 *
 * Слой: UI (/src/features/settings/components). Палитры берёт из COLOR_PALETTES;
 * тексты — через useI18n. Палитра действует поверх любого designTheme и режима.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { type MessageKey, useI18n } from '@/i18n';
import { type ColorPaletteId } from '@/models/settings';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing } from '@/theme';
import { COLOR_PALETTES, COLOR_PALETTE_IDS } from '@/theme/color-palettes';
import { useAppTheme } from '@/theme/ThemeProvider';
import { triggerHaptic } from '@/utils/haptics';

const PALETTE_LABEL_KEYS: Record<ColorPaletteId, MessageKey> = {
  graphite: 'settings.paletteGraphite',
  emerald: 'settings.paletteEmerald',
  coral: 'settings.paletteCoral',
};

const PALETTE_DESC_KEYS: Record<ColorPaletteId, MessageKey> = {
  graphite: 'settings.paletteGraphiteDesc',
  emerald: 'settings.paletteEmeraldDesc',
  coral: 'settings.paletteCoralDesc',
};

export function ColorSchemeSettingsCard() {
  const { scheme } = useAppTheme();
  const { t } = useI18n();
  const colorScheme = useSettingsStore((s) => s.settings.colorScheme);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  return (
    <View style={styles.block}>
      <AppText variant="subtitle">{t('settings.colorScheme')}</AppText>

      <View style={styles.row}>
        {COLOR_PALETTE_IDS.map((id) => {
          const palette = COLOR_PALETTES[id][scheme];
          const selected = colorScheme === id;
          return (
            <Pressable
              key={id}
              onPress={() => {
                updateSettings({ colorScheme: id });
                void triggerHaptic('selection', hapticsEnabled);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${t(PALETTE_LABEL_KEYS[id])}. ${t(PALETTE_DESC_KEYS[id])}`}
              style={[
                styles.card,
                {
                  backgroundColor: palette.surface,
                  borderColor: selected ? palette.primary : palette.border,
                  borderWidth: selected ? 2 : 1,
                },
              ]}>
              <View style={styles.swatches}>
                <View style={[styles.swatch, { backgroundColor: palette.primary }]} />
                <View style={[styles.swatch, { backgroundColor: palette.text }]} />
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: palette.background,
                      borderColor: palette.border,
                      borderWidth: 1,
                    },
                  ]}
                />
              </View>
              <AppText
                variant="caption"
                numberOfLines={1}
                style={[styles.label, { color: palette.text }]}>
                {t(PALETTE_LABEL_KEYS[id])}
              </AppText>
              {selected ? (
                <Ionicons name="checkmark-circle" size={16} color={palette.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <AppText color="textSecondary" variant="caption">
        {t(PALETTE_DESC_KEYS[colorScheme])}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    minHeight: 84,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
  },
  swatches: {
    flexDirection: 'row',
    gap: 4,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  label: {
    textAlign: 'center',
  },
});
