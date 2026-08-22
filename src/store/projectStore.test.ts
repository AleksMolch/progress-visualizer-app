// Тесты хранилища проектов и метаданных фото.
// Проверяем создание/обновление/удаление проектов и фото.

import { File } from 'expo-file-system';

import { type PhotoMetadata } from '@/models/photo';
import { initMmkv } from '@/storage/mmkv';
import { useProjectStore } from './projectStore';

// Тестовый ключ шифрования (32 символа — как AES-256).
const TEST_KEY = 'test-encryption-key-0000000000';

// Вспомогательная функция создания метаданных фото с переопределением полей.
function buildPhoto(overrides: Partial<PhotoMetadata> = {}): PhotoMetadata {
  return {
    id: 'photo-1',
    projectId: 'project-1',
    uri: 'file:///tmp/photo.jpg',
    takenAt: 1000,
    ...overrides,
  };
}

beforeAll(() => {
  initMmkv(TEST_KEY);
});

// Сброс состояния перед каждым тестом, чтобы тесты не влияли друг на друга.
beforeEach(() => {
  useProjectStore.setState({ projects: [], photos: [] });
});

describe('projectStore', () => {
  it('создаёт новый проект', () => {
    useProjectStore.getState().createProject('Мой проект');

    const { projects } = useProjectStore.getState();
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe('Мой проект');
    expect(projects[0].id).toBeTruthy();
    expect(projects[0].createdAt).toBeGreaterThan(0);
  });

  it('обновляет имя проекта', () => {
    useProjectStore.getState().createProject('Старое имя');
    const { id } = useProjectStore.getState().projects[0];

    useProjectStore.getState().updateProject(id, 'Новое имя');

    const { projects } = useProjectStore.getState();
    expect(projects[0].name).toBe('Новое имя');
  });

  it('удаляет проект', () => {
    useProjectStore.getState().createProject('Проект');
    const { id } = useProjectStore.getState().projects[0];

    useProjectStore.getState().deleteProject(id);

    expect(useProjectStore.getState().projects).toHaveLength(0);
  });

  it('добавляет метаданные фото', () => {
    useProjectStore.getState().addPhoto(buildPhoto());

    const { photos } = useProjectStore.getState();
    expect(photos).toHaveLength(1);
    expect(photos[0].projectId).toBe('project-1');
  });

  it('удаляет метаданные фото', () => {
    useProjectStore.getState().addPhoto(buildPhoto({ id: 'photo-1' }));

    useProjectStore.getState().deletePhoto('photo-1');

    expect(useProjectStore.getState().photos).toHaveLength(0);
  });

  it('удаляет фото вместе с проектом', () => {
    useProjectStore.getState().createProject('Проект');
    const { id } = useProjectStore.getState().projects[0];
    useProjectStore.getState().addPhoto(buildPhoto({ projectId: id }));

    useProjectStore.getState().deleteProject(id);

    const state = useProjectStore.getState();
    expect(state.projects).toHaveLength(0);
    expect(state.photos).toHaveLength(0);
  });

  it('сохраняет снятое фото в sandbox и добавляет метаданные', async () => {
    // Готовим временный файл-источник в замоканной файловой системе.
    const tempFile = new File('file:///tmp/capture.jpg');
    tempFile.create();
    tempFile.write('image-bytes');

    await useProjectStore.getState().saveCapturedPhoto({
      projectId: 'project-1',
      tempUri: tempFile.uri,
      width: 100,
      height: 200,
    });

    const { photos } = useProjectStore.getState();
    expect(photos).toHaveLength(1);
    expect(photos[0].projectId).toBe('project-1');
    expect(photos[0].width).toBe(100);
    expect(photos[0].height).toBe(200);
    // uri указывает на постоянный файл внутри sandbox.
    expect(photos[0].uri).toContain('file:///document/photos/project-1/');
    // Файл реально записан в (замоканную) файловую систему.
    expect(new File(photos[0].uri).exists).toBe(true);
  });
});
