/**
 * Назначение: модальное окно ввода имени проекта (создание/редактирование).
 *
 * Функции:
 * - показывает текстовое поле для имени проекта;
 * - вызывает onSave с очищенным именем при подтверждении;
 * - закрывается по кнопке «Отмена» или тапу вне окна.
 *
 * Слой: UI (/src/features/projects/components). Состояние формы — локальное,
 * сохранение выполняет вызывающий код через store.
 *
 * Примечание: компонент монтируется вызывающим кодом только на время показа —
 * поэтому начальное имя задаётся один раз при монтировании (без useEffect).
 */

import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

interface ProjectFormModalProps {
  /** Начальное имя (для редактирования; пусто — для создания). */
  initialName?: string;
  /** Заголовок окна. */
  title: string;
  /** Подтвердить и сохранить имя. */
  onSave: (name: string) => void;
  /** Закрыть без сохранения. */
  onCancel: () => void;
}

export function ProjectFormModal({
  initialName = '',
  title,
  onSave,
  onCancel,
}: ProjectFormModalProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const [name, setName] = useState(initialName);

  // Имя не должно быть пустым или состоять только из пробелов.
  const trimmed = name.trim();
  const canSave = trimmed.length > 0;

  const handleSave = () => {
    if (canSave) {
      onSave(trimmed);
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        {/* Внутренний Pressable гасит клик, чтобы тап по окну не закрывал его. */}
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => {}}>
          <AppText variant="subtitle">{title}</AppText>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('projects.namePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
          />

          <View style={styles.actions}>
            <AppButton label={t('common.cancel')} variant="secondary" onPress={onCancel} />
            <AppButton label={t('common.save')} onPress={handleSave} disabled={!canSave} />
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
  input: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
