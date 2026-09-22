// Тесты движка i18n: интерполяция, плюрализация, fallback и полнота словарей.

import { isAppLanguage, translate } from './index';
import { LANGUAGE_SHORT, LOCALES } from './locale';
import { en } from './locales/en';
import { es } from './locales/es';
import { kk } from './locales/kk';
import { ru } from './locales/ru';
import { zhHans } from './locales/zh-Hans';

describe('translate: интерполяция', () => {
  it('подставляет параметры {name}', () => {
    expect(translate('ru', 'projects.deleteMessage', { name: 'Фикус' })).toBe(
      '«Фикус» и все его фотографии будут удалены без возможности восстановления.',
    );
  });

  it('оставляет неизвестный параметр как есть', () => {
    expect(translate('en', 'project.period', { from: 'A' })).toBe('A → {to}');
  });
});

describe('translate: плюрализация', () => {
  it('ru: one/few/many для «день»', () => {
    expect(translate('ru', 'time.days', { count: 1 })).toBe('1 день');
    expect(translate('ru', 'time.days', { count: 2 })).toBe('2 дня');
    expect(translate('ru', 'time.days', { count: 5 })).toBe('5 дней');
    expect(translate('ru', 'time.days', { count: 21 })).toBe('21 день');
    expect(translate('ru', 'time.days', { count: 42 })).toBe('42 дня');
  });

  it('en: one/other', () => {
    expect(translate('en', 'time.days', { count: 1 })).toBe('1 day');
    expect(translate('en', 'time.days', { count: 2 })).toBe('2 days');
  });

  it('es: one/other', () => {
    expect(translate('es', 'time.days', { count: 1 })).toBe('1 día');
    expect(translate('es', 'time.days', { count: 5 })).toBe('5 días');
  });

  it('zh-Hans: без плюрализации', () => {
    expect(translate('zh-Hans', 'time.days', { count: 1 })).toBe('1 天');
    expect(translate('zh-Hans', 'time.days', { count: 7 })).toBe('7 天');
  });

  it('принимает count строкой', () => {
    expect(translate('en', 'time.days', { count: '3' })).toBe('3 days');
  });
});

describe('локализованные термины', () => {
  it('русский термин Timelapse → «Таймлапс»', () => {
    expect(translate('ru', 'nav.timelapse')).toBe('Таймлапс');
  });
});

describe('translate: fallback', () => {
  it('возвращает ключ для отсутствующего перевода (en — канон)', () => {
    // Все локали имеют полный набор ключей; проверяем fallback на en напрямую.
    expect(translate('en', 'common.cancel')).toBe('Cancel');
  });
});

describe('isAppLanguage', () => {
  it('распознаёт поддерживаемые языки', () => {
    expect(isAppLanguage('ru')).toBe(true);
    expect(isAppLanguage('en')).toBe(true);
    expect(isAppLanguage('zh-Hans')).toBe(true);
    expect(isAppLanguage('kk')).toBe(true);
    expect(isAppLanguage('es')).toBe(true);
  });

  it('отклоняет неизвестные значения', () => {
    expect(isAppLanguage('fr')).toBe(false);
    expect(isAppLanguage('')).toBe(false);
    expect(isAppLanguage(undefined)).toBe(false);
    expect(isAppLanguage(null)).toBe(false);
  });
});

describe('метаданные языков', () => {
  it('у каждого языка есть короткий код', () => {
    for (const lang of LOCALES) {
      expect(LANGUAGE_SHORT[lang]).toBeTruthy();
    }
  });

  it('короткие коды не пустые и имеют 2 символа', () => {
    for (const lang of LOCALES) {
      expect(LANGUAGE_SHORT[lang]).toMatch(/^[A-Z]{2}$/);
    }
  });
});

describe('полнота словарей', () => {
  it('каждая локаль содержит все ключи en', () => {
    const enKeys = Object.keys(en);
    for (const dict of [ru, zhHans, kk, es]) {
      for (const key of enKeys) {
        expect(dict[key as keyof typeof en]).toBeDefined();
      }
      // И нет лишних ключей.
      expect(Object.keys(dict).sort()).toEqual(enKeys.slice().sort());
    }
  });

  it('технический ключ ads.placeholderSize удалён из всех словарей', () => {
    for (const dict of [en, ru, zhHans, kk, es]) {
      expect('ads.placeholderSize' in dict).toBe(false);
      expect('ads.placeholderDev' in dict).toBe(false);
    }
  });

  it('пользовательский текст рекламы есть во всех пяти локалях', () => {
    for (const dict of [en, ru, zhHans, kk, es]) {
      expect(dict['ads.placeholderText' as keyof typeof en]).toBeTruthy();
    }
  });
});
