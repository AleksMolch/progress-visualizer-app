# TODO — ПЛАН РЕАЛИЗАЦИИ ProgressPrivate

> AI-АГЕНТ — правила работы:
>
> 1. Работай строго по одной подзадаче за раз.
> 2. Перед каждой фазой перечитай:
>    - CONSTITUTION.md
>    - STACK_LOCK.md
>    - STACK_RESOLVED.md
>    - PROGRESS.md
> 3. Не закрывай задачу без реальной проверки.
> 4. Не выдумывай API.
> 5. Не меняй архитектурные решения без записи в DECISIONS.md.
> 6. В конце каждой фазы — коммит и запись в PROGRESS.md.

---

## ФАЗА 0 — Bootstrap проекта и фиксация реального стека

Цель: создать рабочий Expo + Expo Router проект и зафиксировать реальные версии.

- [x] 0.1 Убедиться, что в папке проекта лежат все подготовленные markdown-файлы
       и .gitignore.
- [x] 0.2 Создать Expo-проект в текущей папке через актуальный стабильный
       Expo template с TypeScript и Expo Router.
- [x] 0.3 Запустить установку зависимостей.
- [x] 0.4 Прочитать package.json и определить реальные версии core-зависимостей.
- [x] 0.5 Заполнить STACK_RESOLVED.md.
- [x] 0.6 Запустить npx expo-doctor и зафиксировать результат в STACK_RESOLVED.md.
- [x] 0.7 Настроить scripts в package.json:
       start, ios, android, typecheck, lint, test, doctor.
- [x] 0.8 Запустить приложение на симуляторе или эмуляторе.
- [x] 0.9 Сделать первый коммит.

### VERIFICATION 0

- STACK_RESOLVED.md заполнен реальными версиями.
- npx expo-doctor не показывает критических ошибок.
- Приложение запускается.
- git status чистый после коммита.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 1 — TypeScript, качество кода и базовая структура

Цель: создать устойчивый фундамент до добавления UI-библиотек.

- [x] 1.1 Включить/проверить TypeScript strict в tsconfig.json.
- [x] 1.2 Настроить ESLint и Prettier, совместимые с установленным Expo template.
- [x] 1.3 Создать структуру папок по ARCHITECTURE.md.
- [x] 1.4 Создать базовые типы в /src/models:
       Project, PhotoMetadata, AppSettings.
- [x] 1.5 Создать пустые feature-папки:
       projects, camera, gallery, settings, privacy, support.
- [x] 1.6 Проверить:

```bash
npm run typecheck
npm run lint
```

### VERIFICATION 1

- TypeScript проходит без ошибок.
- Lint проходит или содержит только явно допустимые предупреждения.
- Структура папок соответствует ARCHITECTURE.md.
- Нет бизнес-логики в UI-слое.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 2 — Навигация Expo Router

Цель: собрать каркас экранов без сложного UI.

- [x] 2.1 Настроить root layout (_layout.tsx).
- [x] 2.2 Создать tabs layout с табами:
       Projects (index), Camera, Settings.
- [x] 2.3 Создать экран проекта /project/[id].tsx.
- [x] 2.4 Создать простые placeholder-экраны для каждого таба.
- [x] 2.5 Проверить навигацию между табами и переход на экран проекта.

### VERIFICATION 2

- Навигация между табами работает.
- Переход на экран проекта работает.
- Нет крашей при reload.
- Нет сетевых слоёв и API-клиентов.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 3 — UI-система: gluestack-ui

Цель: подключить UI-библиотеку только если она реально совместима.

> ИТОГ (2026-08-21): gluestack-ui v5 требует NativeWind v5 (preview) + Tailwind v4 —
> рискованно на SDK 57. По решению пользователя — отказ, собственная UI-система
> (токены /src/theme + AppText/AppButton/AppScreen/AppCard). См. DECISIONS.md.

- [x] 3.1 Проверить актуальную инструкцию установки gluestack-ui
       для установленного Expo/RN из STACK_RESOLVED.md.
- [x] 3.2 Подключить gluestack-ui (НЕ выполнено — отказ, custom UI):

```bash
npx gluestack-ui init
```

- [x] 3.3 Если gluestack-ui конфликтует с текущим стеком —
       остановиться и спросить пользователя. Не заменять молча.
       (выполнено: остановился, пользователь выбрал custom UI)
- [x] 3.4 Подключить ThemeProvider (custom) в root layout.
- [x] 3.5 Создать базовые компоненты:
       AppButton, AppText, AppScreen, AppCard.
- [x] 3.6 Настроить светлую/тёмную тему (следует системной).
- [x] 3.7 Подключить react-native-edge-to-edge (НЕ нужно — нативно в RN 0.86).
- [x] 3.8 Проверить отображение на iOS (Android — нет эмулятора, вручную).

### VERIFICATION 3

- UI-компоненты работают без runtime-ошибок.
- Тема переключается или следует системной теме.
- Edge-to-edge применён.
- Если были проблемы совместимости — они записаны в DECISIONS.md.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 4 — Локальное хранилище: MMKV + SecureStore + Zustand

Цель: создать приватный локальный слой данных.

- [x] 4.1 Установить zustand:

```bash
npx expo install zustand
```

- [x] 4.2 Установить react-native-mmkv совместимо с текущим Expo/RN
       (v4.3.2 — Nitro-модуль, плюс react-native-nitro-modules):

```bash
npx expo install react-native-mmkv react-native-nitro-modules
```

- [x] 4.3 Установить expo-secure-store:

```bash
npx expo install expo-secure-store
```

- [x] 4.4 Реализовать получение/создание encryption key через SecureStore
       в /src/storage/secureKeys.ts.
- [x] 4.5 Реализовать инициализацию MMKV с encryption key
       в /src/storage/mmkv.ts.
- [x] 4.6 Создать Zustand store с persist через MMKV.
- [x] 4.7 Написать unit-тесты (TDD: сначала тест, потом реализация) для:
       - создания проекта
       - удаления проекта
       - добавления photo metadata
       - удаления photo metadata
       - изменения settings
- [x] 4.8 Проверить, что данные переживают перезапуск приложения.

       Выполнено на Apple Silicon Mac (macOS 26.3.1, Xcode 26.6, Swift 6.3.3).
       Development build собран и запущен (`npx expo run:ios`). MMKV
       инициализируется (v2.4.0, AES-256) и сохраняет данные в sandbox.
       Персистентность проверена перезапуском приложения: значение, записанное
       в MMKV, прочиталось после полного terminate + relaunch процесса.

       ПРИМЕЧАНИЕ: проект физически перенесён на ASCII-путь
       `/Users/aleks/dev/progress-visualizer-app` (старый путь
       `/Volumes/Т5-Documents/...` содержал кириллицу, из-за которой CocoaPods
       падал с encoding-ошибкой `BINARY (ASCII-8BIT) and UTF-8`). Подробности
       в STACK_RESOLVED.md.

### VERIFICATION 4

- Development build запускается.
- MMKV инициализируется без ошибок.
- Store persist работает после перезапуска.
- Unit-тесты проходят (npm test).
- Нет AsyncStorage как основного хранилища.
- Если MMKV не работает — остановиться и спросить пользователя.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 5 — File storage для фотографий

Цель: сохранять фотографии только в sandbox приложения.

- [x] 5.1 Установить/проверить expo-file-system:

```bash
npx expo install expo-file-system
```

- [x] 5.2 Создать /src/storage/photoFiles.ts.
- [x] 5.3 Реализовать функции:
       - ensureAppPhotoDirectory
       - createProjectPhotoDirectory
       - savePhotoToProject
       - deletePhotoFile
       - deleteProjectPhotoDirectory
- [x] 5.4 Не использовать общую галерею для сохранения по умолчанию.
- [x] 5.5 Написать тесты для storage-функций с замоканным file API.
- [x] 5.6 Зафиксировать privacy-решение по хранению в DECISIONS.md.

### VERIFICATION 5

- Тестовый файл сохраняется в sandbox приложения.
- Удаление работает корректно.
- UI не вызывает file-system напрямую.
- Все вызовы file-system находятся в /src/storage.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 6 — Камера и разрешения

Цель: сделать базовую съёмку.

- [x] 6.1 Установить expo-camera:

```bash
npx expo install expo-camera
```

- [x] 6.2 Проверить актуальный API expo-camera по установленным типам
       в node_modules, не по памяти.
- [x] 6.3 Реализовать экран Camera.
- [x] 6.4 Реализовать запрос разрешения камеры.
- [x] 6.5 Реализовать выбор активного проекта для съёмки.
- [x] 6.6 Реализовать capture photo.
- [x] 6.7 Сохранить фото в sandbox через photoFiles.ts.
- [x] 6.8 Добавить metadata в Zustand store.

### VERIFICATION 6

- Разрешение камеры запрашивается корректно.
- Фото делается без крашей.
- Фото сохраняется локально в sandbox.
- Metadata появляется в проекте.
- Фото не сохраняется в общую галерею автоматически.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 7 — Ghost overlay и сетка

Цель: реализовать основную UX-фичу без ML.

- [x] 7.1 На экране камеры получить последнее фото выбранного проекта.
- [x] 7.2 Отобразить его поверх camera preview с регулируемой прозрачностью.
- [x] 7.3 Добавить toggle overlay on/off.
- [x] 7.4 Добавить slider opacity.
- [x] 7.5 Добавить grid overlay (toggle on/off).
- [x] 7.6 Обработать состояние первого фото проекта, когда overlay отсутствует.

### VERIFICATION 7

- Overlay отображается поверх камеры. (код + сборка; визуально — см. PROGRESS)
- Прозрачность регулируется.
- Grid включается и выключается.
- Первое фото проекта не вызывает ошибок. (покрыто тестом getLatestPhoto)
- Производительность приемлемая на Android-эмуляторе. (⚠ не проверено — нет
  Android-эмулятора в окружении; нужна ручная проверка)
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 8 — Просмотр проектов и фотографий

Цель: сделать удобный просмотр локальных фото.

- [x] 8.1 Реализовать список проектов на экране Projects.
- [x] 8.2 Реализовать создание проекта.
- [x] 8.3 Реализовать редактирование проекта.
- [x] 8.4 Реализовать удаление проекта с подтверждением.
- [x] 8.5 Реализовать экран проекта с лентой фото.
- [x] 8.6 Использовать expo-image для отображения локальных изображений.
- [x] 8.7 Реализовать удаление фото с подтверждением
       (удаляет и metadata из store, и файл из sandbox).
- [x] 8.8 Реализовать empty states для списка проектов и ленты фото.

### VERIFICATION 8

- Проекты создаются, редактируются и удаляются. (покрыто unit-тестами store;
  UI — собрано и запущено, визуально см. PROGRESS)
- Фото отображаются после перезапуска приложения. (persist подтверждён в 4.8;
  отображение ленты — UI, собрано)
- Удаление фото удаляет и metadata, и файл. (покрыто unit-тестами store)
- Empty states отображаются корректно. (собрано и запущено без крашей)
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 9 — Сравнение фото: Reanimated + Gesture Handler

Цель: добавить фичу сравнения как ключевую портфолио-часть.

- [x] 9.1 Убедиться, что Reanimated и Gesture Handler установлены
       и совместимы с текущим стеком (они должны быть из template).
- [x] 9.2 Проверить babel/metro config requirements для Reanimated.
       (worklets-плагин подключается автоматически babel-preset-expo,
       отдельный babel.config.js не нужен)
- [x] 9.3 Реализовать side-by-side compare двух фото.
- [x] 9.4 Реализовать swipe compare slider (slider разделяет два фото).
- [x] 9.5 Реализовать fullscreen viewer.
- [x] 9.6 Добавить swipe-жест между фото в fullscreen.
       (нативный горизонтальный FlatList с pagingEnabled, см. DECISIONS.md)
- [x] 9.7 Добавить pinch zoom (ZoomablePhoto на Reanimated + Gesture Handler).

### VERIFICATION 9

- Compare работает плавно. (код + сборка; визуально — см. PROGRESS)
- Нет конфликтов gestures со scroll. (свайп — нативный paging, pinch — отдельно)
- Reanimated не выдаёт runtime warnings. (безвредный onAnimatedValueUpdate
  при первом рендере — см. PROGRESS)
- Код не переусложнён. (см. DECISIONS.md)
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 10 — Биометрическая защита

Цель: защитить доступ к фото.

- [x] 10.1 Установить expo-local-authentication:

```bash
npx expo install expo-local-authentication
```

- [x] 10.2 Создать privacy settings в AppSettings (флаг requireBiometrics).
       (флаг уже был создан в Фазе 4; добавлен UI-переключатель в Settings)
- [x] 10.3 Реализовать lock screen.
- [x] 10.4 Реализовать route protection в Expo Router.
       (BiometricsGate в root layout оборачивает весь Stack)
- [x] 10.5 Проверить fallback, если биометрия недоступна на устройстве.
       (shouldLock не блокирует, если биометрия недоступна; подтверждено
       на симуляторе — биометрия не зарегистрирована, приложение не заблокировано)

### VERIFICATION 10

- При включённой защите приложение требует биометрию. (код + сборка;
  на симуляторе биометрия не зарегистрирована — см. PROGRESS)
- Без успешной аутентификации фото недоступны.
- Если биометрия недоступна — приложение не ломается. (подтверждено:
  code -7 «No identities are enrolled» → fallback без блокировки)
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 11 — Локальные уведомления

Цель: добавить напоминания без сервера.

- [x] 11.1 Установить expo-notifications:

```bash
npx expo install expo-notifications
```

- [x] 11.2 Реализовать запрос permission на уведомления.
- [x] 11.3 Реализовать создание локального расписания напоминаний.
- [x] 11.4 Добавить настройки напоминаний в экран Settings.
- [x] 11.5 Проверить офлайн-сценарий (без интернета напоминание срабатывает).

### VERIFICATION 11

- Напоминание создаётся локально. (реализовано + покрыто unit-тестами
  scheduleDailyReminder; фактический показ баннера — см. PROGRESS, требует
  ручной проверки)
- Работает без сервера и без интернета. (локальный триггер `DailyTriggerInput`,
  нет push-сервера и сетевых запросов — см. DECISIONS.md)
- Настройки persist после перезапуска. (remindersEnabled/reminderTime в
  settingsStore с persist в MMKV; паттерн подтверждён в 4.8)
- Нет push-сервера. (подтверждено: только локальные уведомления)
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 12 — Поддержать разработчика / Premium placeholder

Цель: подготовить монетизацию без рекламы.

- [x] 12.1 Создать экран Support Developer.
- [x] 12.2 Добавить честное описание приложения:
       без рекламы, без трекинга, данные только на устройстве.
- [x] 12.3 Реализовать premium flag в store как временную dev-заглушку.
- [x] 12.4 Не подключать IAP без отдельного решения пользователя.
- [x] 12.5 Зафиксировать в DECISIONS.md, что IAP отложен.

### VERIFICATION 12

- Нет рекламных SDK. (подтверждено — новых зависимостей не добавлялось)
- Нет analytics SDK. (подтверждено)
- Premium flag локальный. (premiumEnabled в appStore, персистится в MMKV;
  покрыто unit-тестами)
- DECISIONS.md содержит запись об отложенном IAP. (запись от 2026-08-24)
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 13 — Экспорт в галерею

Цель: явный экспорт пользователем, не автоматический.

- [ ] 13.1 Установить expo-media-library:

```bash
npx expo install expo-media-library
```

- [ ] 13.2 Реализовать permission flow для media library.
- [ ] 13.3 Реализовать экспорт выбранного фото в галерею
       только по кнопке пользователя.
- [ ] 13.4 Добавить понятное предупреждение, что после экспорта фото
       находится вне sandbox приложения.

### VERIFICATION 13

- Экспорт происходит только по явному действию пользователя.
- Без permission экспорт не выполняется.
- Внутреннее хранение по-прежнему sandbox-first.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 14 — Timelapse: исследование, НЕ кодить

Цель: исследовать возможность локальной генерации видео.

ВНИМАНИЕ: эта фаза рискованная.
Не писать код до отдельного согласования с пользователем.

- [ ] 14.1 Исследовать современные варианты генерации video/timelapse
       на текущем Expo/RN без deprecated библиотек.
- [ ] 14.2 Проверить, не deprecated ли найденные решения.
- [ ] 14.3 Проверить, требуют ли они custom native code.
- [ ] 14.4 Записать варианты и риски в DECISIONS.md.
- [ ] 14.5 Остановиться и спросить пользователя:
       реализовывать эту фичу или оставить вне MVP.

### VERIFICATION 14

- Есть research note в DECISIONS.md.
- Нет кода timelapse до согласования.
- Пользователь принял решение и оно зафиксировано.
- Запись в PROGRESS.md добавлена.

---

## ФАЗА 15 — Полировка и подготовка портфолио

Цель: привести проект в состояние, пригодное для публикации и ревью.

- [ ] 15.1 Проверить все empty states, error states, loading states.
- [ ] 15.2 Проверить корректность permission texts в app.json/Info.plist.
- [ ] 15.3 Подготовить app icon и splash screen.
- [ ] 15.4 Обновить README.md.
- [ ] 15.5 Написать честный Privacy Policy draft.
- [ ] 15.6 Проверить отсутствие:
       - network/analytics/ad SDK
       - автоматической отправки фото
       - лишних разрешений
- [ ] 15.7 Финальный прогон:

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

### VERIFICATION 15

- Все четыре команды проходят без ошибок.
- README готов для портфолио.
- Privacy Policy соответствует фактической архитектуре.
- Нет рекламы, аналитики, облачного ML, отправки фото в сеть.
- Финальный коммит сделан.
- Запись в PROGRESS.md добавлена.
