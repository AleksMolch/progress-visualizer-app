# PROGRESS — журнал сессий

> AI-агент:
> В начале каждой новой сессии читай последнюю запись.
> В конце каждой завершённой фазы добавляй новую запись.
> Не пропускай этот шаг — это механизм восстановления контекста.

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
