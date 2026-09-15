// Тесты утилиты форматирования дат, месяцев и дней (с плюрализацией).

import { formatDate, formatDays, formatMonthLabel } from './dates';

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

describe('formatDays', () => {
  it('корректно склоняет слово «день»', () => {
    expect(formatDays(1)).toBe('1 день');
    expect(formatDays(21)).toBe('21 день');
    expect(formatDays(101)).toBe('101 день');
  });

  it('корректно склоняет слово «дня»', () => {
    expect(formatDays(2)).toBe('2 дня');
    expect(formatDays(4)).toBe('4 дня');
    expect(formatDays(22)).toBe('22 дня');
    expect(formatDays(42)).toBe('42 дня');
  });

  it('корректно склоняет слово «дней»', () => {
    expect(formatDays(0)).toBe('0 дней');
    expect(formatDays(5)).toBe('5 дней');
    expect(formatDays(11)).toBe('11 дней');
    expect(formatDays(12)).toBe('12 дней');
    expect(formatDays(13)).toBe('13 дней');
    expect(formatDays(14)).toBe('14 дней');
    expect(formatDays(100)).toBe('100 дней');
  });
});

describe('formatMonthLabel', () => {
  it('возвращает «Сентябрь 2026» с заглавной буквы', () => {
    // Сентябрь = месяц 8 (0-based).
    expect(formatMonthLabel(Date.UTC(2026, 8, 15))).toBe('Сентябрь 2026');
  });

  it('возвращает «Январь 2026» для января', () => {
    expect(formatMonthLabel(Date.UTC(2026, 0, 3))).toBe('Январь 2026');
  });
});
