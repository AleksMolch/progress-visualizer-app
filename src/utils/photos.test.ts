// Тесты утилиты выборки последнего фото проекта.

import { type PhotoMetadata } from '@/models/photo';
import { getLatestPhoto, getPreviousPhoto, getProjectPhotos } from './photos';

/** Создаёт тестовые метаданные фото. */
function photo(id: string, projectId: string, takenAt: number): PhotoMetadata {
  return { id, projectId, uri: `file:///${id}.jpg`, takenAt };
}

describe('getLatestPhoto', () => {
  it('возвращает null, если у проекта нет фото', () => {
    const photos = [photo('a', 'p1', 100), photo('b', 'p2', 200)];

    expect(getLatestPhoto(photos, 'empty')).toBeNull();
  });

  it('возвращает фото с максимальным takenAt для проекта', () => {
    const photos = [
      photo('old', 'p1', 100),
      photo('mid', 'p1', 200),
      photo('new', 'p1', 300),
    ];

    expect(getLatestPhoto(photos, 'p1')?.id).toBe('new');
  });

  it('не учитывает фото других проектов', () => {
    const photos = [
      photo('other-new', 'p2', 999),
      photo('ours-old', 'p1', 50),
    ];

    expect(getLatestPhoto(photos, 'p1')?.id).toBe('ours-old');
  });

  it('возвращает единственное фото проекта', () => {
    const photos = [photo('only', 'p1', 42)];

    expect(getLatestPhoto(photos, 'p1')?.id).toBe('only');
  });
});

describe('getProjectPhotos', () => {
  it('возвращает только фото проекта, отсортированные по убыванию takenAt', () => {
    const photos = [
      photo('old', 'p1', 100),
      photo('new', 'p1', 300),
      photo('mid', 'p1', 200),
      photo('other', 'p2', 999),
    ];

    const result = getProjectPhotos(photos, 'p1');

    expect(result.map((p) => p.id)).toEqual(['new', 'mid', 'old']);
  });

  it('возвращает пустой массив, если у проекта нет фото', () => {
    expect(getProjectPhotos([photo('a', 'p2', 1)], 'p1')).toEqual([]);
  });
});

describe('getPreviousPhoto', () => {
  const photos = [
    photo('old', 'p1', 100),
    photo('mid', 'p1', 200),
    photo('new', 'p1', 300),
  ];

  it('возвращает фото с максимальным takenAt меньше текущего', () => {
    expect(getPreviousPhoto(photos, 'p1', 'new')?.id).toBe('mid');
    expect(getPreviousPhoto(photos, 'p1', 'mid')?.id).toBe('old');
  });

  it('возвращает null для самого раннего фото', () => {
    expect(getPreviousPhoto(photos, 'p1', 'old')).toBeNull();
  });

  it('возвращает null, если фото не принадлежит проекту', () => {
    expect(getPreviousPhoto(photos, 'p1', 'unknown')).toBeNull();
  });
});
