/**
 * Назначение: модальное окно выбора источника эталонного фото (ghost overlay).
 *
 * Функции:
 * - три варианта: «Последнее фото», «Первое фото», «Выбрать вручную»;
 * - показывает превью текущего manual-эталона, если он выбран;
 * - предупреждает, если manual-эталон пропал (удалён/скрыт) и его нужно перевыбрать.
 *
 * Слой: UI (/src/features/camera/components). Режим проекта меняет вызывающий код
 * через store; выбор ручного фото открывает PhotoPickerSheet.
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { type MessageKey } from '@/i18n';
import { useI18n } from '@/i18n';
import { type PhotoMetadata } from '@/models/photo';
import { type ProjectReferenceMode } from '@/models/project';
import { radii, spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

interface GhostReferenceModalProps {
  /** Видно ли окно. */
  visible: boolean;
  /** Текущий режим эталона. */
  mode: ProjectReferenceMode;
  /** Текущий manual-эталон (null — не выбран/выбран latest/first). */
  manualPhoto: PhotoMetadata | null;
  /** Пропал ли manual-эталон (нужно перевыбрать). */
  manualMissing: boolean;
  /** Выбор режима (latest/first). */
  onSelectMode: (mode: ProjectReferenceMode) => void;
  /** Открыть ручной выбор фото. */
  onSelectManual: () => void;
  /** Закрытие окна. */
  onClose: () => void;
}

// Варианты режима с ключами подписей (manual обрабатывается отдельно).
const MODE_OPTIONS: { value: ProjectReferenceMode; label: MessageKey; hint: MessageKey }[] = [
  { value: 'latest', label: 'camera.latest', hint: 'camera.latestHint' },
  { value: 'first', label: 'camera.first', hint: 'camera.firstHint' },
];

export function GhostReferenceModal({
  visible,
  mode,
  manualPhoto,
  manualMissing,
  onSelectMode,
  onSelectManual,
  onClose,
}: GhostReferenceModalProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => {}}>
          <AppText variant="subtitle">{t('camera.ghostSourceTitle')}</AppText>

          {MODE_OPTIONS.map((option) => {
            const selected = mode === option.value;
            return (
              <Pressable
                key={option.value}
                onPress={() => onSelectMode(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={[
                  styles.option,
                  { borderColor: selected ? colors.primary : colors.border },
                ]}>
                <View style={styles.optionText}>
                  <AppText variant="body">{t(option.label)}</AppText>
                  <AppText color="textSecondary" variant="caption">
                    {t(option.hint)}
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

          {/* Ручной выбор: подсвечен при mode === 'manual', показывает превью. */}
          <Pressable
            onPress={onSelectManual}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'manual' }}
            style={[
              styles.option,
              { borderColor: mode === 'manual' ? colors.primary : colors.border },
            ]}>
            <View style={styles.optionText}>
              <AppText variant="body">{t('camera.manual')}</AppText>
              {manualPhoto ? (
                <View style={styles.manualPreview}>
                  <Image
                    source={{ uri: manualPhoto.uri }}
                    style={styles.manualThumb}
                    contentFit="cover"
                  />
                  <AppText color="textSecondary" variant="caption">
                    {t('camera.manualSelected')}
                  </AppText>
                </View>
              ) : (
                <AppText color="textSecondary" variant="caption">
                  {t('camera.manualHint')}
                </AppText>
              )}
            </View>
            <Ionicons
              name={mode === 'manual' ? 'checkmark-circle' : 'chevron-forward'}
              size={22}
              color={mode === 'manual' ? colors.primary : colors.border}
            />
          </Pressable>

          {manualMissing ? (
            <AppText color="textSecondary" variant="caption">
              {t('camera.manualMissing')}
            </AppText>
          ) : null}

          <Pressable onPress={onClose} accessibilityRole="button" style={styles.close}>
            <AppText variant="subtitle" color="primary">
              {t('common.done')}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  optionText: {
    flex: 1,
    gap: spacing.xs,
  },
  manualPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  manualThumb: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
  },
  close: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
