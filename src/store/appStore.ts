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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeProjectId: null,

      // Устанавливает активный проект (null — проект не выбран).
      setActiveProjectId: (id) => set({ activeProjectId: id }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Персистим только данные, без действий.
      partialize: (state) => ({ activeProjectId: state.activeProjectId }),
      // Гидратация выполняется вручную после инициализации MMKV.
      skipHydration: true,
    },
  ),
);
