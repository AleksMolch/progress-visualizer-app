// Тесты утилиты форматирования дат и месяцев (locale-aware).

import { formatDate, formatMonthLabel } from './dates';

describe('formatDate', () => {
  it('возвращает непустую строку для корректной метки времени', () => {
    const result = formatDate(Date.UTC(2026, 7, 22), 'ru');

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('содержит год в отформатированной дате', () => {
    const result = formatDate(Date.UTC(2026, 7, 22), 'ru');

    expect(result).toContain('2026');
  });
});

describe('formatMonthLabel', () => {
  it('возвращает «Сентябрь 2026» для ru', () => {
    // Сентябрь = месяц 8 (0-based).
    expect(formatMonthLabel(Date.UTC(2026, 8, 15), 'ru')).toBe('Сентябрь 2026');
  });

  it('возвращает «September 2026» для en', () => {
    expect(formatMonthLabel(Date.UTC(2026, 8, 15), 'en')).toBe('September 2026');
  });

  it('возвращает «2026年9月» для zh-Hans', () => {
    expect(formatMonthLabel(Date.UTC(2026, 8, 15), 'zh-Hans')).toBe('2026年9月');
  });

  it('возвращает «Қыркүйек 2026» для kk', () => {
    expect(formatMonthLabel(Date.UTC(2026, 8, 15), 'kk')).toBe('Қыркүйек 2026');
  });

  it('возвращает «Septiembre 2026» для es', () => {
    expect(formatMonthLabel(Date.UTC(2026, 8, 15), 'es')).toBe('Septiembre 2026');
  });

  it('fallback на en для неизвестной локали', () => {
    expect(formatMonthLabel(Date.UTC(2026, 0, 3), 'xx')).toBe('January 2026');
  });
});
