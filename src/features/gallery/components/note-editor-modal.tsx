/**
 * Назначение: модальное окно редактирования заметки к фото.
 *
 * Функции:
 * - многострочный ввод заметки (до 240 символов);
 * - тап по затемнённому фону скрывает только клавиатуру (не закрывает окно);
 * - закрытие — только кнопками «Сохранить»/«Отмена»;
 * - при отмене с несохранёнными изменениями запрашивается подтверждение;
 * - окно приподнимается над клавиатурой (KeyboardAvoidingView), содержимое
 *   прокручивается на маленьких экранах.
 *
 * Слой: UI (/src/features/gallery/components). Сохранение выполняет вызывающий
 * код через store (updatePhoto). Пустая строка удаляет заметку.
 */

import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
  const [note, setNote] = useState(initialNote);

  // Есть ли несохранённые изменения (сравнение с исходным текстом).
  const isDirty = note !== initialNote;

  const handleSave = () => {
    onSave(note.trim());
  };

  // Отмена: при изменённом тексте сначала подтверждение потери изменений.
  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(t('note.discardTitle'), t('note.discardMessage'), [
        { text: t('note.keepEditing'), style: 'cancel' },
        { text: t('note.discard'), style: 'destructive', onPress: onClose },
      ]);
      return;
    }
    onClose();
  };

  // Тап по фону: скрывает только клавиатуру, окно остаётся открытым.
  const handleBackdropPress = () => {
    Keyboard.dismiss();
  };

  // Android Back: сначала скрывает клавиатуру (если открыта), затем учитывает
  // несохранённые изменения (подтверждение).
  const handleRequestClose = () => {
    if (isDirty) {
      Alert.alert(t('note.discardTitle'), t('note.discardMessage'), [
        { text: t('note.keepEditing'), style: 'cancel' },
        { text: t('note.discard'), style: 'destructive', onPress: onClose },
      ]);
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleRequestClose}>
      <Pressable style={styles.backdrop} onPress={handleBackdropPress}>
        <KeyboardAvoidingView
          style={styles.avoider}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* Внутренний Pressable гасит тап по карточке, чтобы не закрыть/не спрятать окно. */}
          <Pressable
            style={[styles.card, { backgroundColor: colors.surface }]}
            onPress={() => {}}>
            <AppText variant="subtitle">{t('note.title')}</AppText>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder={t('note.placeholder')}
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
                <AppButton label={t('common.cancel')} variant="secondary" onPress={handleCancel} />
                <AppButton label={t('common.save')} onPress={handleSave} />
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
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
  avoider: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  scrollContent: {
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
