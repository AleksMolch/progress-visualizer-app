// Тесты чистой логики видимости ghost overlay.
// Проверяем комбинации обычного призрака, временного усиления и готовности эталона.

import { BOOSTED_OPACITY, resolveGhostVisibility } from './ghost';

describe('resolveGhostVisibility', () => {
  it('скрывает призрак, когда обычный выключен и нет усиления', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: false,
      referenceReady: true,
      isBoosted: false,
      ghostOpacity: 0.5,
    });
    expect(r.visible).toBe(false);
    expect(r.effectiveOpacity).toBe(0.5);
  });

  it('показывает обычный призрак с его непрозрачностью', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: true,
      referenceReady: true,
      isBoosted: false,
      ghostOpacity: 0.3,
    });
    expect(r.visible).toBe(true);
    expect(r.effectiveOpacity).toBe(0.3);
  });

  it('временное усиление показывает призрак ровно 0.85 при выключенном обычном', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: false,
      referenceReady: true,
      isBoosted: true,
      ghostOpacity: 0.5,
    });
    expect(r.visible).toBe(true);
    expect(r.effectiveOpacity).toBe(BOOSTED_OPACITY);
  });

  it('временное усиление задаёт 0.85 даже если обычная непрозрачность равна 1', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: true,
      referenceReady: true,
      isBoosted: true,
      ghostOpacity: 1,
    });
    expect(r.visible).toBe(true);
    expect(r.effectiveOpacity).toBe(BOOSTED_OPACITY);
  });

  it('не показывает призрак, пока эталон не загружен (даже при усилении)', () => {
    const r = resolveGhostVisibility({
      ghostEnabled: true,
      referenceReady: false,
      isBoosted: true,
      ghostOpacity: 0.5,
    });
    expect(r.visible).toBe(false);
  });

  it('сохраняет обычную непрозрачность при отсутствии усиления', () => {
    for (const opacity of [0, 0.5, 1]) {
      const r = resolveGhostVisibility({
        ghostEnabled: true,
        referenceReady: true,
        isBoosted: false,
        ghostOpacity: opacity,
      });
      expect(r.effectiveOpacity).toBe(opacity);
    }
  });
});
