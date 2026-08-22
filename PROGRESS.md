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
