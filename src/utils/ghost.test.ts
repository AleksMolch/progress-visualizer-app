// Тесты чистой логики видимости ghost overlay.
// Проверяем комбинации обычного призрака, быстрого показа и готовности эталона.

import { PEEK_OPACITY, resolveGhostVisibility } from './ghost';

describe('resolveGhostVisibility', () => {
  it('скрывает призрак, когда обычный выключен и нет быстрого показа', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: false,
      referenceReady: true,
      isPeekActive: false,
      ghostOpacity: 0.5,
    });
    expect(r.visible).toBe(false);
    expect(r.effectiveOpacity).toBe(0.5);
  });

  it('показывает обычный призрак с его непрозрачностью', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: true,
      referenceReady: true,
      isPeekActive: false,
      ghostOpacity: 0.3,
    });
    expect(r.visible).toBe(true);
    expect(r.effectiveOpacity).toBe(0.3);
  });

  it('быстрый показ показывает призрак ровно 0.9 при выключенном обычном', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: false,
      referenceReady: true,
      isPeekActive: true,
      ghostOpacity: 0.5,
    });
    expect(r.visible).toBe(true);
    expect(r.effectiveOpacity).toBe(PEEK_OPACITY);
  });

  it('быстрый показ задаёт 0.9 даже если обычная непрозрачность равна 1', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: true,
      referenceReady: true,
      isPeekActive: true,
      ghostOpacity: 1,
    });
    expect(r.visible).toBe(true);
    expect(r.effectiveOpacity).toBe(PEEK_OPACITY);
  });

  it('не показывает призрак, пока эталон не загружен (даже в быстром режиме)', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: true,
      referenceReady: false,
      isPeekActive: true,
      ghostOpacity: 0.5,
    });
    expect(r.visible).toBe(false);
  });

  it('сохраняет обычную непрозрачность при отсутствии быстрого показа', () => {
    for (const opacity of [0, 0.5, 1]) {
      const r = resolveGhostVisibility({
        ghostEnabled: true,
        referenceReady: true,
        isPeekActive: false,
        ghostOpacity: opacity,
      });
      expect(r.effectiveOpacity).toBe(opacity);
    }
  });
});
