// Тесты утилиты выборки последнего фото проекта.

import { type PhotoMetadata } from '@/models/photo';
import {
  getChronologicalPhotos,
  getFirstVisiblePhoto,
  getLatestVisiblePhoto,
  getProjectPhotos,
  getVisiblePhotos,
} from './photos';

/** Создаёт тестовые метаданные фото. */
function photo(
  id: string,
  projectId: string,
  takenAt: number,
  extra: Partial<PhotoMetadata> = {},
): PhotoMetadata {
  return { id, projectId, uri: `file:///${id}.jpg`, takenAt, ...extra };
}

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

describe('getChronologicalPhotos', () => {
  it('возвращает фото проекта от ранних к поздним', () => {
    const photos = [
      photo('new', 'p1', 300),
      photo('old', 'p1', 100),
      photo('mid', 'p1', 200),
      photo('other', 'p2', 999),
    ];

    const result = getChronologicalPhotos(photos, 'p1');

    expect(result.map((p) => p.id)).toEqual(['old', 'mid', 'new']);
  });

  it('возвращает пустой массив, если у проекта нет фото', () => {
    expect(getChronologicalPhotos([photo('a', 'p2', 1)], 'p1')).toEqual([]);
  });
});

describe('getVisiblePhotos', () => {
  it('исключает скрытые фото и фото других проектов', () => {
    const photos = [
      photo('a', 'p1', 100),
      photo('hidden', 'p1', 200, { isHidden: true }),
      photo('other', 'p2', 300),
    ];

    expect(getVisiblePhotos(photos, 'p1').map((p) => p.id)).toEqual(['a']);
  });

  it('считает отсутствие isHidden видимым', () => {
    expect(getVisiblePhotos([photo('a', 'p1', 100)], 'p1').map((p) => p.id)).toEqual(['a']);
  });
});

describe('getFirstVisiblePhoto / getLatestVisiblePhoto', () => {
  it('возвращает самое раннее/свежее видимое фото', () => {
    const photos = [
      photo('old', 'p1', 100),
      photo('new', 'p1', 300),
      photo('hidden-newest', 'p1', 999, { isHidden: true }),
    ];

    expect(getFirstVisiblePhoto(photos, 'p1')?.id).toBe('old');
    expect(getLatestVisiblePhoto(photos, 'p1')?.id).toBe('new');
  });

  it('возвращает null, если видимых фото нет', () => {
    expect(getFirstVisiblePhoto([photo('h', 'p1', 100, { isHidden: true })], 'p1')).toBeNull();
    expect(getLatestVisiblePhoto([], 'p1')).toBeNull();
  });
});
