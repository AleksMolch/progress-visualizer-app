/**
 * Назначение: панель управления overlay и сеткой на экране камеры.
 *
 * Функции:
 * - переключатель ghost overlay (on/off), сетки и выбор эталона в одном ряду;
 * - слайдер видимости overlay с подписью процента в одной компактной строке;
 * - слайдер и подпись показывают ОДНО значение — фактическую видимость
 *   (effectiveOpacity), а не сохранённую настройку (иначе «врёт» при усилении);
 * - компактный баннер «Призрак усилен» над панелью (не раздувает панель).
 *
 * Слой: UI (/src/features/camera/components). Состояние читает/меняет через
 * useSettingsStore; выбор источника — через колбэк onOpenReference.
 */

import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing, type ThemeColors } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

interface OverlayControlsProps {
  /** Есть ли фото для overlay (false — overlay недоступен). */
  hasPhoto: boolean;
  /** Активно ли временное усиление призрака (tap по превью). */
  isBoosted: boolean;
  /** Фактическая видимость призрака (0..1) — то, что реально показано на экране. */
  effectiveOpacity: number;
  /** Подпись текущего источника эталона («Последнее» / «Первое» / «Вручную»). */
  referenceLabel: string;
  /** Открыть окно выбора источника эталона. */
  onOpenReference: () => void;
  /** Сброс временного усиления (при начале движения ползунка). */
  onResetBoost: () => void;
}

export function OverlayControls({
  hasPhoto,
  isBoosted,
  effectiveOpacity,
  referenceLabel,
  onOpenReference,
  onResetBoost,
}: OverlayControlsProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // Overlay можно включать только при наличии фото.
  const ghostEnabled = settings.ghostEnabled && hasPhoto;

  // Процент фактической видимости (совпадает со слайдером).
  const percent = Math.round(effectiveOpacity * 100);

  return (
    <View>
      {/* Компактный баннер усиления — над панелью, чтобы панель не «прыгала». */}
      {isBoosted ? (
        <View style={styles.hintBanner}>
          <AppText variant="caption" color="primaryText">
            {t('camera.boostedShort')}
          </AppText>
        </View>
      ) : null}

      <View style={[styles.panel, { backgroundColor: colors.surface }]}>
        <View style={styles.row}>
          <ToggleChip
            label={t('camera.ghost')}
            active={ghostEnabled}
            disabled={!hasPhoto}
            onPress={() => updateSettings({ ghostEnabled: !settings.ghostEnabled })}
          />
          <ToggleChip
            label={t('camera.grid')}
            active={settings.gridEnabled}
            onPress={() => updateSettings({ gridEnabled: !settings.gridEnabled })}
          />
          <Pressable
            onPress={onOpenReference}
            disabled={!hasPhoto}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('camera.ghostSourceTitle')}
            style={[styles.chip, { borderColor: colors.border }, !hasPhoto && styles.chipDisabled]}>
            <AppText variant="caption">{t('camera.referenceLabel', { source: referenceLabel })}</AppText>
          </Pressable>
        </View>

        <View style={styles.sliderRow}>
          <AppText variant="caption" color="textSecondary" style={styles.percentLabel}>
            {percent}%
          </AppText>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.05}
            value={effectiveOpacity}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
            onSlidingStart={onResetBoost}
            onValueChange={(value) => {
              // Значение пишется в настройки; усиление уже снято onSlidingStart,
              // поэтому 0.85 не попадёт в постоянную настройку.
              updateSettings({ ghostOpacity: value });
            }}
            accessibilityLabel={t('camera.visibility', { percent })}
          />
        </View>
      </View>
    </View>
  );
}

/**
 * Компактный чип-переключатель (on/off) с touch target не меньше 44×44.
 */
function ToggleChip({
  label,
  active,
  disabled = false,
  onPress,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const backgroundColor = active ? colors.primary : colors.background;
  const textColor: keyof ThemeColors = active ? 'primaryText' : 'text';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled }}
      style={[
        styles.chip,
        { backgroundColor, borderColor: colors.border },
        disabled && styles.chipDisabled,
      ]}>
      <AppText variant="caption" color={textColor}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hintBanner: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    backgroundColor: 'rgba(20,22,26,0.75)',
  },
  panel: {
    borderRadius: radii.lg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  percentLabel: {
    minWidth: 40,
    textAlign: 'right',
  },
  slider: {
    flex: 1,
    height: 28,
  },
});
