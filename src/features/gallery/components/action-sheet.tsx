/**
 * Назначение: нижний лист действий (generic action sheet).
 *
 * Функции:
 * - показывает список действий (с иконками, опционально destructive/disabled);
 * - используется в просмотрщике фото и на compare screen для выбора пары.
 *
 * Слой: UI (/src/features/gallery/components). Действия возвращает вызывающему
 * коду через onPress каждого элемента.
 */

import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Одно действие в листе. */
export interface ActionSheetAction {
  key: string;
  /** Подпись действия. */
  label: string;
  /** Иконка (Ionicons) или undefined. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Обработчик нажатия. */
  onPress: () => void;
  /** Действие недоступно. */
  disabled?: boolean;
  /** Деструктивное действие (красный текст). */
  destructive?: boolean;
}

interface ActionSheetProps {
  /** Виден ли лист. */
  visible: boolean;
  /** Заголовок листа. */
  title?: string;
  /** Список действий. */
  actions: ActionSheetAction[];
  /** Закрытие листа. */
  onClose: () => void;
}

export function ActionSheet({ visible, title, actions, onClose }: ActionSheetProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.md }]}
          onPress={() => {}}>
          <View style={styles.handle} />
          {title ? <AppText variant="subtitle">{title}</AppText> : null}

          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={action.disabled ? undefined : action.onPress}
              disabled={action.disabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: action.disabled }}
              style={[styles.row, action.disabled && styles.rowDisabled]}>
              {action.icon ? (
                <Ionicons
                  name={action.icon}
                  size={20}
                  color={action.destructive ? colors.danger : colors.text}
                />
              ) : (
                <View style={styles.iconSpacer} />
              )}
              <AppText
                variant="body"
                color={action.destructive ? 'danger' : 'text'}>
                {action.label}
              </AppText>
            </Pressable>
          ))}

          <Pressable onPress={onClose} accessibilityRole="button" style={styles.cancel}>
            <AppText variant="subtitle" color="primary">
              {t('common.cancel')}
            </AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDisabled: {
    opacity: 0.4,
  },
  iconSpacer: {
    width: 20,
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
});
