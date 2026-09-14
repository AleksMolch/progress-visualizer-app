/**
 * Назначение: панель управления overlay и сеткой на экране камеры.
 *
 * Функции:
 * - переключатель ghost overlay (on/off);
 * - доступная кнопка «Призрак 90%» (временный быстрый показ, hold-to-peek аналог);
 * - слайдер видимости overlay;
 * - переключатель сетки (on/off).
 *
 * Слой: UI (/src/features/camera/components). Состояние читает/меняет через
 * useSettingsStore; временный режим быстрого показа управляется родителем
 * (camera.tsx) через пропсы isPeekActive/onSetPeek.
 */

import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useSettingsStore } from '@/store/settingsStore';
import { radii, spacing, type ThemeColors } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

interface OverlayControlsProps {
  /** Есть ли фото для overlay (false — overlay недоступен). */
  hasPhoto: boolean;
  /** Активен ли временный режим быстрого показа. */
  isPeekActive: boolean;
  /** Управляет временным режимом быстрого показа (родитель хранит состояние). */
  onSetPeek: (active: boolean) => void;
}

export function OverlayControls({ hasPhoto, isPeekActive, onSetPeek }: OverlayControlsProps) {
  const { colors } = useAppTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // Overlay можно включать только при наличии фото.
  const ghostEnabled = settings.ghostEnabled && hasPhoto;

  return (
    <View style={[styles.panel, { backgroundColor: colors.surface }]}>
      <View style={styles.row}>
        <ToggleChip
          label="Призрак"
          active={ghostEnabled}
          disabled={!hasPhoto}
          onPress={() => updateSettings({ ghostEnabled: !settings.ghostEnabled })}
        />
        <ToggleChip
          label="Призрак 90%"
          active={isPeekActive}
          disabled={!hasPhoto}
          onPress={() => onSetPeek(!isPeekActive)}
        />
        <ToggleChip
          label="Сетка"
          active={settings.gridEnabled}
          onPress={() => updateSettings({ gridEnabled: !settings.gridEnabled })}
        />
      </View>

      <View style={styles.sliderBlock}>
        <AppText variant="caption" color="textSecondary">
          Видимость призрака {Math.round(settings.ghostOpacity * 100)}%
        </AppText>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          value={settings.ghostOpacity}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          onValueChange={(value) => {
            // Начало изменения ползунка выходит из быстрого показа.
            onSetPeek(false);
            updateSettings({ ghostOpacity: value });
          }}
          accessibilityLabel="Видимость ghost overlay"
        />
      </View>

      {isPeekActive ? (
        <AppText variant="caption" color="textSecondary">
          Действует временный режим 90% — отпустите или нажмите кнопку ещё раз.
        </AppText>
      ) : null}
    </View>
  );
}

/**
 * Компактный чип-переключатель (on/off) в стиле селектора проекта.
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
  panel: {
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
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
  sliderBlock: {
    gap: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 32,
  },
});
