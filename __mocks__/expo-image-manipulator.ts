/**
 * Ручной мок expo-image-manipulator для Jest.
 *
 * Имитирует новый объектный API (manipulate → resize/renderAsync → saveAsync):
 * «сохранённая» миниатюра сразу создаётся в замоканной файловой системе
 * (expo-file-system), поэтому storage-слой может её переместить в sandbox.
 * Также поддерживается устаревший manipulateAsync — на случай других вызовов.
 */

import { File } from 'expo-file-system';

type Size = { width?: number | null; height?: number | null };

let savedCounter = 0;

class MockImageRef {
  width = 400;
  height = 300;

  async saveAsync(_options?: unknown) {
    savedCounter += 1;
    const uri = `file:///cache/manipulated-${savedCounter}.jpg`;
    const file = new File(uri);
    if (!file.exists) {
      file.write('thumbnail');
    }
    return { uri, width: this.width, height: this.height };
  }
}

class MockImageManipulatorContext {
  resize(_size: Size) {
    return this;
  }

  rotate(_degrees: number) {
    return this;
  }

  reset() {
    return this;
  }

  async renderAsync(): Promise<MockImageRef> {
    return new MockImageRef();
  }
}

export const ImageManipulator = {
  manipulate: (_source: string) => new MockImageManipulatorContext(),
};

export const SaveFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
  WEBP: 'webp',
} as const;

export const FlipType = {
  Vertical: 'vertical',
  Horizontal: 'horizontal',
} as const;

export async function manipulateAsync() {
  return new MockImageRef().saveAsync();
}

export function useImageManipulator() {
  return new MockImageManipulatorContext();
}
