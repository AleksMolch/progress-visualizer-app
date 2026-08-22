/**
 * Назначение: gate-компонент, защищающий приложение биометрией.
 *
 * Функции:
 * - при монтировании определяет, нужно ли блокировать приложение
 *   (настройка requireBiometrics + доступность биометрии);
 * - если блокировка нужна и приложение не разблокировано — показывает
 *   LockScreen вместо содержимого;
 * - если биометрия недоступна — не блокирует (fallback).
 *
 * Слой: UI (/src/features/privacy/components). Использует useSettingsStore,
 * useAppStore и storage-слой (isBiometricsAvailable). Это единая точка
 * route protection для всего приложения.
 */

import { useEffect, useState, type ReactNode } from 'react';

import { isBiometricsAvailable } from '@/storage/biometrics';
import { useAppStore } from '@/store/appStore';
import { useSettingsStore } from '@/store/settingsStore';
import { shouldLock } from '@/utils/security';

import { LockScreen } from './lock-screen';

interface BiometricsGateProps {
  children: ReactNode;
}

export function BiometricsGate({ children }: BiometricsGateProps) {
  const requireBiometrics = useSettingsStore((s) => s.settings.requireBiometrics);
  const isUnlocked = useAppStore((s) => s.isUnlocked);
  const setUnlocked = useAppStore((s) => s.setUnlocked);

  // null — ещё определяем доступность биометрии.
  const [available, setAvailable] = useState<boolean | null>(null);

  // При монтировании проверяем доступность биометрии.
  useEffect(() => {
    isBiometricsAvailable().then(setAvailable);
  }, []);

  // Пока не определили доступность — не блокируем (показываем содержимое).
  if (available === null) {
    return <>{children}</>;
  }

  // Блокируем только если защита включена, биометрия доступна и ещё не открыто.
  if (shouldLock(requireBiometrics, available) && !isUnlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return <>{children}</>;
}
