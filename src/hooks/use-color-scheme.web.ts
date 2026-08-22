/**
 * Назначение: хук определения цветовой схемы для web-платформы.
 *
 * Функции:
 * - возвращает системную цветовую схему;
 * - при статическом рендеринге (SSR) до гидратации возвращает 'light'.
 *
 * Слой: UI (hook). Код шаблона Expo, будет заменён при настройке навигации (Фаза 2).
 */

import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Заглушка подписки: внешнего хранилища нет, нужна только для контракта useSyncExternalStore.
const emptySubscribe = () => () => {};

export function useColorScheme() {
  const colorScheme = useRNColorScheme();

  // Флаг гидратации: на сервере (SSR) — false, после гидратации на клиенте — true.
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  return hasHydrated ? colorScheme : 'light';
}
