// Тесты определения состояния permission-экрана камеры.
// Проверяем четыре состояния: загрузка, можно запросить, постоянный отказ, выдано.

import { resolveCameraPermissionView } from './cameraPermission';

describe('resolveCameraPermissionView', () => {
  it('пока не загружено — состояние loading', () => {
    expect(resolveCameraPermissionView(null)).toBe('loading');
  });

  it('разрешение не выдано, но можно запросить — request', () => {
    expect(resolveCameraPermissionView({ granted: false, canAskAgain: true })).toBe('request');
  });

  it('разрешение не выдано и запрос невозможен — blocked', () => {
    expect(resolveCameraPermissionView({ granted: false, canAskAgain: false })).toBe('blocked');
  });

  it('разрешение выдано — granted (независимо от canAskAgain)', () => {
    expect(resolveCameraPermissionView({ granted: true, canAskAgain: true })).toBe('granted');
    expect(resolveCameraPermissionView({ granted: true, canAskAgain: false })).toBe('granted');
  });
});
