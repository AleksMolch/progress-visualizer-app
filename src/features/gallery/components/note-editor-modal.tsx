/**
 * Назначение: модальное окно редактирования заметки к фото.
 *
 * Функции:
 * - многострочный ввод заметки (до 240 символов);
 * - пустая строка удаляет заметку;
 * - сохранение вызывает onSave, отмена закрывает без изменений.
 *
 * Слой: UI (/src/features/gallery/components). Сохранение выполняет вызывающий
 * код через store (updatePhoto).
 */

import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

/** Максимальная длина заметки (в символах). */
const NOTE_MAX_LENGTH = 240;

interface NoteEditorModalProps {
  /** Видно ли окно. */
  visible: boolean;
  /** Начальная заметка. */
  initialNote: string;
  /** Сохранение заметки (пустая строка — удалить). */
  onSave: (note: string) => void;
  /** Закрытие без сохранения. */
  onClose: () => void;
}

export function NoteEditorModal({ visible, initialNote, onSave, onClose }: NoteEditorModalProps) {
  const { colors } = useAppTheme();
  const [note, setNote] = useState(initialNote);

  const handleSave = () => {
    onSave(note.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => {}}>
          <AppText variant="subtitle">Заметка к фото</AppText>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Например: после тренировки"
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={NOTE_MAX_LENGTH}
            autoFocus
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border },
            ]}
          />

          <AppText color="textSecondary" variant="caption" style={styles.counter}>
            {note.length}/{NOTE_MAX_LENGTH}
          </AppText>

          <View style={styles.actions}>
            <AppButton label="Отмена" variant="secondary" onPress={onClose} />
            <AppButton label="Сохранить" onPress={handleSave} />
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
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  counter: {
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
