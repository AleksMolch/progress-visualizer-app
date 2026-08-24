// Тесты storage-обёртки над expo-media-library.
// Проверяем логику запроса разрешения и экспорта без нативного модуля.

import * as MediaLibrary from 'expo-media-library';

import { exportPhotoToLibrary, requestMediaLibraryPermission } from './mediaLibrary';

// Мок expo-media-library с контролируемыми флагами разрешений.
const mockMediaLibrary = jest.mocked(MediaLibrary);

// Служебное поле мока (отсутствует в реальных типах) для управления флагами.
const mockInternals = MediaLibrary as unknown as {
  __permissions: { granted: boolean; requested: boolean };
};

// Сброс состояния мока перед каждым тестом.
beforeEach(() => {
  mockInternals.__permissions.granted = false;
  mockInternals.__permissions.requested = true;
  jest.clearAllMocks();
});

describe('requestMediaLibraryPermission', () => {
  it('не запрашивает повторно, если доступ уже выдан', async () => {
    mockInternals.__permissions.granted = true;

    const ok = await requestMediaLibraryPermission();

    expect(ok).toBe(true);
    expect(mockMediaLibrary.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('запрашивает доступ, когда его нет', async () => {
    mockInternals.__permissions.granted = false;
    mockInternals.__permissions.requested = true;

    const ok = await requestMediaLibraryPermission();

    expect(ok).toBe(true);
    expect(mockMediaLibrary.requestPermissionsAsync).toHaveBeenCalledWith(true);
  });

  it('возвращает false при отказе пользователя', async () => {
    mockInternals.__permissions.granted = false;
    mockInternals.__permissions.requested = false;

    const ok = await requestMediaLibraryPermission();

    expect(ok).toBe(false);
  });
});

describe('exportPhotoToLibrary', () => {
  it('создаёт asset в галерее по переданному uri', async () => {
    const ok = await exportPhotoToLibrary('file:///document/photos/p/1.jpg');

    expect(ok).toBe(true);
    expect(mockMediaLibrary.Asset.create).toHaveBeenCalledWith(
      'file:///document/photos/p/1.jpg',
    );
  });

  it('возвращает false, если создание asset падает с ошибкой', async () => {
    jest
      .mocked(mockMediaLibrary.Asset.create)
      .mockRejectedValueOnce(new Error('fail'));

    const ok = await exportPhotoToLibrary('file:///document/photos/p/1.jpg');

    expect(ok).toBe(false);
  });
});
