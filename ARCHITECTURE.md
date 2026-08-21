# ARCHITECTURE

## Цель архитектуры

Создать privacy-first приложение, где UI, состояние и локальное хранение разделены.

Главная ошибка, которую нужно избежать: смешать работу камеры, файловой системы,
store и компонентов в одном месте.

## Структура папок

```text
/app
  _layout.tsx
  /(tabs)
    _layout.tsx
    index.tsx
    camera.tsx
    settings.tsx
  /project
    [id].tsx

/src
  /components
    /ui
    /layout

  /features
    /projects
    /camera
    /gallery
    /settings
    /privacy
    /support

  /models
    project.ts
    photo.ts
    settings.ts

  /store
    appStore.ts
    projectStore.ts
    settingsStore.ts

  /storage
    mmkv.ts
    secureKeys.ts
    photoFiles.ts

  /theme
    index.ts

  /utils
    dates.ts
    ids.ts
```

Фактическая структура может немного отличаться по мере разработки,
но границы слоёв ниже обязательны.

## Границы слоёв

### UI layer

Расположение:

```text
/app
/src/components
/src/features/*/components
```

Разрешено:

- отображать данные
- вызывать actions из store
- показывать состояния загрузки/ошибок
- использовать UI-компоненты

Запрещено:

- напрямую писать в файловую систему
- напрямую работать с MMKV
- создавать encryption key
- делать сетевые запросы

### Store layer

Расположение:

```text
/src/store
```

Разрешено:

- хранить состояние приложения
- предоставлять actions
- вызывать storage-сервисы

Запрещено:

- содержать JSX
- напрямую зависеть от экранов
- делать сетевые запросы

### Storage layer

Расположение:

```text
/src/storage
```

Разрешено:

- MMKV
- SecureStore
- FileSystem
- операции с локальными файлами

Запрещено:

- UI
- навигация
- сетевые запросы

### Models

Расположение:

```text
/src/models
```

Только TypeScript-типы и схемы.
Без React, без storage, без UI.

### Utils

Расположение:

```text
/src/utils
```

Только чистые функции.
Легко тестируемые.

## Network policy

В проекте не должно быть папок:

```text
/src/api
/src/network
/src/services/api
```

Если такая папка появилась — это архитектурный красный флаг.

Исключение возможно только после отдельного решения пользователя
и записи в DECISIONS.md.

## Privacy boundary

Единственные места, где разрешена работа с приватными данными:

- /src/storage
- /src/store

UI может получать уже подготовленные данные,
но не должен управлять приватным хранилищем напрямую.
