// Тесты утилит прогресса: дни между снимками, группировка по месяцам, валидация пары.

import { type Project } from '@/models/project';
import { type PhotoMetadata } from '@/models/photo';

import { advanceQuickCompare, getDaysBetweenPhotos, groupPhotosByMonth, validateComparePair } from './progress';

/** Создаёт тестовые метаданные фото. */
function photo(id: string, takenAt: number, extra: Partial<PhotoMetadata> = {}): PhotoMetadata {
  return { id, projectId: 'p1', uri: `file:///${id}.jpg`, takenAt, ...extra };
}

const DAY_MS = 86_400_000;

describe('getDaysBetweenPhotos', () => {
  it('возвращает 0 для одного и того же момента', () => {
    expect(getDaysBetweenPhotos({ takenAt: 1000 }, { takenAt: 1000 })).toBe(0);
  });

  it('возвращает количество полных дней', () => {
    expect(getDaysBetweenPhotos({ takenAt: 0 }, { takenAt: DAY_MS })).toBe(1);
    expect(getDaysBetweenPhotos({ takenAt: 0 }, { takenAt: 42 * DAY_MS })).toBe(42);
  });

  it('не зависит от порядка аргументов', () => {
    expect(getDaysBetweenPhotos({ takenAt: 0 }, { takenAt: 5 * DAY_MS })).toBe(
      getDaysBetweenPhotos({ takenAt: 5 * DAY_MS }, { takenAt: 0 }),
    );
  });
});

describe('groupPhotosByMonth', () => {
  it('группирует фото по месяцам, сохраняя порядок (ru)', () => {
    const groups = groupPhotosByMonth(
      [
        photo('sep2', Date.UTC(2026, 8, 20)),
        photo('sep1', Date.UTC(2026, 8, 5)),
        photo('aug', Date.UTC(2026, 7, 15)),
      ],
      'ru',
    );

    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe('Сентябрь 2026');
    expect(groups[0].photos.map((p) => p.id)).toEqual(['sep2', 'sep1']);
    expect(groups[1].label).toBe('Август 2026');
    expect(groups[1].photos.map((p) => p.id)).toEqual(['aug']);
  });

  it('по умолчанию использует английские названия месяцев', () => {
    const groups = groupPhotosByMonth([photo('sep', Date.UTC(2026, 8, 1))]);
    expect(groups[0].label).toBe('September 2026');
  });

  it('возвращает пустой массив для пустого входа', () => {
    expect(groupPhotosByMonth([])).toEqual([]);
  });

  it('разделяет одинаковые месяцы разных лет', () => {
    const groups = groupPhotosByMonth([
      photo('sep2026', Date.UTC(2026, 8, 1)),
      photo('sep2025', Date.UTC(2025, 8, 1)),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe('2026-8');
    expect(groups[1].key).toBe('2025-8');
  });
});

describe('validateComparePair', () => {
  const project: Project = { id: 'p1', name: 'Проект', createdAt: 0, updatedAt: 0 };
  const photos = [photo('old', 100), photo('mid', 200), photo('new', 300)];

  it('проект отсутствует → no-project', () => {
    const result = validateComparePair(null, photos, 'old', 'new');
    expect(result.error).toBe('no-project');
    expect(result.before).toBeNull();
  });

  it('одинаковые фото → same-photo', () => {
    const result = validateComparePair(project, photos, 'old', 'old');
    expect(result.error).toBe('same-photo');
  });

  it('фото не найдено или чужой проект → missing-photo', () => {
    expect(validateComparePair(project, photos, 'ghost', 'new').error).toBe('missing-photo');
    expect(
      validateComparePair(project, [photo('foreign', 999, { projectId: 'p2' })], 'foreign', 'new')
        .error,
    ).toBe('missing-photo');
  });

  it('упорядочивает пару по дате (раньше = До)', () => {
    const result = validateComparePair(project, photos, 'new', 'old');
    expect(result.error).toBeNull();
    expect(result.before?.id).toBe('old');
    expect(result.after?.id).toBe('new');
  });

  it('сохраняет явный порядок, если он уже хронологический', () => {
    const result = validateComparePair(project, photos, 'old', 'new');
    expect(result.before?.id).toBe('old');
    expect(result.after?.id).toBe('new');
  });
});

describe('advanceQuickCompare', () => {
  it('0 → 1 → 2: последовательно добавляет фото', () => {
    expect(advanceQuickCompare([], 'a')).toEqual(['a']);
    expect(advanceQuickCompare(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('тап по уже выбранному фото снимает выбор', () => {
    expect(advanceQuickCompare(['a'], 'a')).toEqual([]);
    expect(advanceQuickCompare(['a', 'b'], 'a')).toEqual(['b']);
  });

  it('не добавляет дубликат', () => {
    expect(advanceQuickCompare(['a', 'b'], 'a')).toEqual(['b']);
  });
});
