# STACK_RESOLVED — фактически установленные версии проекта

> Этот файл заполняется агентом после создания Expo-проекта.
> После заполнения он становится источником истины по версиям.
> Не редактировать вручную без причины.

## Runtime окружение

> Раздел ниже описывает МАШИНУ, на которой шла разработка до 2026-08-22
> (Intel Mac, macOS 15.7.7). На ней сборка iOS невозможна (см. «Замечания»).
> После переноса на новый Mac — обновить этот раздел фактическими версиями
> новой машины. Версии из package.json НЕ зависят от машины.

- Node.js: v20.17.0 (⚠ ниже минимальной для RN 0.86: ^20.19.4)
- npm: 10.8.2
- Expo CLI: create-expo-app@4.0.0
- OS сборки: macOS 15.7.7 (Sequoia, Intel x86_64)
- Xcode: 16.4 (Build 16F6), Swift 6.1.2 (⚠ ниже требуемого — нужен Xcode 26)
- Ruby: системный 2.6.10 (⚠ устарел) + rbenv 3.3.12 (для CocoaPods)
- CocoaPods: 1.17.0 (установлен через rbenv Ruby 3.3.12)

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

Примечание: единственный fail — отсутствие CocoaPods (требует sudo для
установки). Ранее выявленный сдвиг `@types/jest` (30.0.0 -> 29.5.14) исправлен.

## Замечания по совместимости

- ⚠ Xcode 16.3/16.4 (Swift 6.1.x) НЕ собирают Expo SDK 57: пакеты
  expo-modules-jsi и @expo/expo-modules-macros-plugin объявлены как
  `swift-tools-version: 6.2`. Сборка падает с `package 'apple' is using Swift
  tools version 6.2.0 but the installed version is 6.1.0`.
  Требуется Xcode 26.x (Swift 6.2+). Важно: standalone Swift 6.2 toolchain
  (swift.org) НЕ помогает — `xcodebuild` проверяет swift-tools-version
  встроенным в Xcode SwiftPM, а не toolchain-ом.
- Node v20.17.0 ниже требуемого минимума для react-native@0.86.2
  (^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0). npm install выдал
  EBADENGINE warnings, но установка завершилась. При появлении ошибок
  сборки — обновить Node.
- Системный Ruby 2.6.10 слишком старый для CocoaPods (зависимость ffi
  требует Ruby 3.0+). Решено установкой Ruby 3.3.12 через rbenv
  (`~/.rbenv/versions/3.3.12`) и `gem install cocoapods`; в PATH добавлять
  `~/.rbenv/versions/3.3.12/bin`.

## Перенос на новую машину

Требования целевой машины (Apple Silicon Mac, macOS 26):

- Xcode 26.x (`xcodebuild -version` → Swift 6.2+) — обязателен для Expo SDK 57.
- Node.js >= 20.19.4 (рекомендуется LTS 22).
- CocoaPods >= 1.15.2 (на Apple Silicon достаточно `brew install cocoapods`).
- Папки `ios/` и `android/` в .gitignore — их нет в репозитории, генерируются
  через `npx expo prebuild --platform ios`.

Порядок после клонирования:

```bash
git pull
node -v                      # >= 20.19.4
xcodebuild -version          # Xcode 26.x
pod --version                # >= 1.15.2
npm install
npx expo prebuild --platform ios
npx expo run:ios             # собрать и запустить dev build
```

Затем проверить 4.8 (данные переживают перезапуск) и продолжить с Фазы 7.
