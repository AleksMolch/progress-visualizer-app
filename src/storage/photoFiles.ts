/**
 * Назначение: хранение файлов фотографий в приватной директории приложения (sandbox).
 *
 * Функции:
 * - ensureAppPhotoDirectory(): гарантирует существование корневой папки фото.
 * - createProjectPhotoDirectory(projectId): создаёт папку конкретного проекта.
 * - savePhotoToProject(projectId, tempUri): копирует снимок в папку проекта.
 * - deletePhotoFile(uri): удаляет один файл фото.
 * - deleteProjectPhotoDirectory(projectId): удаляет папку проекта со всеми фото.
 *
 * Слой: storage (/src/storage). Единственное место работы с файловой системой
 * для фото. UI не должен обращаться к FileSystem напрямую.
 *
 * Важно (privacy): файлы хранятся только в document-директории приложения.
 * В общую галерею фото НЕ сохраняются автоматически — экспорт возможен только
 * по явному действию пользователя (Фаза 13).
 */

import { Directory, File, Paths } from 'expo-file-system';

import { generateId } from '@/utils/ids';

// Имя корневой папки, где лежат все фото всех проектов.
const PHOTOS_ROOT_DIR_NAME = 'photos';

// Расширение по умолчанию, если у исходного файла его не удалось определить.
const DEFAULT_PHOTO_EXTENSION = '.jpg';

// Возвращает объект корневой папки фото (не создаёт её на диске).
function rootDirectory(): Directory {
  return new Directory(Paths.document, PHOTOS_ROOT_DIR_NAME);
}

// Возвращает объект папки конкретного проекта (не создаёт её на диске).
function projectDirectory(projectId: string): Directory {
  return new Directory(rootDirectory(), projectId);
}

/**
 * Гарантирует существование корневой папки фото в sandbox приложения.
 * Идемпотентно: повторный вызов не создаёт дублей и не падает.
 */
export function ensureAppPhotoDirectory(): Directory {
  const dir = rootDirectory();
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/**
 * Создаёт папку для фото конкретного проекта (и корневую, если нужно).
 * Идемпотентно: повторный вызов не создаёт дублей и не падает.
 */
export function createProjectPhotoDirectory(projectId: string): Directory {
  ensureAppPhotoDirectory();
  const dir = projectDirectory(projectId);
  if (!dir.exists) {
    dir.create({ intermediates: true, idempotent: true });
  }
  return dir;
}

/**
 * Сохраняет снимок из временного файла в приватную папку проекта.
 *
 * @param projectId — идентификатор проекта.
 * @param tempUri — временный путь к снятому кадру (например, из камеры).
 * @returns постоянный uri файла внутри sandbox приложения.
 *
 * Важно: используется копирование, а не перемещение — временный файл остаётся
 * нетронутым (его чистит кэш камеры). В общую галерею ничего не пишется.
 */
export async function savePhotoToProject(
  projectId: string,
  tempUri: string,
): Promise<string> {
  const dir = createProjectPhotoDirectory(projectId);

  const source = new File(tempUri);
  const extension = source.extension || DEFAULT_PHOTO_EXTENSION;
  const destination = new File(dir, `${generateId()}${extension}`);

  await source.copy(destination);
  return destination.uri;
}

/**
 * Удаляет один файл фото по его uri (если файл существует).
 */
export function deletePhotoFile(uri: string): void {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

/**
 * Удаляет папку проекта вместе со всеми её фото.
 * Вызывается при удалении проекта (вместе с удалением метаданных из store).
 */
export function deleteProjectPhotoDirectory(projectId: string): void {
  const dir = projectDirectory(projectId);
  if (dir.exists) {
    dir.delete();
  }
}
