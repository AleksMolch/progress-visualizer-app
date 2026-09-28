// Тесты storage-обёртки над expo-image-picker.
// Проверяем выбор изображения, отмену и ошибку без нативного модуля.

import * as ImagePicker from 'expo-image-picker';

import { pickImageFromDevice } from './imagePicker';

// Управляемое внутреннее состояние мока (мутируем поля, а не пересоздаём объект,
// т.к. mock launchImageLibraryAsync замыкается на модульный __result).
const mockPicker = ImagePicker as unknown as {
  __result: { canceled: boolean; assets: { uri: string }[] };
};

const mockLaunch = jest.mocked(ImagePicker.launchImageLibraryAsync);

beforeEach(() => {
  mockPicker.__result.canceled = false;
  mockPicker.__result.assets = [{ uri: 'file:///picker/photo.jpg' }];
  jest.clearAllMocks();
});

describe('pickImageFromDevice', () => {
  it('возвращает uri выбранного изображения', async () => {
    const result = await pickImageFromDevice();

    expect(result).toEqual({ uri: 'file:///picker/photo.jpg' });
    expect(mockLaunch).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 1,
    });
  });

  it('возвращает null при отмене пользователем', async () => {
    mockPicker.__result.canceled = true;
    mockPicker.__result.assets = [];

    const result = await pickImageFromDevice();

    expect(result).toBeNull();
  });

  it('возвращает null, если актив отсутствует', async () => {
    mockPicker.__result.canceled = false;
    mockPicker.__result.assets = [];

    const result = await pickImageFromDevice();

    expect(result).toBeNull();
  });

  it('возвращает null и логирует при ошибке picker', async () => {
    mockLaunch.mockRejectedValueOnce(new Error('picker fail'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await pickImageFromDevice();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
