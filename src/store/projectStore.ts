/**
 * Назначение: хранилище проектов и метаданных фото (Zustand store).
 *
 * Функции:
 * - создание/обновление/удаление проектов;
 * - добавление/удаление метаданных фото;
 * - saveCapturedPhoto(input): копирует снятый кадр в sandbox и добавляет метаданные;
 * - персистентность в зашифрованное MMKV.
 *
 * Слой: state (/src/store). Работает с файлами только через storage-слой
 * (photoFiles), UI файловую систему напрямую не трогает.
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { type PhotoMetadata } from '@/models/photo';
import { type Project, type ProjectReferenceMode } from '@/models/project';
import { mmkvStorage } from '@/storage/mmkv';
import {
  deletePhotoFile,
  deleteProjectPhotoDirectory,
  savePhotoToProject,
} from '@/storage/photoFiles';
import { generateId } from '@/utils/ids';

/** Входные данные для сохранения снятого кадра. */
interface SaveCapturedPhotoInput {
  projectId: string;
  tempUri: string;
  width?: number;
  height?: number;
}

interface ProjectState {
  projects: Project[];
  photos: PhotoMetadata[];
  createProject: (name: string) => void;
  updateProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  setProjectReference: (
    id: string,
    referenceMode: ProjectReferenceMode,
    referencePhotoId?: string | null,
  ) => void;
  addPhoto: (photo: PhotoMetadata) => void;
  updatePhoto: (id: string, partial: Partial<PhotoMetadata>) => void;
  deletePhoto: (id: string) => void;
  saveCapturedPhoto: (input: SaveCapturedPhotoInput) => Promise<void>;
}

// Создаёт объект проекта с идентификатором и метками времени.
function buildProject(name: string): Project {
  const now = Date.now();
  return { id: generateId(), name, createdAt: now, updatedAt: now };
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      photos: [],

      // Создание проекта: добавляем в список.
      createProject: (name) =>
        set((state) => ({ projects: [...state.projects, buildProject(name)] })),

      // Обновление проекта: меняем имя и метку времени изменения.
      updateProject: (id, name) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p,
          ),
        })),

      // Удаление проекта: удаляем проект, все его метаданные фото и файлы.
      deleteProject: (id) => {
        // Физическое удаление папки с фото проекта из sandbox.
        deleteProjectPhotoDirectory(id);
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          photos: state.photos.filter((photo) => photo.projectId !== id),
        }));
      },

      // Установка источника эталонного фото для ghost overlay.
      // Для non-manual режимов referencePhotoId очищается; для manual — сохраняется.
      setProjectReference: (id, referenceMode, referencePhotoId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  referenceMode,
                  referencePhotoId:
                    referenceMode === 'manual' ? (referencePhotoId ?? p.referencePhotoId ?? null) : null,
                  updatedAt: Date.now(),
                }
              : p,
          ),
        })),

      // Добавление метаданных фото (вызывающий код сам формирует объект).
      addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),

      // Частичное обновление метаданных фото (заметка/избранное/скрытие).
      // Файл фото при этом НЕ трогается — только метаданные.
      updatePhoto: (id, partial) =>
        set((state) => ({
          photos: state.photos.map((photo) => (photo.id === id ? { ...photo, ...partial } : photo)),
        })),

      // Удаление метаданных фото и его файла из sandbox по идентификатору.
      deletePhoto: (id) => {
        const photo = get().photos.find((p) => p.id === id);
        if (photo) {
          deletePhotoFile(photo.uri);
        }
        set((state) => ({ photos: state.photos.filter((photo) => photo.id !== id) }));
      },

      // Сохранение снятого кадра: копирует файл в sandbox и пишет метаданные.
      // UI не трогает файловую систему — вся работа с файлами здесь, через storage-слой.
      saveCapturedPhoto: async ({ projectId, tempUri, width, height }) => {
        const uri = await savePhotoToProject(projectId, tempUri);
        const photo: PhotoMetadata = {
          id: generateId(),
          projectId,
          uri,
          takenAt: Date.now(),
          width,
          height,
        };
        set((state) => ({ photos: [...state.photos, photo] }));
      },
    }),
    {
      name: 'project-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Персистим только данные, без действий.
      partialize: (state) => ({ projects: state.projects, photos: state.photos }),
      // Гидратация выполняется вручную после инициализации MMKV.
      skipHydration: true,
    },
  ),
);
