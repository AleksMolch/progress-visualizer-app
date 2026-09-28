/**
 * Назначение: лёгкий toast-компонент (временное сообщение внизу экрана).
 *
 * Функции:
 * - ToastProvider: провайдер + контейнер показа;
 * - useToast(): хук, возвращающий show(message) для показа сообщения.
 *
 * Слой: UI (/src/components/ui). Без внешних зависимостей (Animated из RN).
 * Используется для результатов действий (например, экспорт фото в галерею).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastContextValue {
  /** Показать сообщение на ~2.5 сек. */
  show: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Длительность показа (мс).
const TOAST_DURATION_MS = 2500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));

  const show = useCallback(
    (msg: string) => {
      setMessage(msg);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    },
    [opacity],
  );

  // Автоскрытие через TOAST_DURATION_MS.
  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(
        () => setMessage(null),
      );
    }, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [message, opacity]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { bottom: insets.bottom + 88, opacity }]}>
          <Text style={styles.text}>{message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

/** Хук доступа к toast. Должен вызываться внутри ToastProvider. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast должен вызываться внутри ToastProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '86%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(20,22,26,0.92)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});
