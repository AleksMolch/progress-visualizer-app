/**
 * Назначение: модальное окно подтверждения экспорта фото в галерею.
 *
 * Функции:
 * - предупреждает, что после сохранения фото станет доступно другим приложениям;
 * - кнопки «Сохранить» (onConfirm) и «Отмена» (onCancel).
 *
 * Слой: UI (/src/features/gallery/components). Сохранение выполняет вызывающий
 * код через storage-слой (mediaLibrary.ts).
 *
 * Важно (privacy): экспорт происходит ТОЛЬКО после явного подтверждения.
 */

import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

interface ExportConfirmationModalProps {
  /** Видно ли окно. */
  visible: boolean;
  /** Подтвердить и экспортировать. */
  onConfirm: () => void;
  /** Закрыть без экспорта. */
  onCancel: () => void;
}

export function ExportConfirmationModal({
  visible,
  onConfirm,
  onCancel,
}: ExportConfirmationModalProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => {}}>
          <AppText variant="subtitle">{t('export.confirmTitle')}</AppText>
          <AppText color="textSecondary">{t('export.confirmMessage')}</AppText>

          <View style={styles.actions}>
            <AppButton label={t('export.cancelButton')} variant="secondary" onPress={onCancel} />
            <AppButton label={t('export.confirmButton')} onPress={onConfirm} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
