/**
 * Назначение: экран блокировки с требованием биометрии.
 *
 * Функции:
 * - показывает сообщение и кнопку «Разблокировать»;
 * - при нажатии запускает биометрию; при успехе вызывает onUnlock;
 * - при ошибке показывает подсказку и позволяет повторить.
 *
 * Слой: UI (/src/features/privacy/components). Использует storage-слой
 * (authenticateWithBiometrics), не трогает expo-local-authentication напрямую.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { authenticateWithBiometrics } from '@/storage/biometrics';
import { spacing } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';

interface LockScreenProps {
  /** Вызывается после успешной аутентификации. */
  onUnlock: () => void;
}

export function LockScreen({ onUnlock }: LockScreenProps) {
  const { colors } = useAppTheme();
  const { t } = useI18n();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Запуск биометрии: при успехе разблокируем, при неудаче — показываем ошибку.
  const handleUnlock = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        onUnlock();
      } else {
        setError(t('lock.failed'));
      }
    } catch {
      setError(t('lock.error'));
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <AppText variant="title">{t('lock.title')}</AppText>
        <AppText color="textSecondary" style={styles.description}>
          {t('lock.description')}
        </AppText>

        {error ? (
          <AppText color="danger" variant="caption" style={styles.error}>
            {error}
          </AppText>
        ) : null}

        <AppButton
          label={t('lock.unlock')}
          onPress={handleUnlock}
          loading={isAuthenticating}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    gap: spacing.md,
    maxWidth: 320,
    width: '100%',
  },
  description: {
    textAlign: 'center',
  },
  error: {
    textAlign: 'center',
  },
});
