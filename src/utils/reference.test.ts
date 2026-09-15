// Тесты резолвера эталонного фото для ghost overlay.
// Проверяем режимы latest/first/manual, скрытые фото и fallback при пропавшем manual.

import { type Project } from '@/models/project';
import { type PhotoMetadata } from '@/models/photo';

import { getReferenceMode, isManualReferenceMissing, resolveReferencePhoto } from './reference';

/** Создаёт тестовые метаданные фото. */
function photo(id: string, takenAt: number, extra: Partial<PhotoMetadata> = {}): PhotoMetadata {
  return { id, projectId: 'p1', uri: `file:///${id}.jpg`, takenAt, ...extra };
}

/** Создаёт тестовый проект с эталонными настройками. */
function project(overrides: Partial<Project> = {}): Project {
  return { id: 'p1', name: 'Проект', createdAt: 0, updatedAt: 0, ...overrides };
}

// Базовый набор: old(100), mid(200), new(300).
const photos = [photo('old', 100), photo('mid', 200), photo('new', 300)];

describe('getReferenceMode', () => {
  it('возвращает latest для старого проекта без referenceMode', () => {
    expect(getReferenceMode(project())).toBe('latest');
  });

  it('возвращает явный режим', () => {
    expect(getReferenceMode(project({ referenceMode: 'manual' }))).toBe('manual');
  });
});

describe('resolveReferencePhoto', () => {
  it('latest → последнее видимое фото', () => {
    expect(resolveReferencePhoto(project({ referenceMode: 'latest' }), photos)?.id).toBe('new');
    expect(resolveReferencePhoto(project(), photos)?.id).toBe('new');
  });

  it('first → первое видимое фото', () => {
    expect(resolveReferencePhoto(project({ referenceMode: 'first' }), photos)?.id).toBe('old');
  });

  it('manual → выбранное фото', () => {
    const p = project({ referenceMode: 'manual', referencePhotoId: 'mid' });
    expect(resolveReferencePhoto(p, photos)?.id).toBe('mid');
  });

  it('manual с пропавшим id → fallback на latest', () => {
    const p = project({ referenceMode: 'manual', referencePhotoId: 'deleted' });
    expect(resolveReferencePhoto(p, photos)?.id).toBe('new');
  });

  it('manual без id → fallback на latest', () => {
    const p = project({ referenceMode: 'manual', referencePhotoId: null });
    expect(resolveReferencePhoto(p, photos)?.id).toBe('new');
  });

  it('скрытые фото исключаются из авто latest/first', () => {
    const withHidden = [...photos, photo('hidden-newest', 400, { isHidden: true })];
    expect(resolveReferencePhoto(project({ referenceMode: 'latest' }), withHidden)?.id).toBe('new');
    expect(resolveReferencePhoto(project({ referenceMode: 'first' }), withHidden)?.id).toBe('old');
  });

  it('скрытый manual-эталон → fallback на latest', () => {
    const withHidden = [photo('mid', 200, { isHidden: true }), photo('old', 100), photo('new', 300)];
    const p = project({ referenceMode: 'manual', referencePhotoId: 'mid' });
    expect(resolveReferencePhoto(p, withHidden)?.id).toBe('new');
  });

  it('возвращает null, если видимых фото нет', () => {
    expect(resolveReferencePhoto(project(), [])).toBeNull();
    expect(resolveReferencePhoto(project(), [photo('hidden', 100, { isHidden: true })])).toBeNull();
  });
});

describe('isManualReferenceMissing', () => {
  it('false для non-manual режима', () => {
    expect(isManualReferenceMissing(project({ referenceMode: 'latest' }), photos)).toBe(false);
  });

  it('true, если manual id отсутствует', () => {
    expect(isManualReferenceMissing(project({ referenceMode: 'manual' }), photos)).toBe(true);
  });

  it('true, если manual id удалён или скрыт', () => {
    expect(isManualReferenceMissing(project({ referenceMode: 'manual', referencePhotoId: 'gone' }), photos)).toBe(true);
    const withHidden = [photo('mid', 200, { isHidden: true }), photo('old', 100)];
    expect(
      isManualReferenceMissing(project({ referenceMode: 'manual', referencePhotoId: 'mid' }), withHidden),
    ).toBe(true);
  });

  it('false, если manual id валиден и видим', () => {
    expect(
      isManualReferenceMissing(project({ referenceMode: 'manual', referencePhotoId: 'mid' }), photos),
    ).toBe(false);
  });
});
