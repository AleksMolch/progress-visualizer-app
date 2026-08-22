# STACK_RESOLVED — фактически установленные версии проекта

> Этот файл заполняется агентом после создания Expo-проекта.
> После заполнения он становится источником истины по версиям.
> Не редактировать вручную без причины.

## Runtime окружение

> Раздел описывает АКТУАЛЬНУЮ машину разработки (Apple Silicon Mac).
> Версии из package.json НЕ зависят от машины.

- Node.js: v22.18.0 (✓ >= 20.19.4)
- npm: 10.9.3
- OS сборки: macOS 26.3.1 (Build 25D2128)
- Архитектура: Apple M4 (arm64)
- Xcode: 26.6 (Build 17F113), Swift 6.3.3 (✓ >= 6.2, требуется для Expo SDK 57)
- Homebrew: 6.0.18
- CocoaPods: 1.17.0 (установлен через `brew install cocoapods`)

> ⚠ Расположение проекта: перенесён на ASCII-путь
> `/Users/aleks/dev/progress-visualizer-app`. Старый путь
> `/Volumes/Т5-Documents/Project/progress-visualizer-app` содержал кириллицу
> (том «Т5-Documents»), из-за которой `pod install` падал с ошибкой
> `Invalid hermes-engine.podspec: incompatible character encodings:
> BINARY (ASCII-8BIT) and UTF-8` (подспек hermes-engine подставляет вывод
> `node -p require.resolve(...)` с кириллическими байтами в UTF-8 литерал).
> Локаль `LC_ALL`/`LANG` не помогает — `readpartial` всегда возвращает
> бинарную кодировку. Решение: перенос на ASCII-путь, на старом месте оставлен
> симлинк для обратной совместимости.

## Версии из package.json

- expo: ~57.0.15
- react: 19.2.3
- react-native: 0.86.2
- expo-router: ~57.0.15
- react-native-reanimated: 4.5.1
- react-native-gesture-handler: ~2.32.0
- react-native-worklets: 0.10.1
- typescript: ~6.0.3
- react-native-safe-area-context: ~5.7.0
- react-native-screens: ~4.26.0
- expo-image: ~57.0.3

## Дополнительные библиотеки (заполняется по мере установки)

- gluestack-ui: НЕ используется (отказ в Фазе 3, см. DECISIONS.md)
- zustand: ^5.0.15
- react-native-mmkv: ^4.3.2 (Nitro-модуль)
- react-native-nitro-modules: ^0.37.0 (зависимость MMKV v4)
- jotai: (не установлен)
- expo-camera: ~57.0.4
- expo-file-system: ~57.0.5
- expo-media-library: (не установлен)
- expo-local-authentication: (не установлен)
- expo-secure-store: ~57.0.1
- expo-crypto: ~57.0.1 (генерация ключа шифрования)
- expo-notifications: (не установлен)
- expo-image: ~57.0.3 (уже в template)
- react-native-edge-to-edge: не нужен (нативно в RN 0.86, см. DECISIONS.md)
- @react-native-community/slider: 5.2.0 (слайдер прозрачности ghost overlay, Фаза 7)
- expo-local-authentication: ~57.0.2 (биометрическая защита, Фаза 10)

## Результат expo-doctor

Дата проверки: 2026-08-22

Команда:

```bash
npx expo-doctor
```

Результат:

```text
Running 18 checks on your project...
17/18 checks passed. 1 checks failed. Possible issues detected:
✖ Check native tooling versions
CocoaPods version check failed. CocoaPods may not be installed or there may be
an issue with your CocoaPods installation. Installing version 1.15.2 or higher
is recommended.
```

Примечание: на предыдущей машине (Intel Mac) CocoaPods отсутствовал (требовал
sudo). После переноса на новую машину и установки CocoaPods 1.17.0 через
Homebrew повторный `npx expo-doctor` показывает **21/21 checks passed**.

## Замечания по совместимости

- ✅ Xcode 26.6 (Swift 6.3.3) собирает Expo SDK 57 без ошибок (0 errors,
  0 warnings). Предыдущая проблема (`swift-tools-version: 6.2` на Xcode 16.4)
  снята переносом на Xcode 26.
- ✅ Node v22.18.0 соответствует минимуму react-native@0.86.2
  (^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0). EBADENGINE warnings
  с предыдущей машины больше не актуальны.
- ⚠ CocoaPods падает с encoding-ошибкой, если путь проекта содержит
  кириллицу (см. раздел «Runtime окружение»). Проект перенесён на ASCII-путь.
- Системный Ruby 2.6.10 слишком старый для CocoaPods, но на этой машине
  CocoaPods установлен через Homebrew (собственный Ruby 4.0.6) — rbenv не нужен.

## Перенос на новую машину

Выполнен 2026-08-22. Итог:

- Проект перенесён на ASCII-путь `/Users/aleks/dev/progress-visualizer-app`.
- Окружение соответствует требованиям (см. «Runtime окружение»).
- Development build собран и запущен; MMKV и персистентность проверены (4.8).

Порядок для будущих машин (после клонирования):

```bash
git pull
node -v                      # >= 20.19.4
xcodebuild -version          # Xcode 26.x (Swift 6.2+)
pod --version                # >= 1.15.2 (brew install cocoapods)
npm install
npx expo prebuild --platform ios
npx expo run:ios             # собрать и запустить dev build
```

⚠ Убедиться, что путь проекта НЕ содержит не-ASCII символов (кириллицы) —
иначе `pod install` упадёт с encoding-ошибкой.
