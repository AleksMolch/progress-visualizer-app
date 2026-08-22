# STACK_LOCK — ПОЛИТИКА ВЕРСИЙ И СОВМЕСТИМОСТИ

> ВАЖНО ДЛЯ AI-АГЕНТА:
> Не полагайся на память о версиях библиотек.
> Не выдумывай версии Expo, React Native, Reanimated, Gesture Handler, gluestack-ui.
> Источник истины после инициализации проекта: package.json, app.json,
> package-lock.json и node_modules.

## Главный принцип

Проект должен быть создан на актуальном стабильном Expo SDK
через официальный шаблон Expo Router.

Стартовая команда:

```bash
npx create-expo-app@latest . --template
```

Если CLI предложит шаблон — выбрать TypeScript + Expo Router template.

## После создания проекта

Сразу после инициализации агент обязан:

1. Прочитать package.json.
2. Определить фактически установленные версии:
   - expo
   - react
   - react-native
   - expo-router
   - react-native-reanimated
   - react-native-gesture-handler
3. Запустить:

```bash
npx expo-doctor
```

4. Создать файл STACK_RESOLVED.md и записать туда реальные версии.
5. Дальше использовать только версии из STACK_RESOLVED.md, а не из памяти.

## Правила установки зависимостей

Для Expo-совместимых библиотек использовать:

```bash
npx expo install <package-name>
```

Не использовать npm install для Expo/native-зависимостей без причины.

После каждой установки запускать:

```bash
npx expo-doctor
```

Если expo-doctor сообщает несовместимость — не игнорировать, исправить.

## Обязательный стек проекта

### Core

- Expo, актуальный стабильный SDK
- React Native версия, поставляемая этим Expo SDK
- React версия, поставляемая этим Expo SDK
- TypeScript strict
- Expo Router
- New Architecture, если она включена выбранным Expo SDK по умолчанию

### UI / UX

- gluestack-ui — использовать только если актуальная версия совместима
  с установленным Expo/RN.
  РЕШЕНИЕ (Фаза 3): НЕ используется — отказ в пользу собственной UI-системы,
  подробности в DECISIONS.md.
- react-native-reanimated — версия, совместимая с Expo SDK
- react-native-gesture-handler — версия, совместимая с Expo SDK
- react-native-edge-to-edge — подключать только после проверки совместимости
  с текущим Expo SDK
- expo-image — для отображения локальных фотографий

### Camera / Local device APIs

Все устанавливать через npx expo install:

- expo-camera
- expo-file-system
- expo-media-library
- expo-local-authentication
- expo-secure-store
- expo-notifications

### State / Storage

Основной state manager:

- zustand

Основное локальное хранилище метаданных:

- react-native-mmkv

Важно:

- MMKV требует development build
- Не рассчитывать на работу MMKV в Expo Go
- Если MMKV не совместим с текущим SDK или вызывает блокирующие проблемы —
  остановиться и спросить пользователя
- Не заменять молча на AsyncStorage

Опционально:

- jotai — подключать только если есть реальная потребность в атомарном UI-state,
  не подключать "на всякий случай"

## Expo Go / Development Build

Так как проект использует MMKV и другие native-модули,
основной режим разработки:

```bash
npx expo run:ios
npx expo run:android
```

или EAS Development Build.

Expo Go не является целевой средой разработки для этого проекта.

## Запрет на галлюцинации API

Если агент не уверен в API библиотеки, он обязан:

1. Прочитать локальные типы в node_modules.
2. Проверить README установленного пакета.
3. Проверить примеры в официальной документации, если доступна.
4. Если всё ещё не уверен — остановиться и спросить пользователя.

Запрещено писать код на основе "похожего API из памяти".
