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
