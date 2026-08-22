/**
 * Назначение: хранилище общего состояния приложения (Zustand store).
 *
 * Функции:
 * - хранит идентификатор активного проекта (для камеры и просмотра);
 * - персистится в зашифрованное MMKV.
 *
 * Слой: state (/src/store). Использует storage-слой для персистентности.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/storage/mmkv';

interface AppState {
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  /** Разблокировано ли приложение в текущей сессии (не персистится). */
  isUnlocked: boolean;
  setUnlocked: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeProjectId: null,
      // По умолчанию приложение заблокировано, пока gate не решит иначе.
      isUnlocked: false,

      // Устанавливает активный проект (null — проект не выбран).
      setActiveProjectId: (id) => set({ activeProjectId: id }),

      // Управляет состоянием разблокировки в рамках сессии.
      setUnlocked: (value) => set({ isUnlocked: value }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Персистим только данные, без действий и без состояния сессии.
      partialize: (state) => ({ activeProjectId: state.activeProjectId }),
      // Гидратация выполняется вручную после инициализации MMKV.
      skipHydration: true,
    },
  ),
);
