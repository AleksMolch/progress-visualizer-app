/**
 * Назначение: точка входа слоя store и ручная гидратация хранилищ.
 *
 * Функции:
 * - rehydrateStores(): восстанавливает состояние всех персистентных сторов
 *   из MMKV после его инициализации.
 *
 * Слой: state (/src/store).
 */

import { useAppStore } from './appStore';
import { useProjectStore } from './projectStore';
import { useSettingsStore } from './settingsStore';

/** Восстанавливает состояние всех сторов из MMKV. */
export async function rehydrateStores(): Promise<void> {
  await Promise.all([
    useAppStore.persist.rehydrate(),
    useProjectStore.persist.rehydrate(),
    useSettingsStore.persist.rehydrate(),
  ]);
  // Помечаем проекты гидратированными (для skeleton loading).
  useProjectStore.setState({ hasHydrated: true });
}
