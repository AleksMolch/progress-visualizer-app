// Тесты storage-слоя фотографий.
// Проверяем создание папок, сохранение снимка в sandbox и удаление файлов.
// expo-file-system замокан in-memory (см. __mocks__/expo-file-system.ts).

import { Directory, File } from 'expo-file-system';

import {
  createProjectPhotoDirectory,
  deletePhotoFile,
  deleteProjectPhotoDirectory,
  ensureAppPhotoDirectory,
  savePhotoToProject,
} from './photoFiles';

// Корневая папка фото, как в photoFiles.ts (Path.document/photos).
function rootPhotoDirectory(): Directory {
  return new Directory('file:///document', 'photos');
}

// Создаёт временный файл-источник в in-memory файловой системе.
function seedTempFile(uri: string, content: string): void {
  const file = new File(uri);
  file.create();
  file.write(content);
}

describe('photoFiles', () => {
  it('создаёт корневую папку фото', () => {
    ensureAppPhotoDirectory();

    expect(rootPhotoDirectory().exists).toBe(true);
  });

  it('создаёт папку проекта и корневую папку', () => {
    createProjectPhotoDirectory('project-a');

    expect(rootPhotoDirectory().exists).toBe(true);
    expect(new Directory(rootPhotoDirectory(), 'project-a').exists).toBe(true);
  });

  it('инициализация идемпотентна (повторный вызов не падает)', () => {
    ensureAppPhotoDirectory();
    createProjectPhotoDirectory('project-a');

    expect(() => {
      ensureAppPhotoDirectory();
      createProjectPhotoDirectory('project-a');
    }).not.toThrow();
  });

  it('сохраняет фото в приватную папку проекта', async () => {
    const tempUri = 'file:///tmp/capture.jpg';
    seedTempFile(tempUri, 'image-bytes');

    const uri = await savePhotoToProject('project-a', tempUri);

    const saved = new File(uri);
    expect(saved.exists).toBe(true);
    // Файл лежит внутри папки проекта.
    expect(uri).toContain('file:///document/photos/project-a/');
    // Содержимое скопировано корректно.
    await expect(saved.text()).resolves.toBe('image-bytes');
  });

  it('подставляет расширение по умолчанию, если у источника его нет', async () => {
    const tempUri = 'file:///tmp/capture-without-extension';
    seedTempFile(tempUri, 'image-bytes');

    const uri = await savePhotoToProject('project-a', tempUri);

    expect(uri).toContain('.jpg');
    expect(new File(uri).exists).toBe(true);
  });

  it('удаляет один файл фото', async () => {
    const tempUri = 'file:///tmp/capture.jpg';
    seedTempFile(tempUri, 'image-bytes');
    const uri = await savePhotoToProject('project-a', tempUri);

    deletePhotoFile(uri);

    expect(new File(uri).exists).toBe(false);
  });

  it('удаление несуществующего файла не падает', () => {
    expect(() => deletePhotoFile('file:///document/photos/nope.jpg')).not.toThrow();
  });

  it('удаляет папку проекта вместе со всеми фото', async () => {
    const tempUri = 'file:///tmp/capture.jpg';
    seedTempFile(tempUri, 'image-bytes');
    const uri = await savePhotoToProject('project-a', tempUri);

    deleteProjectPhotoDirectory('project-a');

    expect(new Directory(rootPhotoDirectory(), 'project-a').exists).toBe(false);
    expect(new File(uri).exists).toBe(false);
  });
});
