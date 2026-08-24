// Тесты утилиты разбора времени напоминания.
// Проверяем корректный разбор «HH:MM» и отклонение некорректных значений.

import { parseReminderTime } from './reminders';

describe('parseReminderTime', () => {
  it('разбирает корректное время «20:00» в часы и минуты', () => {
    expect(parseReminderTime('20:00')).toEqual({ hour: 20, minute: 0 });
  });

  it('разбирает время с однозначным часом «9:05»', () => {
    expect(parseReminderTime('9:05')).toEqual({ hour: 9, minute: 5 });
  });

  it('обрезает пробелы вокруг значения', () => {
    expect(parseReminderTime('  07:30  ')).toEqual({ hour: 7, minute: 30 });
  });

  it('возвращает null для пустой строки', () => {
    expect(parseReminderTime('')).toBeNull();
  });

  it('возвращает null для строки без двоеточия', () => {
    expect(parseReminderTime('2000')).toBeNull();
  });

  it('возвращает null для некорректного часа (24)', () => {
    expect(parseReminderTime('24:00')).toBeNull();
  });

  it('возвращает null для некорректной минуты (60)', () => {
    expect(parseReminderTime('12:60')).toBeNull();
  });

  it('возвращает null для отрицательных значений', () => {
    expect(parseReminderTime('-1:00')).toBeNull();
  });
});
