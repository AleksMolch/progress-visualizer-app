/**
 * Ручной мок expo-file-system для Jest.
 * Заменяет нативную файловую систему in-memory структурой, чтобы тесты
 * storage-слоя не зависели от нативных модулей.
 *
 * Поддерживается минимальный набор API, который использует photoFiles.ts:
 * Directory (constructor, uri, name, exists, create, delete),
 * File (constructor, uri, name, extension, exists, create, write, text, copy,
 * delete) и Paths (document, cache, bundle).
 */

type FsNode = { isDirectory: boolean; content: string };

// Общее in-memory хранилище: uri -> узел (файл или директория).
const fs = new Map<string, FsNode>();

// Приводит часть пути к строке uri (Directory/File -> uri, string -> как есть).
function toUri(part: string | { uri: string }): string {
  return typeof part === 'string' ? part : part.uri;
}

// Соединяет части пути в единый uri через '/'.
function joinUri(...parts: (string | { uri: string })[]): string {
  return parts.map(toUri).join('/');
}

// Извлекает имя (последний сегмент) из uri.
function basename(uri: string): string {
  const segments = uri.split('/');
  return segments[segments.length - 1] ?? '';
}

export class Directory {
  uri: string;

  constructor(...uris: (string | File | Directory)[]) {
    this.uri = joinUri(...uris);
  }

  get name(): string {
    return basename(this.uri);
  }

  get exists(): boolean {
    return fs.has(this.uri);
  }

  create(_options?: unknown): void {
    fs.set(this.uri, { isDirectory: true, content: '' });
  }

  delete(): void {
    for (const key of [...fs.keys()]) {
      if (key === this.uri || key.startsWith(`${this.uri}/`)) {
        fs.delete(key);
      }
    }
  }
}

export class File {
  uri: string;

  constructor(...uris: (string | File | Directory)[]) {
    this.uri = joinUri(...uris);
  }

  get name(): string {
    return basename(this.uri);
  }

  get extension(): string {
    const name = this.name;
    const dotIndex = name.lastIndexOf('.');
    return dotIndex >= 0 ? name.slice(dotIndex) : '';
  }

  get exists(): boolean {
    return fs.has(this.uri);
  }

  create(_options?: unknown): void {
    fs.set(this.uri, { isDirectory: false, content: '' });
  }

  write(content: string | Uint8Array): void {
    fs.set(this.uri, {
      isDirectory: false,
      content: typeof content === 'string' ? content : bytesToString(content),
    });
  }

  async text(): Promise<string> {
    return fs.get(this.uri)?.content ?? '';
  }

  async copy(destination: Directory | File): Promise<void> {
    const source = fs.get(this.uri);
    if (!source) {
      throw new Error(`Исходный файл не найден: ${this.uri}`);
    }
    fs.set(destination.uri, { ...source });
  }

  delete(): void {
    fs.delete(this.uri);
  }
}

// Переводит байты в строку (для совместимости с write(Uint8Array)).
function bytesToString(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

export const Paths = {
  get document(): Directory {
    return new Directory('file:///document');
  },
  get cache(): Directory {
    return new Directory('file:///cache');
  },
  get bundle(): Directory {
    return new Directory('file:///bundle');
  },
};
