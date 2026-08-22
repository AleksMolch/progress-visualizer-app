// Тесты утилиты форматирования дат.

import { formatDate } from './dates';

describe('formatDate', () => {
  it('возвращает непустую строку для корректной метки времени', () => {
    const result = formatDate(Date.UTC(2026, 7, 22));

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('содержит год в отформатированной дате', () => {
    const result = formatDate(Date.UTC(2026, 7, 22));

    expect(result).toContain('2026');
  });
});
