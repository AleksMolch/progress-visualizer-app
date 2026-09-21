// Тесты единого расчёта нижнего отступа контента.

import { getBottomInset } from './tab-bar';

describe('getBottomInset', () => {
  it('учитывает safe area, меню, выступ кнопки и буфер', () => {
    // 0 (safe area) + 64 (меню) + 24 (выступ) + 16 (буфер) = 104.
    expect(getBottomInset(0)).toBe(104);
  });

  it('добавляет safe area к базовому значению', () => {
    expect(getBottomInset(34)).toBe(104 + 34);
  });

  it('резервирует высоту ad-слота при включённом флаге', () => {
    expect(getBottomInset(0, true)).toBe(104 + 64);
    expect(getBottomInset(0, false)).toBe(104);
  });
});
