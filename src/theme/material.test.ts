// Тесты политики выбора материала поверхности.
// Проверяем fallback по платформе, Liquid Glass и Reduce Transparency.

import { resolveMaterial, type MaterialCapabilities } from './material';

// Базовые возможности: iOS с Liquid Glass, без Reduce Transparency.
const iosGlass: MaterialCapabilities = {
  isIos: true,
  glassApiAvailable: true,
  liquidGlassAvailable: true,
  reduceTransparency: false,
};

describe('resolveMaterial', () => {
  it('solid остаётся solid всегда', () => {
    expect(resolveMaterial('solid', iosGlass)).toBe('solid');
  });

  it('Reduce Transparency принудительно даёт solid', () => {
    expect(resolveMaterial('native-glass', { ...iosGlass, reduceTransparency: true })).toBe('solid');
    expect(resolveMaterial('frosted', { ...iosGlass, reduceTransparency: true })).toBe('solid');
  });

  it('native-glass на iOS с Liquid Glass даёт native-glass', () => {
    expect(resolveMaterial('native-glass', iosGlass)).toBe('native-glass');
  });

  it('native-glass без Liquid Glass API на iOS падает в frosted', () => {
    expect(resolveMaterial('native-glass', { ...iosGlass, glassApiAvailable: false })).toBe('frosted');
  });

  it('native-glass без Liquid Glass дизайна на iOS падает в frosted', () => {
    expect(resolveMaterial('native-glass', { ...iosGlass, liquidGlassAvailable: false })).toBe('frosted');
  });

  it('frosted на iOS даёт frosted', () => {
    expect(resolveMaterial('frosted', iosGlass)).toBe('frosted');
  });

  it('frosted на Android/web даёт solid', () => {
    expect(resolveMaterial('frosted', { ...iosGlass, isIos: false })).toBe('solid');
  });

  it('native-glass на Android/web даёт solid', () => {
    expect(resolveMaterial('native-glass', { ...iosGlass, isIos: false })).toBe('solid');
  });

  it('elevated остаётся elevated (чистый RN, без fallback)', () => {
    expect(resolveMaterial('elevated', iosGlass)).toBe('elevated');
    expect(resolveMaterial('elevated', { ...iosGlass, reduceTransparency: true })).toBe('elevated');
    expect(resolveMaterial('elevated', { ...iosGlass, isIos: false })).toBe('elevated');
  });

  it('neumorphic остаётся neumorphic (чистый RN, без fallback)', () => {
    expect(resolveMaterial('neumorphic', iosGlass)).toBe('neumorphic');
    expect(resolveMaterial('neumorphic', { ...iosGlass, reduceTransparency: true })).toBe('neumorphic');
    expect(resolveMaterial('neumorphic', { ...iosGlass, isIos: false })).toBe('neumorphic');
  });
});
