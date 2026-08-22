// Тесты утилиты выборки последнего фото проекта.

import { type PhotoMetadata } from '@/models/photo';
import { getLatestPhoto } from './photos';

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
