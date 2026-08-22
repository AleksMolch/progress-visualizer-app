// Тесты политики безопасности приложения.

import { shouldLock } from './security';

describe('shouldLock', () => {
  it('блокирует, когда защита включена и биометрия доступна', () => {
    expect(shouldLock(true, true)).toBe(true);
  });

  it('не блокирует, когда защита выключена', () => {
    expect(shouldLock(false, true)).toBe(false);
    expect(shouldLock(false, false)).toBe(false);
  });

  it('не блокирует, когда биометрия недоступна (fallback)', () => {
    expect(shouldLock(true, false)).toBe(false);
  });
});
