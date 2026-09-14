# PROGRESS — журнал сессий

> AI-агент:
> В начале каждой новой сессии читай последнюю запись.
> В конце каждой завершённой фазы добавляй новую запись.
> Не пропускай этот шаг — это механизм восстановления контекста.

## ⚠️ ВАЖНО ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ (читай первым)

- **Где мы сейчас**: MVP завершён (Фазы 0–15) + сделаны app icon/splash, иконки
  нижних вкладок (Ionicons), фиксы экрана проекта (кнопка «назад», превью фото).
  Проект запушен на GitHub: `https://github.com/AleksMolch/progress-visualizer-app`
  (origin обновлён на этот URL 2026-09-12, ветка `main` синхронизирована).
- **Следующая задача**: улучшение дизайна + выбор темы оформления в Настройках
  (несколько стандартных тем). Рекомендации по дизайну владелец передаст
  отдельными файлами-инструкциями вместе со следующим промптом — прочитай их
  первыми. Скелет задачи — в TODO.md, раздел «ДИЗАЙН И ТЕМЫ».
  ⚠ `AppSettings.themeMode` (`system|light|dark`) УЖЕ есть в модели и
  settingsStore, но НЕ подключён к ThemeProvider (тот всё ещё следует только
  системной схеме через `useColorScheme`) — это недоделка, с неё и начинать.
- **Рабочая папка проекта**: `/Users/aleks/dev/progress-visualizer-app`
  (ASCII-путь). СТАРЫЙ путь `/Volumes/Т5-Documents/Project/progress-visualizer-app`
  содержал кириллицу в имени тома и ломал CocoaPods — там НЕ работай.
- **Git remote**: origin = `https://github.com/AleksMolch/progress-visualizer-app.git`.
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

### 2026-09-12 — App icon и splash + выравнивание patch-версий

- Что сделано: сгенерированы фирменные иконка и splash (владелец планировал
  положить PNG из Nano Banana, но файлы в `assets/images/` не появились — по
  решению владельца ИИ сделал ассеты сам). Векторный mark — кольцо-диафрагма
  с дугой прогресса (~2/3, точка на конце) + точка-линза, белый на `#208AEF`;
  растеризован через `sharp` во временной папке (зависимости проекта не тронуты).
  Обновлён `app.json` по APP_ICON_AND_SPLASH.md. Выровнен дрейф patch-версий
  (18 пакетов) до `expo-doctor 21/21`.
- Какие файлы созданы или изменены:
  - заменены: `assets/images/icon.png` (1024×1024 RGB без альфы),
    `assets/images/android-icon-foreground.png` (1024 прозрачный),
    `assets/images/splash-icon.png` (512 прозрачный)
  - изменены: `app.json` (`ios.icon` → PNG, adaptive `backgroundColor` → `#208AEF`,
    убраны `backgroundImage`/`monochromeImage`, splash `imageWidth` 200),
    `package.json` (+`@react-native/jest-preset` 0.86.3, версии пакетов),
    `package-lock.json`, `TODO.md` (иконка/splash закрыты), `STACK_RESOLVED.md`
  - созданы: `screenshots/home-icon.png`, `screenshots/splash.png` (для
    визуальной проверки владельцем)
- Какие команды запускались:
  - `npx expo install --fix` (упал с ERESOLVE по jest-preset)
  - `npm install --legacy-peer-deps` + `npm install --save-dev @react-native/jest-preset@0.86.3`
  - `npm run typecheck`, `npm run lint`, `npm test`
  - `npx expo prebuild --platform ios` + `pod install` + `npx expo run:ios`
  - `npx expo-doctor`
- Результат проверок:
  - typecheck/lint: без ошибок; тесты: 59/59; expo-doctor: 21/21
  - сборка iOS: Build Succeeded (0 errors, 0 warnings), Metro 1937 модулей без ошибок
  - иконка: AppIcon 1024×1024 без альфы (угол `#208AEF`, центр белый), на
    домашнем экране симулятора ~9k синих пикселей `#208AEF`
  - splash: SplashScreenLogo прозрачный белый mark; при холодном старте экран
    97.4% синий фон + белый mark (проверено по пикселям скриншотов)
- Известные проблемы:
  - Визуальная эстетика иконки/splash не проверена (модель не читает картинки) —
    владельцу смотреть `screenshots/home-icon.png` и `screenshots/splash.png`.
  - Android-проверка иконки не выполнена (нет Android-эмулятора); adaptive-иконка
    настроена, но собрать/увидеть её можно только на Android.
  - `npm install` требует `--legacy-peer-deps` из-за peer-конфликта
    react-native/jest-preset (см. STACK_RESOLVED.md); `@react-native/jest-preset`
    добавлен явным devDep.
  - `pod install` дважды падал на скачивании `react-native-artifacts-0.86.3`
    (~94 МБ с repo1.maven.org, «Transferred a partial file») — лечится повтором.
- Следующий шаг: заменить временный `bundleIdentifier` перед публикацией;
  опционально — нативный видео-timelapse (факультатив в TODO.md).

---

### 2026-09-12 — Иконки вкладок + фиксы экрана проекта

- Что сделано: (1) в нижнюю навигацию добавлены иконки вкладок (Ionicons из
  `@expo/vector-icons`, лицензии MIT/Apache-2.0 — коммерчески доступны):
  Проекты — images, Камера — camera, Настройки — settings (outline/filled по
  состоянию), активная вкладка в фирменном `#208AEF`. (2) Исправлена навигация
  экрана проекта: убран вложенный Stack (`project/[id]/_layout.tsx`), маршруты
  сплющены в корневой Stack — теперь на экране проекта и всех дочерних экранах
  есть нативная кнопка «назад». (3) Исправлено отображение превью фото в сетке:
  у `Pressable`-обёртки не было `flex`, из-за чего `expo-image` схлопывался в
  нулевую высоту — добавлены `flex: 1` и явные размеры изображения.
- Какие файлы созданы или изменены:
  - изменены: `src/app/(tabs)/_layout.tsx` (иконки вкладок + активный tint),
    `src/app/_layout.tsx` (сплющенные маршруты проекта),
    `src/app/project/[id]/index.tsx` (фикс раскладки PhotoTile),
    `package.json` (+`@expo/vector-icons`), `STACK_RESOLVED.md`
  - удалён: `src/app/project/[id]/_layout.tsx` (вложенный Stack)
- Какие команды запускались:
  - `npx expo install @expo/vector-icons`
  - `npm run typecheck`, `npm run lint`, `npm test`
  - перезапуск Metro (`--clear`) + relaunch приложения
- Результат проверок:
  - typecheck/lint: без ошибок; тесты: 59/59
  - бандл: iOS 2011 модулей без ошибок/предупреждений, без «no route»
  - таб-бар: активная вкладка отрисована в `#208AEF` (проверено по пикселям),
    redbox отсутствует
  - deep link `/project/test123` открывается без ошибок, заголовок рендерится
- Известные проблемы:
  - Кнопка «назад» и превью фото проверены на уровне кода/сборки; визуальное
    подтверждение в реальном потоке (список → проект с фото) — ручная проверка
    владельцем (модель не читает скриншоты).
  - Иконки вкладок — Ionicons; визуальная эстетика — на усмотрение владельца.
- Следующий шаг: заменить `bundleIdentifier` перед публикацией.

---

### 2026-09-12 — Кнопка «назад» + push на GitHub + план дизайна

- Что сделано: (1) кнопка «назад» на экранах проекта и «Поддержать разработчика»
  показывала имя группы «(tabs)» — исправлено нативной опцией
  `headerBackButtonDisplayMode: 'minimal'` в `screenOptions` корневого Stack
  (теперь только стрелка, без текста). (2) Обновлён `origin` на GitHub и сделан
  push: `https://github.com/AleksMolch/progress-visualizer-app.git`, ветка `main`
  синхронизирована с `origin/main` (старый локальный origin
  `/Volumes/Т5-Documents/...` больше не используется — том не смонтирован).
  (3) Зафиксирован план следующей сессии (см. TODO.md «ДИЗАЙН И ТЕМЫ»).
- Какие файлы созданы или изменены:
  - изменены: `src/app/_layout.tsx` (+`headerBackButtonDisplayMode: 'minimal'`),
    `PROGRESS.md` (ВАЖНО для следующей сессии), `TODO.md` (раздел «ДИЗАЙН И ТЕМЫ»)
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`
  - `git remote set-url origin https://github.com/AleksMolch/progress-visualizer-app.git`
  - `git push -u origin main`
- Результат проверок:
  - typecheck/lint: без ошибок; приложение пересобралось без ошибок
  - push: `23082d4..3df1f01 main -> main`, рабочее дерево чистое
- Известные проблемы:
  - Кнопка «назад» проверена на уровне кода/сборки; визуально — владельцем.
- Следующий шаг: дизайн-полировка + выбор темы (см. TODO.md «ДИЗАЙН И ТЕМЫ»);
  рекомендации владельца — в файлах-инструкциях со следующим промптом.

---

### 2026-09-14 — Оформления, материал и быстрый призрак (по DESIGN_THEMES_AND_GHOST_TASK.md)

- Что сделано: (1) три визуальных оформления (`minimalism`/`liquid-glass`/`gallery`)
  через токены + независимый цветовой режим (`themeMode` подключён к провайдеру);
  выбор — секция «Оформление» в Настройках с искусственными превью. (2) Галерея:
  cover-превью в ProjectListItem, бирюзовый акцент, крупные радиусы. (3) Liquid
  Glass: `AdaptiveSurface` (GlassView → BlurView → solid, Reduce Transparency →
  solid), плавающий glass-таббар, frosted-карточки; отступы контента под капсулу.
  (4) Быстрый призрак hold-to-peek: удержание на свободной зоне превью → 90%
  (opacity 0.9), отпускание → обычный режим; доступная кнопка «Призрак 90%»;
  слайдер переименован в «Видимость призрака». Сбросы на capture/смену проекта/
  ползунок/blur/фон. (5) Безопасная миграция старых настроек (normalizeSettings).
- Какие файлы созданы или изменены: см. `docs/design-integration-report.md`
  (полная карта). Ключевые новые: `src/theme/design-themes.ts`, `material.ts`,
  `tab-bar.ts`, `src/components/ui/adaptive-surface.tsx(+.ios)`,
  `src/features/settings/components/appearance-settings-card.tsx`,
  `src/utils/ghost.ts`. Зависимости: `@expo/vector-icons`, `expo-glass-effect`,
  `expo-blur`.
- Какие команды запускались:
  - `npx expo install @expo/vector-icons expo-glass-effect expo-blur`
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - `npx expo prebuild --platform ios` + `npx expo run:ios` (Build Succeeded)
- Результат проверок:
  - typecheck/lint: чисто; тесты: 88/88 (было 59); expo-doctor: 21/21
  - сборка iOS: 0 errors / 0 warnings; запуск без redbox, экран отрисовывается
- Известные проблемы / BLOCKED:
  - Визуальная проверка тем — ручная (модель не читает скриншоты).
  - Нативное Liquid Glass — требует iOS 26+ устройства (на симуляторе возможно
    fallback). Жест hold-to-peek — на устройстве. Android — нет эмулятора. Web — не проверялся.
  - readiness эталонного изображения (onLoad/onError, гонка смены проекта)
    реализовано частично (`referenceReady = latestPhoto !== null`) — улучшение в будущем.
- Следующий шаг: визуальный ревью владельцем (скриншоты), проверка на устройстве
  (Liquid Glass + жест), затем — bundleIdentifier и публикация.

---

### 2026-09-14 — Доработка тем: platform defaults, Material, Neumorphism, свайпы, FAB, haptics

- Что сделано: (1) расширены оформления до пяти (`material`, `neumorphism`
  добавлены); platform defaults (iOS → liquid-glass, Android → material);
  список тем в настройках фильтруется по платформе. (2) Neumorphism через
  `NeuSurface` (boxShadow), Material через MD3-токены + elevated. (3) Liquid Glass
  переделан в компактную капсулу с активной пилюлей (кастомный `tabBar`).
  (4) Свайп между Проекты↔Настройки (камера исключена из-за жестов). (5) FAB «+»
  в проекте (выбор проекта + переход в камеру). (6) Haptics: expo-haptics +
  `hapticsEnabled` + `triggerHaptic`. (7) Заглушки обложек вместо чёрных блоков.
- Какие файлы созданы/изменены: `design-themes.ts` (5 тем + platform defaults),
  `material.ts` (+elevated/neumorphic), `neu-surface.tsx`, `liquid-glass-tab-bar.tsx`,
  `main-tab-swipe-gesture.tsx`, `haptics.ts`, `appearance-settings-card.tsx`,
  `settings.tsx` (haptics toggle), `camera.tsx`/`project/[id]/index.tsx`/`index.tsx`
  (haptics/FAB/swipe), `project-list-item.tsx` (placeholder). Зависимость: expo-haptics.
- Какие команды запускались:
  - `npx expo install expo-haptics`
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - `npx expo run:ios` (Build Succeeded, 0 errors)
- Результат проверок:
  - typecheck/lint: чисто; тесты: 108/108 (было 88); expo-doctor: 21/21
  - сборка iOS: успешно, запуск без redbox (после `--clear`)
- Известные проблемы / BLOCKED:
  - Визуальная проверка всех тем — ручная (модель не читает скриншоты).
  - Свайп и hold-to-peek — проверка на устройстве; камера намеренно без свайпа.
  - Neumorphism/Material на Android — нет эмулятора.
- Следующий шаг: ручной ревью владельцем, проверка на устройствах (iOS/Android),
  затем bundleIdentifier и публикация.

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
