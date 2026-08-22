# STACK_RESOLVED — фактически установленные версии проекта

> Этот файл заполняется агентом после создания Expo-проекта.
> После заполнения он становится источником истины по версиям.
> Не редактировать вручную без причины.

## Runtime окружение

- Node.js: v20.17.0 (⚠ ниже минимальной для RN 0.86: ^20.19.4)
- npm: 10.8.2
- Expo CLI: create-expo-app@4.0.0
- OS сборки: macOS (darwin)

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

- Node v20.17.0 ниже требуемого минимума для react-native@0.86.2
  (^20.19.4 || ^22.13.0 || ^24.3.0 || >= 25.0.0). npm install выдал
  EBADENGINE warnings, но установка завершилась. При появлении ошибок
  сборки — обновить Node.
