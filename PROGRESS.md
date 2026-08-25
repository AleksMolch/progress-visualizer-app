# PROGRESS — журнал сессий

> AI-агент:
> В начале каждой новой сессии читай последнюю запись.
> В конце каждой завершённой фазы добавляй новую запись.
> Не пропускай этот шаг — это механизм восстановления контекста.

## ⚠️ ВАЖНО ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ (читай первым)

- **Где мы сейчас**: закрыты Фазы 0–14. Последняя — Фаза 14 (псевдо-timelapse).
  Следующая — **Фаза 15 «Полировка и подготовка портфолио»** (TODO.md, раздел 15).
  Готовый стартовый промпт для новой сессии — в файле `NEXT_SESSION.md`.
- **Рабочая папка проекта теперь**: `/Users/aleks/dev/progress-visualizer-app`
  (ASCII-путь). СТАРЫЙ путь `/Volumes/Т5-Documents/Project/progress-visualizer-app`
  содержит кириллицу в имени тома и ломает CocoaPods — там НЕ работай.
  При старте сессии проверь `pwd`; если оказался на старом пути — перейди на новый.
- Старый путь остаётся git-репозиторием и указан как `origin` у нового
  (`git remote -v`), но он ОТСТАЁТ на 5 коммитов (Фазы 7–10). Источник истины —
  новый путь. При `git pull` с нового пути коммиты не потеряются; слияние
  со старым путём не требуется.
- **PATH**: `pod`, `brew` и CocoaPods живут в `/opt/homebrew/bin`.
  Перед любым `npx expo prebuild` / `run:ios` / `pod install` выполни:
  `export PATH="/opt/homebrew/bin:$PATH"`.
- **Окружение**: Node v22.18.0, Xcode 26.6 (Swift 6.3.3), CocoaPods 1.17.0,
  Apple M4, macOS 26.3.1. Всё удовлетворяет Expo SDK 57.
- **Запуск**: MMKV/camera/biometrics — native-модули, работают только в dev build
  (`npx expo run:ios`), НЕ в Expo Go. Metro обычно уже запущен на :8081;
  если нет — `npx expo start --port 8081` в фоне.

## Шаблон записи

### YYYY-MM-DD — Фаза X — название

- Что сделано:
- Какие файлы созданы или изменены:
- Какие команды запускались:
- Результат проверок:
- Известные проблемы:
- Следующий шаг:

---

### 2026-08-21 — Фаза 0 — Bootstrap проекта и фиксация реального стека

- Что сделано: создан Expo-проект (template `default`, TypeScript + Expo Router),
  зафиксированы реальные версии, настроены npm-скрипты, запущено приложение.
- Какие файлы созданы или изменены:
  - созданы проектом: `package.json`, `app.json`, `tsconfig.json`, `.gitignore`,
    `src/`, `assets/`, `scripts/`, `LICENSE`, `CLAUDE.md`, `.vscode/`, `.claude/`
  - заполнены: `STACK_RESOLVED.md`, `PROGRESS.md`
  - изменён: `AGENTS.md` (добавлена заметка про Expo SDK 57 и versioned docs)
  - сгенерирован: `expo-env.d.ts` (gitignored)
- Какие команды запускались:
  - `npx create-expo-app@latest . --template default`
  - `npx expo-doctor`
  - `npm run typecheck`
  - `npx expo start --ios`
- Результат проверок:
  - expo-doctor: 18/18 checks passed
  - typecheck: без ошибок (после генерации `expo-env.d.ts`)
  - запуск: iOS Bundled 15095ms (1680 modules), Expo Go 57.0.9 на iPhone 14 Pro Max
- Известные проблемы:
  - Node v20.17.0 ниже минимума RN 0.86 (^20.19.4) — EBADENGINE warnings при install,
    но сборка/запуск работают. При ошибках — обновить Node.
  - CocoaPods не установлен — `expo run:ios` (native build) пока недоступен,
    используется Expo Go.
  - В template есть артефакты `CLAUDE.md`/`.claude/` (для Claude Code) и `LICENSE`
    (MIT) — решить, оставлять ли, в следующей фазе.
- Следующий шаг: Фаза 1 (TypeScript strict, ESLint/Prettier, структура папок
  по ARCHITECTURE.md, базовые типы).

---

### 2026-08-21 — Фаза 1 — TypeScript, качество кода и базовая структура

- Что сделано: подтверждён TypeScript strict; настроены ESLint (flat config,
  eslint-config-expo SDK 57) и Prettier; создана структура папок по
  ARCHITECTURE.md; созданы базовые типы Project, PhotoMetadata, AppSettings;
  созданы пустые feature-папки.
- Какие файлы созданы или изменены:
  - созданы: `eslint.config.js`, `.prettierrc`, `.prettierignore`,
    `src/models/project.ts`, `src/models/photo.ts`, `src/models/settings.ts`,
    пустые папки `src/features/*`, `src/store`, `src/storage`, `src/theme`,
    `src/utils`, `src/components/layout` (с `.gitkeep`)
  - изменены: `package.json` (scripts + devDependencies), `ARCHITECTURE.md`
    (корень роутера `src/app`), `DECISIONS.md` (решение по `src/app`),
    `src/hooks/use-color-scheme.web.ts` (фикс `react-hooks/set-state-in-effect`)
- Какие команды запускались:
  - `npx expo install eslint eslint-config-expo`
  - `npm install --save-dev prettier eslint-config-prettier`
  - `npm run lint`
  - `npm run typecheck`
  - `npx prettier --check .`
- Результат проверок:
  - typecheck: без ошибок
  - lint: без ошибок и предупреждений
  - prettier --check: 14 файлов (код шаблона Expo + markdown-документация)
    не отформатированы — не правились, чтобы не менять пользовательскую
    документацию и код шаблона; доступен `npm run format`
- Известные проблемы:
  - eslint/eslint-config-expo установились в dependencies, перенесены
    в devDependencies вручную.
  - Prettier-форматирование отложено для пользовательских md-файлов и кода
    шаблона (будет заменён в Фазе 2).
- Следующий шаг: Фаза 2 (навигация Expo Router: root layout, tabs, экран
  проекта, placeholder-экраны).

---

### 2026-08-21 — Фаза 2 — Навигация Expo Router

- Что сделано: корневой layout на Stack (expo-router/stack); группа вкладок
  (tabs) с Projects/Camera/Settings на Tabs (expo-router/js-tabs); экран
  project/[id]; placeholder-экраны; удалён демо-код шаблона.
- Какие файлы созданы или изменены:
  - созданы: `src/app/(tabs)/_layout.tsx`, `src/app/(tabs)/index.tsx`,
    `src/app/(tabs)/camera.tsx`, `src/app/(tabs)/settings.tsx`,
    `src/app/project/[id].tsx`
  - переписан: `src/app/_layout.tsx` (Stack вместо AppTabs/ThemeProvider)
  - удалены: демо-файлы шаблона (`src/app/index.tsx`, `src/app/explore.tsx`,
    `src/components/*`, `src/hooks/*`, `src/constants/theme.ts`, `src/global.css`)
- Какие команды запускались:
  - `npm run typecheck`
  - `npm run lint`
  - `npx expo start --ios` (регенерация typed routes + проверка бандла)
  - `xcrun simctl openurl` (deep link `/project/demo`)
- Результат проверок:
  - typecheck: без ошибок (после регенерации typed routes)
  - lint: без ошибок
  - бандл: iOS Bundled 2228ms (1269 модулей), без ошибок
  - навигация: маршруты `/camera`, `/settings`, `/`, `/project/[id]`
    сгенерированы; deep link на `/project/demo` открылся без ошибок
- Известные проблемы:
  - Визуальную проверку навигации по табам автоматически выполнить не удалось
    (модель не поддерживает ввод изображений) — нужна ручная проверка.
  - Остались неиспользуемые зависимости шаблона (expo-device, expo-symbols,
    @expo/ui, expo-glass-effect) и демо-ассеты — чистка в Фазе 15.
- Следующий шаг: Фаза 3 (gluestack-ui: проверить совместимость, подключить
  UI-систему, базовые компоненты, тема, edge-to-edge).

---

### 2026-08-21 — Фаза 3 — UI-система (отказ от gluestack-ui, custom UI)

- Что сделано: исследована совместимость gluestack-ui — отказ; создана
  собственная UI-система (токены темы + базовые компоненты); тема следует
  системной схеме; edge-to-edge оставлен нативным.
- Какие файлы созданы или изменены:
  - созданы: `src/theme/index.ts` (токены), `src/theme/ThemeProvider.tsx`
    (провайдер + useAppTheme), `src/components/ui/app-text.tsx`,
    `app-button.tsx`, `app-screen.tsx`, `app-card.tsx`
  - изменены: `src/app/_layout.tsx` (ThemeProvider), `src/app/(tabs)/_layout.tsx`
    (headerShown: false), все экраны (`index/camera/settings/project[id]`)
    переведены на новые компоненты
  - обновлены: `DECISIONS.md` (2 решения), `STACK_RESOLVED.md`,
    `STACK_LOCK.md`, `TODO.md`
- Какие команды запускались:
  - `npm view gluestack-ui / nativewind / @gluestack-ui/*` (исследование)
  - `npm run typecheck`
  - `npm run lint`
  - `npx expo start --ios`
- Результат проверок:
  - typecheck: без ошибок
  - lint: без ошибок
  - запуск: iOS Bundled 2095ms (1276 модулей), без runtime-ошибок
- Известные проблемы:
  - Android-проверка не выполнена (нет эмулятора в окружении) — нужна ручная.
  - Визуальная проверка темы/компонентов — ручная (модель не читает скриншоты).
- Следующий шаг: Фаза 4 (MMKV + SecureStore + Zustand: локальное хранилище,
  store с persist, unit-тесты).

---

### 2026-08-21 — Фаза 4 — Локальное хранилище: MMKV + SecureStore + Zustand

- Что сделано: установлены zustand, react-native-mmkv (v4, Nitro-модуль),
  react-native-nitro-modules, expo-secure-store, expo-crypto; реализованы
  secureKeys (ключ через SecureStore), mmkv (AES-256), три store с persist;
  написаны unit-тесты.
- Какие файлы созданы или изменены:
  - созданы: `src/storage/secureKeys.ts`, `src/storage/mmkv.ts`,
    `src/storage/init.ts`, `src/store/projectStore.ts`, `src/store/settingsStore.ts`,
    `src/store/appStore.ts`, `src/store/index.ts`, `src/utils/ids.ts`,
    `jest.config.js`, `__mocks__/react-native-mmkv.ts`,
    `src/store/projectStore.test.ts`, `src/store/settingsStore.test.ts`
  - изменены: `src/app/_layout.tsx` (инициализация хранилища до рендера),
    `tsconfig.json` (`types: jest`), `package.json` (зависимости),
    `app.json` (bundleIdentifier + plugin expo-secure-store),
    `STACK_RESOLVED.md`
- Какие команды запускались:
  - `npx expo install react-native-mmkv react-native-nitro-modules expo-secure-store zustand expo-crypto`
  - `npm install --save-dev jest jest-expo @types/jest`
  - `npm test`, `npm run typecheck`, `npm run lint`
  - `npx expo prebuild --platform ios --no-install`
- Результат проверок:
  - unit-тесты: 9/9 passed
  - typecheck: без ошибок; lint: без ошибок
  - prebuild: успешно (нативный iOS-проект, автолинковка nitro/mkv настроена)
  - для Jest: react-native-mmkv замокан вручную (`__mocks__/react-native-mmkv.ts`),
    т.к. Nitro-модули падают при импорте в тестовом окружении
- Известные проблемы:
  - 4.8 (development build + persist после перезапуска) НЕ проверено:
    CocoaPods не установлен и требует sudo (Homebrew отсутствует, системный
    Ruby 2.6.10). Нужна ручная установка CocoaPods и `npx expo run:ios`.
  - Node v20.17.0 ниже минимума RN 0.86 — риск при нативной сборке.
  - bundleIdentifier временный (`com.anonymous.*`) — заменить в Фазе 15.
- Следующий шаг: Фаза 5 (file storage фотографий в sandbox); dev-build
  (4.8) вернуться к ручной проверке при наличии CocoaPods.

---

### 2026-08-22 — Фаза 5 — File storage для фотографий

- Что сделано: установлен expo-file-system (~57.0.5); реализован storage-модуль
  photoFiles.ts (ensureAppPhotoDirectory, createProjectPhotoDirectory,
  savePhotoToProject, deletePhotoFile, deleteProjectPhotoDirectory) на новом
  объектном API (Directory/File/Paths); фото хранятся в
  `Paths.document/photos/<projectId>/`; написан ручной мок expo-file-system и
  unit-тесты; исправлен сдвиг версии @types/jest (30.0.0 -> ~29.5.14) по
  expo-doctor; зафиксировано privacy-решение в DECISIONS.md.
- Какие файлы созданы или изменены:
  - созданы: `src/storage/photoFiles.ts`, `src/storage/photoFiles.test.ts`,
    `__mocks__/expo-file-system.ts`
  - изменены: `DECISIONS.md` (решение о sandbox-хранении), `STACK_RESOLVED.md`
    (expo-file-system), `TODO.md` (Фаза 5 закрыта), `package.json` (@types/jest)
- Какие команды запускались:
  - `npx expo install expo-file-system`
  - `npm run typecheck`
  - `npm run lint`
  - `npm test` (и `npx jest src/storage/photoFiles.test.ts`)
  - `npx expo-doctor`
  - `npm install --save-dev @types/jest@~29.5.14`
- Результат проверок:
  - typecheck: без ошибок
  - lint: без ошибок и предупреждений
  - тесты: 17/17 passed (8 новых для photoFiles, мок file API in-memory)
  - expo-doctor: 17/18 (единственный fail — отсутствие CocoaPods, см. ниже)
- Известные проблемы:
  - Реальная запись файла в sandbox НЕ проверена: нужен development build
    (MMKV не работает в Expo Go), а CocoaPods не установлен и требует sudo.
    Функции покрыты unit-тестами с моком; ручная проверка — после установки
    CocoaPods (`npx expo run:ios`).
  - `@types/jest` был 30.0.0 при ожидаемом 29.5.14 (сдвиг из Фазы 4) —
    приведён к ~29.5.14, expo-doctor больше не ругается.
- Следующий шаг: Фаза 6 (камера и разрешения: expo-camera, экран съёмки,
  сохранение в sandbox через photoFiles.ts).

---

### 2026-08-22 — Фаза 6 — Камера и разрешения

- Что сделано: установлен expo-camera (~57.0.4); изучен актуальный API по типам
  (CameraView/useCameraPermissions/takePictureAsync); реализован экран съёмки
  (запрос разрешения, превью, выбор активного проекта чипами, кнопка затвора);
  захват сохраняется в sandbox через store-действие saveCapturedPhoto
  (копирование файла + метаданные); микрофон и сканер штрих-кодов отключены
  (минимальные разрешения).
- Какие файлы созданы или изменены:
  - изменены: `src/app/(tabs)/camera.tsx` (реальный экран камеры),
    `src/store/projectStore.ts` (+saveCapturedPhoto), `src/store/projectStore.test.ts`
    (+тест сохранения кадра), `app.json` (плагин expo-camera с минимальными
    разрешениями), `DECISIONS.md` (минимальные разрешения), `STACK_RESOLVED.md`
    (expo-camera), `TODO.md` (Фаза 6 закрыта)
- Какие команды запускались:
  - `npx expo install expo-camera`
  - `npm run typecheck`
  - `npm run lint`
  - `npm test` (и `npx jest src/store/projectStore.test.ts`)
  - `npx expo export --platform ios` (проверка бандла)
  - `npx expo-doctor`
- Результат проверок:
  - typecheck: без ошибок
  - lint: без ошибок и предупреждений
  - тесты: 18/18 passed (новый тест saveCapturedPhoto: файл + метаданные)
  - бандл: iOS Bundled 14989ms (1243 модуля), без ошибок
  - expo-doctor: 17/18 (единственный fail — CocoaPods)
- Известные проблемы:
  - Реальная съёмка НЕ проверена: camera preview и permission-диалог требуют
    development build, а CocoaPods не установлен (требует sudo). Логика
    сохранения покрыта unit-тестами с моками; ручная проверка — после
    установки CocoaPods (`npx expo run:ios`).
- Следующий шаг: Фаза 7 (ghost overlay и сетка поверх превью камеры).

---

### 2026-08-22 — Разблокировка 4.8: среда и перенос на новую машину

- Что сделано: разбирался с блоком 4.8 (development build для проверки, что
  данные переживают перезапуск). Установил CocoaPods 1.17.0 (Ruby 3.3.12 через
  rbenv), перегенерировал `ios/` с expo-camera. Выяснил настоящую причину, по
  которой сборка невозможна на этой машине.
- Итог (важно): Expo SDK 57 требует Swift 6.2 (Xcode 26) — пакеты
  expo-modules-jsi и @expo/expo-modules-macros-plugin объявлены
  `swift-tools-version: 6.2`, а исходники используют `sending`/`@isolated(any)`
  (фичи Swift 6.2). Эта машина (Intel Mac, macOS 15.7.7) физически заперта на
  Xcode 16.4 (Swift 6.1.2). Standalone Swift 6.2 toolchain НЕ помогает:
  xcodebuild проверяет swift-tools-version встроенным SwiftPM, а не toolchain-ом.
- Известные проблемы:
  - Локальная iOS-сборка невозможна на этой машине. Без dev build нельзя
    запускать приложение (MMKV не работает в Expo Go) — блокирует 4.8 и
    дальнейшие фазы, требующие запуска.
  - Node v20.17.0 ниже минимума RN 0.86 (^20.19.4) — риск, но iOS-сборка
    дошла до компиляции, значит на этапе бандла проблем не возникло.
- Следующий шаг (на новом Mac): Apple Silicon / macOS 26 + Xcode 26,
  Node ≥ 20.19.4, CocoaPods. Шаги переноса и продолжение — см. TODO 4.8
  и раздел «Перенос на новую машину» в STACK_RESOLVED.md.

---

### 2026-08-22 — Разблокировка 4.8: перенос на новый Mac и проверка persist

- Что сделано: перенесён на Apple Silicon Mac (Apple M4, macOS 26.3.1,
  Xcode 26.6, Swift 6.3.3); установлены Homebrew 6.0.18 и CocoaPods 1.17.0;
  собран и запущен development build (`npx expo run:ios`); проверено, что MMKV
  инициализируется (v2.4.0, AES-256) и данные переживают перезапуск приложения.
- Какие файлы созданы или изменены:
  - изменены: `STACK_RESOLVED.md` (Runtime окружение обновлён на новую машину,
    expo-doctor 21/21, замечания/перенос), `TODO.md` (пункт 4.8 закрыт)
  - `src/storage/init.ts` — временно правился для проверки persist, затем
    возвращён в исходное состояние (без изменений в итоговом коде)
- Какие команды запускались:
  - `node -v` (v22.18.0), `xcodebuild -version` (Xcode 26.6), `pod --version`
  - `brew install cocoapods` (выполнено пользователем из-за sudo)
  - `git pull`, `npm install`
  - `npx expo prebuild --platform ios`
  - `npx expo run:ios` (Build Succeeded, 0 errors)
  - `npm run typecheck`, `npm run lint`, `npm test` (18/18)
  - `npx expo-doctor` (21/21)
- Результат проверок:
  - development build собрался и запустился на симуляторе iPhone 16 Plus
  - MMKV инициализирован: root dir в sandbox приложения, файл
    `progress-private` загружен (0 key-values на старте)
  - persist после перезапуска подтверждён: значение, записанное в MMKV
    (`__persist_test`), прочиталось после полного terminate + relaunch
    (previous === now предыдущего запуска)
- Известные проблемы:
  - ⚠ Путь `/Volumes/Т5-Documents/...` (кириллица в имени тома) ломает
    CocoaPods: `pod install` падал с `Invalid hermes-engine.podspec:
    incompatible character encodings: BINARY (ASCII-8BIT) and UTF-8`.
    Решение — физический перенос на ASCII-путь
    `/Users/aleks/dev/progress-visualizer-app` (симлинк на старом месте).
    Подробности в STACK_RESOLVED.md.
  - Ошибка `osascript ... Simulator` при `run:ios` — некритична (это про
    активацию окна симулятора); сборка и запуск проходят.
- Следующий шаг: Фаза 7 (ghost overlay и сетка).

---

### 2026-08-22 — Фаза 7 — Ghost overlay и сетка

- Что сделано: реализован ghost overlay (последнее фото активного проекта
  полупрозрачно поверх превью камеры), регулируемая прозрачность слайдером,
  toggle overlay on/off и toggle сетки (правило третей). Обработано состояние
  первого фото (overlay скрыт, контрол отключён). Добавлено поле `ghostEnabled`
  в AppSettings. Логика вынесена в feature-компоненты и чистую утилиту.
- Какие файлы созданы или изменены:
  - созданы: `src/features/camera/components/ghost-overlay.tsx`,
    `grid-overlay.tsx`, `overlay-controls.tsx`, `src/utils/photos.ts`,
    `src/utils/photos.test.ts`
  - изменены: `src/models/settings.ts` (+ghostEnabled),
    `src/store/settingsStore.ts` (DEFAULT_SETTINGS + ghostEnabled),
    `src/store/settingsStore.test.ts` (+тест переключения overlay),
    `src/app/(tabs)/camera.tsx` (подключение overlay/grid/controls),
    `STACK_RESOLVED.md` (+slider), `TODO.md` (Фаза 7 закрыта)
  - package.json: добавлен `@react-native-community/slider` 5.2.0
- Какие команды запускались:
  - `npx expo install @react-native-community/slider`
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo prebuild --platform ios` (автолинковка slider)
  - `npx expo run:ios` (Build Succeeded, 0 errors)
  - `npx expo-doctor`
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 23/23 passed (новые: getLatestPhoto 4 теста + settings 1 тест)
  - expo-doctor: 21/21
  - сборка iOS: успешно, слайдер залинкован (`react-native-slider 5.2.0` в
    Podfile.lock), приложение запускается без runtime-ошибок
- Известные проблемы:
  - Визуальная проверка overlay/grid/slider не выполнена автоматически (модель
    не читает скриншоты) — нужна ручная проверка пользователем.
  - Android-проверка не выполнена (нет Android-эмулятора в окружении).
  - Проверка с реальным фото невозможна без UI создания проекта (Фаза 8) —
    overlay показывается только при наличии фото в проекте.
- Следующий шаг: Фаза 8 (просмотр проектов и фотографий).

---

### 2026-08-22 — Фаза 8 — Просмотр проектов и фотографий

- Что сделано: экран «Проекты» стал рабочим — список проектов, создание и
  переименование через модальное окно, удаление с подтверждением (Alert),
  открытие проекта по тапу. Экран проекта показывает ленту фото (сетка 2 колонки
  через expo-image) с удалением фото по кнопке (с подтверждением). Реализованы
  empty states для списка проектов, ленты фото и «проект не найден». Store теперь
  удаляет не только метаданные, но и файлы из sandbox.
- Какие файлы созданы или изменены:
  - созданы: `src/features/projects/components/project-form-modal.tsx`,
    `project-list-item.tsx`, `src/utils/dates.ts`, `src/utils/dates.test.ts`
  - изменены: `src/store/projectStore.ts` (deleteProject/deletePhoto удаляют
    файлы через deleteProjectPhotoDirectory/deletePhotoFile),
    `src/store/projectStore.test.ts` (+2 теста на удаление файлов),
    `src/app/(tabs)/index.tsx` (список + CRUD), `src/app/project/[id].tsx`
    (лента фото + удаление), `TODO.md` (Фаза 8 закрыта)
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo-doctor`
  - `npx expo run:ios` не потребовался повторно (изменения только JS) — бандл
    перезагружен через Metro, приложение перезапущено
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 27/27 passed (новые: 2 на удаление файлов в store + 2 на formatDate)
  - expo-doctor: 21/21
  - приложение запускается без runtime-ошибок (redbox/fatal не найдены в логах)
- Известные проблемы:
  - Визуальная проверка списка/модалки/ленты не выполнена автоматически (модель
    не читает скриншоты) — нужна ручная проверка пользователем.
  - Android-проверка не выполнена (нет Android-эмулятора).
  - При полном цикле «создать проект -> снять фото -> увидеть в ленте» проверка
    возможна только вручную (камера на симуляторе не делает реальный снимок).
- Следующий шаг: Фаза 9 (сравнение фото: Reanimated + Gesture Handler).

---

### 2026-08-22 — Фаза 9 — Сравнение фото: Reanimated + Gesture Handler

- Что сделано: полноэкранный просмотрщик фото (горизонтальная лента со свайпом
  между фото + pinch-to-zoom каждого фото), экран сравнения «до/после» с двумя
  режимами (перетаскиваемый разделитель и «рядом»). Сравнение работает с
  предыдущим фото по takenAt. Добавлены чистые утилиты выборки и тесты.
- Какие файлы созданы или изменены:
  - созданы: `src/features/gallery/components/zoomable-photo.tsx`,
    `compare-slider.tsx`, `compare-side-by-side.tsx`,
    `src/app/project/[id]/_layout.tsx` (вложенный Stack),
    `src/app/project/[id]/viewer/[photoId].tsx`,
    `src/app/project/[id]/compare/[photoId].tsx`
  - переименован: `src/app/project/[id].tsx` → `src/app/project/[id]/index.tsx`
    (нужно для вложенных маршрутов)
  - изменены: `src/utils/photos.ts` (+getProjectPhotos, +getPreviousPhoto),
    `src/utils/photos.test.ts` (+5 тестов), `src/app/_layout.tsx`
    (GestureHandlerRootView + headerShown:false для project/[id]),
    `src/app/project/[id]/index.tsx` (тап по фото открывает viewer),
    `DECISIONS.md` (решение по механизму свайпа/сравнения), `TODO.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo-doctor`
  - перезапуск Metro с `--clear` (устранён stale cache) + relaunch приложения
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 32/32 passed (новые: getProjectPhotos 2 + getPreviousPhoto 3)
  - expo-doctor: 21/21
  - приложение запускается без runtime-ошибок (бандл 1849 модулей)
- Известные проблемы:
  - Визуальная проверка свайпа/zoom/сравнения не выполнена автоматически (модель
    не читает скриншоты) — нужна ручная проверка пользователем.
  - Pinch-zoom в симуляторе не проверяется (нет multitouch) — нужна проверка на
    реальном устройстве.
  - Безвредный warning Reanimated `onAnimatedValueUpdate` при первом рендере.
  - Android-проверка не выполнена (нет Android-эмулятора).
- Следующий шаг: Фаза 10 (биометрическая защита).

---

### 2026-08-22 — Фаза 10 — Биометрическая защита

- Что сделано: установлен expo-local-authentication; реализованы storage-обёртка
  (isBiometricsAvailable, authenticateWithBiometrics), lock screen и
  BiometricsGate (route protection на всё приложение в root layout); добавлен
  UI-переключатель защиты в Settings; добавлен fallback, когда биометрия
  недоступна; плагин FaceID в app.json. Чистая функция shouldLock покрыта тестами.
- Какие файлы созданы или изменены:
  - созданы: `src/storage/biometrics.ts`, `src/utils/security.ts`,
    `src/utils/security.test.ts`,
    `src/features/privacy/components/lock-screen.tsx`,
    `biometrics-gate.tsx`
  - изменены: `src/app/_layout.tsx` (BiometricsGate поверх Stack),
    `src/store/appStore.ts` (+isUnlocked/setUnlocked, не персистится),
    `src/app/(tabs)/settings.tsx` (переключатель биометрии),
    `app.json` (плагин expo-local-authentication + NSFaceIDUsageDescription),
    `TODO.md` (Фаза 10 закрыта)
  - package.json: добавлен `expo-local-authentication` ~57.0.2
- Какие команды запускались:
  - `npx expo install expo-local-authentication`
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo prebuild --platform ios` (автолинковка + FaceID permission)
  - `npx expo run:ios` (Build Succeeded, 0 errors)
  - `npx expo-doctor`
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 35/35 passed (новые: shouldLock 3 теста)
  - expo-doctor: 21/21
  - сборка iOS: успешно; FaceID description в Info.plist; приложение запускается
- Известные проблемы:
  - Реальная проверка Face ID/Touch ID на симуляторе невозможна (биометрия не
    зарегистрирована, LAContext возвращает code -7 «No identities are enrolled»).
    Fallback отработал корректно: приложение НЕ заблокировалось.
  - Проверка полного цикла «включил защиту -> перезапуск -> запрос биометрии»
    требует реального устройства с зарегистрированной биометрией — ручная.
  - Android-проверка не выполнена (нет Android-эмулятора).
- Следующий шаг: Фаза 11 (локальные уведомления).

---

### 2026-08-24 — Фаза 11 — Локальные уведомления

- Что сделано: установлен expo-notifications (~57.0.14); изучен актуальный API по
  типам (getPermissionsAsync/requestPermissionsAsync/scheduleNotificationAsync/
  cancelScheduledNotificationAsync/setNotificationHandler + DailyTriggerInput).
  Реализована storage-обёртка `notifications.ts` (permission, ежедневное
  расписание с фиксированным id, отмена, обработчик foreground). Добавлена
  карточка «Напоминания» в Settings (переключатель + предустановленное время)
  и чистая функция `parseReminderTime`. Настроен обработчик уведомлений в root
  layout. Выровнены патч-версии SDK 57 через `npx expo install --fix`.
- Какие файлы созданы или изменены:
  - созданы: `src/storage/notifications.ts`, `src/storage/notifications.test.ts`,
    `src/utils/reminders.ts`, `src/utils/reminders.test.ts`,
    `src/features/settings/components/reminder-settings-card.tsx`,
    `__mocks__/expo-notifications.ts`
  - изменены: `src/models/settings.ts` (+reminderTime),
    `src/store/settingsStore.ts` (+reminderTime default),
    `src/app/(tabs)/settings.tsx` (карточка напоминаний),
    `src/app/_layout.tsx` (configureNotificationHandler),
    `STACK_RESOLVED.md`, `DECISIONS.md`, `TODO.md`
  - package.json: добавлен `expo-notifications` ~57.0.14; выровнены
    `expo` ~57.0.16, `expo-router` ~57.0.16, `expo-splash-screen` ~57.0.8,
    `expo-crypto` ~57.0.2, `@expo/ui` ~57.0.13
- Какие команды запускались:
  - `npx expo install expo-notifications`
  - `npx expo install --fix` (выравнивание патч-версий SDK 57)
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo-doctor`
  - `rm -rf ios/Pods ios/Podfile.lock` + `pod install --repo-update`
    (после смены версии expo-modules-core pod install падал с
    «CocoaPods could not find compatible versions for pod ExpoModulesCore»)
  - `npx expo run:ios` (Build Succeeded, 0 errors, 0 warnings)
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 49/49 passed (новые: parseReminderTime 8 + notifications wrapper 6)
  - expo-doctor: 21/21
  - сборка iOS: успешно; pod `ExpoNotifications 57.0.14` в Podfile.lock;
    приложение запускается без runtime-ошибок (в логах нет redbox/fatal;
    LocalAuthentication code -7 «No identities» — ожидаемо из Фазы 10)
- Известные проблемы:
  - Фактический показ баннера напоминания изначально НЕ был проверен автоматически
    (permission-диалог невозможно принять программно). ПОЗЖЕ ПОДТВЕРЖДЕНО
    ПОЛЬЗОВАТЕЛЕМ вручную: баннер напоминания появляется, после выбора разрешения
    доступен выбор времени уведомлений. Функция работает на симуляторе.
  - Android-проверка не выполнена (нет Android-эмулятора); POST_NOTIFICATIONS
    уже в манифесте библиотеки.
  - После отказа на iOS повторный запрос разрешения невозможен — показана
    подсказка включить уведомления в настройках устройства.
- Следующий шаг: Фаза 12 (экран «Поддержать разработчика»).

---

### 2026-08-24 — Фаза 12 — Поддержать разработчика / Premium placeholder

- Что сделано: создан экран «Поддержать разработчика» (маршрут `/support`):
  честное описание приватностной модели (без рекламы/аналитики/трекинга, данные
  только на устройстве) + статус premium с переключателем-заглушкой. Добавлен
  локальный флаг `premiumEnabled` в appStore (персистится в MMKV). IAP НЕ
  подключён. В Settings добавлена кнопка перехода на экран поддержки. Новых
  зависимостей не добавлено.
- Какие файлы созданы или изменены:
  - созданы: `src/app/support.tsx`, `src/store/appStore.test.ts`
  - изменены: `src/store/appStore.ts` (+premiumEnabled/setPremiumEnabled +
    persist), `src/app/_layout.tsx` (маршрут support), `src/app/(tabs)/settings.tsx`
    (кнопка перехода), `DECISIONS.md` (IAP отложен), `TODO.md`, `README.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo-doctor`
  - `npx expo export --platform ios` (проверка бандла)
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 52/52 passed (новые: appStore 3 — premium по умолчанию/переключение)
  - expo-doctor: 21/21
  - бандл iOS: собран без ошибок (3.9MB hbc); в логах приложения нет
    redbox/fatal после hot-reload
- Известные проблемы:
  - Флаг premium пока ни на что не влияет в функциональности — это ожидаемо
    (заглушка до IAP, см. DECISIONS.md).
  - Визуальная проверка экрана поддержки (стили, нативный заголовок) — ручная.
  - Android-проверка не выполнена (нет Android-эмулятора).
- Следующий шаг: Фаза 13 (экспорт фото в галерею).

---

### 2026-08-24 — Фаза 13 — Экспорт в галерею

- Что сделано: установлен expo-media-library (~57.0.4); изучен новый объектный
  API (Asset.create вместо deprecated saveToLibraryAsync, который в SDK 57
  выбрасывает ошибку в runtime). Реализована storage-обёртка `mediaLibrary.ts`
  (write-only permission + экспорт). В полноэкранном просмотрщике добавлена
  кнопка «Экспорт» с Alert-предупреждением «фото окажется вне sandbox».
  Текущее фото отслеживается при свайпе ленты (кнопки «Экспорт»/«Сравнить»
  действуют на видимое фото). Минимальные разрешения: на iOS только
  NSPhotoLibraryAddUsageDescription (без чтения), Android granularPermissions [].
- Какие файлы созданы или изменены:
  - созданы: `src/storage/mediaLibrary.ts`, `src/storage/mediaLibrary.test.ts`,
    `__mocks__/expo-media-library.ts`
  - изменены: `src/app/project/[id]/viewer/[photoId].tsx` (кнопка «Экспорт» +
    отслеживание текущего фото + предупреждение), `app.json` (плагин
    expo-media-library write-only), `DECISIONS.md` (экспорт write-only),
    `TODO.md`, `STACK_RESOLVED.md`
  - package.json: добавлен `expo-media-library` ~57.0.4
- Какие команды запускались:
  - `npx expo install expo-media-library`
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo prebuild --platform ios` (применение плагина → Info.plist)
  - `npx expo run:ios` (Build Succeeded, 0 errors, 0 warnings)
  - `npx expo-doctor`
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 57/57 passed (новые: mediaLibrary 5 — permission/export)
  - expo-doctor: 21/21
  - сборка iOS: успешно; pod `ExpoMediaLibrary 57.0.4` в Podfile.lock;
    в Info.plist есть `NSPhotoLibraryAddUsageDescription` (write-only) и НЕТ
    `NSPhotoLibraryUsageDescription` (чтение не запрашивается)
  - приложение запускается без runtime-ошибок (redbox/fatal не найдены)
- Известные проблемы:
  - Реальный экспорт файла в галерею на симуляторе требует ручной проверки
    (нужно фото в проекте, камера на симуляторе не делает реальный снимок).
    Логика покрыта unit-тестами с моком; permission-диалог «сохранить в фото»
    и фактическое появление фото в «Фото» — ручная проверка на устройстве.
  - Плагин на Android безусловно добавляет legacy-разрешения
    READ/WRITE_EXTERNAL_STORAGE — проверить в Фазе 15 (на Android 10+ они
    не дают доступа, scoped storage).
  - Android-проверка не выполнена (нет Android-эмулятора).
- Следующий шаг: Фаза 14 (timelapse — research, НЕ кодить).

---

### 2026-08-24 — Фаза 14 — Timelapse: research + псевдо-timelapse

- Что сделано: (1) исследована локальная генерация видео-timelapse — поддерживаемой
  НЕ-deprecated JS-библиотеки нет, «чистый» путь только через собственный нативный
  модуль; записано в DECISIONS.md. (2) По решению владельца реализован
  «псевдо-timelapse» без видеофайла: экран `/project/[id]/timelapse` с
  авто-прокруткой фото в хронологическом порядке, паузой/продолжением,
  зацикливанием и счётчиком кадров. Настоящий видео-timelapse записан в TODO.md
  как факультативная задача на будущее (с выводами анализа).
- Какие файлы созданы или изменены:
  - созданы: `src/app/project/[id]/timelapse.tsx`
  - изменены: `src/utils/photos.ts` (+getChronologicalPhotos),
    `src/utils/photos.test.ts` (+2 теста), `src/app/project/[id]/_layout.tsx`
    (маршрут timelapse), `src/app/project/[id]/index.tsx` (кнопка «Timelapse» в
    шапке при ≥2 фото), `DECISIONS.md` (статус решения), `TODO.md`
    (14.5/VERIFICATION + факультативная задача), `README.md`
- Какие команды запускались:
  - `npm view ffmpeg-kit-react-native / react-native-ffmpeg /
    react-native-image-sequence / expo-video / react-native-vision-camera`
  - webfetch docs.expo.dev/versions/v57.0.0/sdk/video
  - `npm run typecheck`, `npm run lint`, `npm test`
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 59/59 passed (новые: getChronologicalPhotos 2)
  - expo-doctor: не перезапускался (новых зависимостей нет, предыдущий 21/21)
- Известные проблемы:
  - Псевдо-timelapse не создаёт видеофайл — это осознанный выбор владельца.
  - Визуальная проверка слайд-шоу (тайминг, пауза, зацикливание) — ручная.
- Следующий шаг: Фаза 15 (полировка и подготовка портфолио).

---

### 2026-08-24 — Фаза 15 — Полировка и подготовка портфолио (MVP завершён)

- Что сделано: аудит приватности (нет network/analytics/ads SDK, нет
  авто-отправки фото, нет лишних разрешений — только камера-фото, Face ID,
  уведомления, запись в галерею); удалены неиспользуемые прямые зависимости
  шаблона (expo-device, expo-web-browser, а @expo/ui, expo-glass-effect,
  expo-symbols — только как транзитивные deps expo-router). Проверены permission
  texts (NSCameraUsageDescription, NSFaceIDUsageDescription,
  NSPhotoLibraryAddUsageDescription write-only). Проверены empty/error/loading
  states (все экраны покрыты). Переписан README.md по template; созданы
  PRIVACY.md и README_staff.md. Финальный прогон зелёный.
- Какие файлы созданы или изменены:
  - созданы: `PRIVACY.md`, `README_staff.md`
  - переписан: `README.md` (по README.template.md)
  - изменены: `package.json` (−5 неиспользуемых зависимостей), `TODO.md`
    (Фаза 15 закрыта), `STACK_RESOLVED.md` (см. ниже)
- Какие команды запускались:
  - `npm uninstall expo-device expo-symbols @expo/ui expo-glass-effect expo-web-browser`
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - `npx expo run:ios` (Build Succeeded, 0 errors)
- Результат проверок:
  - typecheck: без ошибок; lint: без ошибок и предупреждений
  - тесты: 59/59 passed; expo-doctor: 21/21
  - сборка iOS: успешно после удаления зависимостей
- Известные проблемы / что осталось (не блокеры MVP):
  - App icon и splash — ПО-ПРЕЖНЕМУ default Expo-ассеты (icon.png, splash-icon.png,
    expo-logo). Нужны дизайн-ассеты от владельца; ИИ не генерирует качественные
    PNG. Splash-фон уже в фирменном цвете #208AEF.
  - bundleIdentifier временный (`com.anonymous.progress-visualizer-app`) — заменить
    перед публикацией.
  - Визуальная проверка всех экранов — ручная (пользователь может прислать
    скриншоты, см. «Как передать скриншоты» ниже).
  - Android-проверка не выполнена (нет эмулятора).
  - Осталась факультативная задача: нативный модуль видео-timelapse (конец TODO.md).
- Статус: MVP завершён (Фазы 0–15).

---

### Как передать скриншоты для работы над дизайном (для будущих сессий)

- Положи файлы в папку проекта (например, `screenshots/`) или укажи пути.
- ИИ читает их через инструмент чтения файлов (поддержка изображений).
- Честное ограничение: возможность «увидеть» содержимое зависит от визуальных
  возможностей модели. Если не увидит — работаем по текстовым описаниям/размерам.
- Скриншоты нужны для: полировка UI/отступов, app icon/splash, итоговая
  проверка экранов.

---

### 2026-08-24 — ПАМЯТКА ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ (handoff)

- Статус: **MVP завершён** — закрыты Фазы 0–15. Все проверки зелёные.
- Что можно делать дальше (по приоритету владельца):
  1. **App icon + splash** (БЛИЖАЙШАЯ задача) — план, промпты и инструкции
     в `APP_ICON_AND_SPLASH.md`; чек-лист в TODO.md (раздел «ПОДГОТОВКА
     К ПУБЛИКАЦИИ»). Скорее всего пользователь сгенерировал PNG в Nano Banana
     и положил в `assets/images/` — тогда обновить `app.json` и прогнать prebuild.
  2. Дизайн-полировка по скриншотам (положить в `screenshots/`).
  3. Публикация: EAS Build + замена bundleIdentifier + App Store/Play.
  4. Факультативно: нативный модуль видео-timelapse (конец TODO.md).
- Порядок старта новой сессии — см. `NEXT_SESSION.md` (готовый промпт).
- Обрати внимание: патч-версии SDK 57 выровнены в Фазе 11. Если pod install
  упадёт с «CocoaPods could not find compatible versions for pod
  ExpoModulesCore» — удали `ios/Pods` и `ios/Podfile.lock`, перезапусти
  `pod install`. После изменения app.json (плагины) нужен `npx expo prebuild`.
- Все проверки — `npm run typecheck`, `npm run lint`, `npm test`,
  `npx expo-doctor`; коммит после каждой фазы.
