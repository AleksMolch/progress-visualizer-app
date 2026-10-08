// Тесты утилиты каскадной задержки появления карточек списка (stagger).
// Проверяем формулу задержки, ограничение сверху и отсечение дальних элементов.

import {
  MAX_STAGGERED_ITEMS,
  STAGGER_DELAY_MS,
  STAGGER_MAX_DELAY_MS,
  getStaggerDelay,
} from './stagger';

describe('getStaggerDelay', () => {
  it('первый элемент появляется без задержки', () => {
    expect(getStaggerDelay(0)).toBe(0);
  });

  it('задержка растёт на шаг между соседними элементами', () => {
    expect(getStaggerDelay(1)).toBe(STAGGER_DELAY_MS);
    expect(getStaggerDelay(4)).toBe(4 * STAGGER_DELAY_MS);
  });

  it('последний анимируемый элемент укладывается в максимум задержки', () => {
    const lastDelay = getStaggerDelay(MAX_STAGGERED_ITEMS - 1);
    expect(lastDelay).not.toBeNull();
    expect(lastDelay as number).toBeLessThanOrEqual(STAGGER_MAX_DELAY_MS);
  });

  it('элементы после лимита не анимируются (появляются мгновенно)', () => {
    expect(getStaggerDelay(MAX_STAGGERED_ITEMS)).toBeNull();
    expect(getStaggerDelay(50)).toBeNull();
  });

  it('отрицательный индекс не анимируется', () => {
    expect(getStaggerDelay(-1)).toBeNull();
  });
});
