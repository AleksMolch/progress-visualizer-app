# README_staff — техническая документация ProgressPrivate

> Внутренний документ для команды поддержки и разработки.
> Обновляется при каждом значимом изменении архитектуры или функций.

---

## 1. Назначение приложения

ProgressPrivate — privacy-first мобильное приложение для прогресс-фотографий.
Все данные хранятся локально. Нет сети для пользовательского контента,
нет рекламы, нет аналитики, нет облачного ML.

Ключевые продуктовые ограничения зафиксированы в CONSTITUTION.md
и являются обязательными.

---

## 2. Технологический стек

Фактические версии — в STACK_RESOLVED.md (источник истины).

- Framework: Expo SDK 57
- Runtime: React Native 0.86 (новая архитектура)
- Навигация: Expo Router (file-based, typed routes)
- Анимации: react-native-reanimated 4
- Жесты: react-native-gesture-handler 2
- UI: собственная UI-система на StyleSheet (токены в /src/theme);
  отказ от gluestack-ui зафиксирован в DECISIONS.md
- Состояние: Zustand
- Локальное хранилище метаданных: react-native-mmkv (Nitro-модуль, с шифрованием)
- Ключ шифрования: expo-secure-store (+ expo-crypto для генерации)
- Файлы фото: expo-file-system (sandbox, новый объектный API)
- Камера: expo-camera
- Биометрия: expo-local-authentication
- Уведомления: expo-notifications (только локальные)
- Галерея: expo-media-library (write-only экспорт)
- Отображение фото: expo-image

---

## 3. Архитектура

Полное описание — в ARCHITECTURE.md. Кратко:

```
/src/app        — экраны (Expo Router, корень внутри /src)
/src/components — переиспользуемые UI-компоненты (ui, layout)
/src/features   — фичи по доменам (camera, projects, gallery, settings, privacy, support)
/src/models     — TypeScript-типы
/src/store      — Zustand-сторы
/src/storage    — MMKV, SecureStore, файловая система, биометрия, уведомления, галерея
/src/theme      — токены дизайна + ThemeProvider
/src/utils      — чистые функции
```

### Границы (критично для приватности)

- Работа с файлами, MMKV, SecureStore, уведомлениями и галереей — ТОЛЬКО в /src/storage.
- Сетевого слоя (/src/api, /src/network) быть НЕ должно.
- UI не обращается к файловой системе/нативным модулям напрямую.

---

## 4. Модель данных

- `Project`: id, name, createdAt, updatedAt, referenceMode? (`latest|first|manual`),
  referencePhotoId? (эталонное фото для ghost overlay).
- `PhotoMetadata`: id, projectId, uri (локальный путь), takenAt, width?, height?,
  note? (заметка), isFavorite?, isHidden? (скрытие без удаления).
- `AppSettings`: designTheme (`modern|simple|neumorphism`), themeMode, language
  (`ru|en|zh-Hans|kk|es`), ghostEnabled, ghostOpacity, gridEnabled,
  requireBiometrics, remindersEnabled, reminderTime, hapticsEnabled.

Все поля `?` — безопасные optional-поля: старые записи читаются без миграции
физических файлов. Скрытие фото (`isHidden`) НЕ удаляет файл и метаданные —
только исключает из обычного timeline и авто-выбора first/latest/reference.

Метаданные — в MMKV (зашифровано). Файлы фото — в sandbox приложения
(`Paths.document/photos/<projectId>/`).

---

## 5. Приватность: как устроено технически

- Encryption key для MMKV генерируется через expo-crypto и хранится в SecureStore.
- Фото сохраняются в приватную директорию приложения, НЕ в галерею.
- Экспорт в галерею — только по явному действию пользователя (write-only
  разрешение: только NSPhotoLibraryAddUsageDescription, без чтения).
- Уведомления — только локальные, без push-сервера и токенов.
- Приложение не делает сетевых запросов с пользовательским контентом.

Как проверить приватность:
1. Запустить приложение в авиарежиме — основные функции работают.
2. Через сетевой прокси убедиться, что фото не уходят наружу.
3. Проверить отсутствие рекламных/аналитических SDK в зависимостях
   (`npm ls --depth=0`).

---

## 6. Как собрать и запустить

### Требования окружения

- Node.js >= 20.19.4, npm
- Xcode 26.x (Swift 6.2+) для iOS
- CocoaPods >= 1.15.2
- Путь проекта НЕ должен содержать не-ASCII символов (иначе pod install
  падает с encoding-ошибкой) — см. STACK_RESOLVED.md

### Установка

```bash
npm install
```

### Запуск (development build, не Expo Go)

```bash
export PATH="/opt/homebrew/bin:$PATH"   # если pod/brew в Homebrew
npx expo run:ios
npx expo run:android
```

### Проверки

```bash
npm run typecheck
npm run lint
npm test
npx expo-doctor
```

---

## 7. Тестирование

Стратегия и правила — в TESTING.md. Кратко:

- Unit-тесты покрывают store, storage (с моками), utils.
- Камера, биометрия, жесты, уведомления, экспорт — ручная проверка.
- Тесты запускаются командой `npm test` (Jest + jest-expo).

---

## 8. Сборка и публикация

> Конкретика появится после настройки EAS (за пределами MVP).

- Development build: EAS Build (профиль development).
- Production build: EAS Build (профиль production).
- Публикация: App Store Connect и Google Play Console.

Требуется:
- аккаунт Apple Developer;
- аккаунт Google Play Console;
- заполненная Privacy Nutrition Label в App Store (см. PRIVACY.md);
- замена временного bundleIdentifier (`com.anonymous.progress-visualizer-app`)
  на реальный.

---

## 9. Типичные проблемы и их решение

| Симптом | Вероятная причина | Решение |
|---------|-------------------|---------|
| Краш при старте на MMKV | Запуск в Expo Go | Использовать development build |
| `pod install` падает с encoding-ошибкой | Кириллица в пути проекта | Перенести проект на ASCII-путь |
| pod: «could not find compatible versions for pod ExpoModulesCore» | Изменилась версия expo-modules-core | Удалить `ios/Pods` и `ios/Podfile.lock`, перезапустить `pod install` |
| После правки app.json разрешения не применились | Не выполнен prebuild | `npx expo prebuild --platform ios` |
| Биометрия не запрашивается | На симуляторе нет биометрии (code -7) | Проверять на реальном устройстве |
| expo-doctor ругается на версии | Ручная установка пакета | Ставить через `npx expo install` |

---

## 10. Оформления, ghost reference, экран проекта и compare

### 10.1. Три оформления

- `designTheme`: `modern` | `simple` | `neumorphism` (контракт в `src/models/settings.ts`).
- `themeMode`: `system` | `light` | `dark` — независимый цветовой режим.

Определения тем, палитры, радиусы и материалы — в `src/theme/design-themes.ts`.
`resolveDesignTheme(id, scheme, platform)` резолвит пару «оформление + схема +
платформа». Для `modern` рендерер зависит от платформы:

- iOS → native-glass таббар + frosted-карточки (Liquid Glass);
- Android → elevated-карточки + solid-таббар (Material 3);
- web/прочее → solid fallback.

Акцентная палитра общая (#208AEF) на всех платформах — различаются только
поверхности и радиусы.

Провайдер (`src/theme/ThemeProvider.tsx`) отдаёт через `useAppTheme()`:
`colors`, `scheme`, `designTheme`, `metrics`, `material`, `neu`.

### 10.2. Platform default и миграция

- `getDefaultDesignThemeId(platform)`: iOS/Android → `modern`, прочее → `simple`.
- `migrateDesignThemeId(value)` переводит старые id: `minimalism → simple`,
  `liquid-glass|material|gallery → modern`, `neumorphism → neumorphism`.
- `normalizeSettings(raw, platform)` в `src/store/settingsStore.ts`: мигрирует или
  подставляет platform default; явный валидный выбор пользователя не перезаписывается.
- persist использует кастомный `merge` (передаёт `Platform.OS`); `skipHydration: true`.

### 10.3. Материал поверхностей

- `src/components/ui/adaptive-surface.tsx` + `.ios.tsx` + `src/theme/material.ts`:
  `solid`/`elevated`/`neumorphic`/`frosted`/`native-glass`. Reduce Transparency → solid.

### 10.4. Единое нижнее меню

- `src/features/navigation/components/main-tab-bar.tsx` — кастомный `tabBar` для
  всех стилей: «Проекты — [камера/затвор] — Настройки».
- Центральная кнопка выступает над панелью; на камере кроссфейд «камера → затвор»
  (Reanimated). Съёмку запускает `triggerShutter()` из
  `src/features/navigation/camera-shutter-bridge.ts` (камера регистрирует обработчик).
- Размеры — `src/theme/tab-bar.ts` (`MAIN_TAB_BAR_INSET`, `CENTER_BUTTON_SIZE`).
- Свайп вкладок — `main-tab-swipe-gesture.tsx` (НЕ на камере).

### 10.5. Ghost reference (эталон призрака)

- Модель: `Project.referenceMode` + `referencePhotoId`.
- Чистая логика — `src/utils/reference.ts`: `resolveReferencePhoto(project, photos)`
  (latest/first/manual; скрытые исключаются из авто, пропавший manual → fallback на
  latest), `getReferenceMode`, `isManualReferenceMissing`.
- UI камеры: кнопка «Эталон» (`overlay-controls.tsx`) открывает
  `ghost-reference-modal.tsx`; ручной выбор — `photo-picker-sheet.tsx`.
- Временное усиление призрака (tap по превью) — `src/utils/ghost.ts`
  (`resolveGhostVisibility`, `BOOSTED_OPACITY = 0.85`). Состояние `isBoosted`
  локальное, НЕ персистится. Сбросы: съёмка, смена проекта, уход с экрана
  (`useFocusEffect`), фон (`AppState`), смена источника, ползунок.

### 10.6. Экран проекта как история (Flow A)

- `src/app/project/[id]/index.tsx`: summary + «Первое/Последнее» + «Быстрое
  сравнение» + timeline по месяцам (`groupPhotosByMonth` из `src/utils/progress.ts`).
- Бейджи: «Эталон» (слева-сверху), избранное/скрытое; выбор пары — кружки 1/2
  (справа-сверху). Логика выбора — `advanceQuickCompare` в `src/utils/progress.ts`.
- Скрытые фото показываются только при включённом фильтре «Показать скрытые».
- Дни между снимками и плюрализация — `formatDays`, `getDaysBetweenPhotos`.

### 10.7. Действия с фото (viewer, Flow B)

- `src/app/project/[id]/viewer/[photoId].tsx`: лист действий «…» (action-sheet.tsx):
  сравнить, заметка (note-editor-modal.tsx), избранное, скрыть/показать,
  сделать эталоном, экспорт, удалить.
- «Сравнить» открывает лист вариантов: с предыдущим/первым/последним/вручную.
- Действия меняют только метаданные через `useProjectStore.updatePhoto` /
  `setProjectReference`; файлы фото не трогаются (кроме удаления).

### 10.8. Compare screen (Flow C)

- Маршрут: `/project/[id]/compare?before=<id>&after=<id>` (`src/app/project/[id]/compare.tsx`).
- Валидация и упорядочивание пары по дате — `validateComparePair` (`src/utils/progress.ts`).
- Три режима: `compare-slider.tsx`, `compare-side-by-side.tsx`, `compare-overlay.tsx`.
- Кнопки «До»/«После» открывают `photo-picker-sheet.tsx` и меняют пару локально.
- Без сохранения файла и без `react-native-view-shot`/Skia.

### 10.9. Тактильный отклик

- `src/utils/haptics.ts` — `triggerHaptic(type, enabled)`; `hapticsEnabled` в настройках.
- Единственное место импорта `expo-haptics` — `src/utils/haptics.ts`.

### 10.10. Отступы под нижнее меню

Единое меню перекрывает контент. Списки/настройки добавляют
`MAIN_TAB_BAR_INSET` + `insets.bottom`; камера смещает панель контролов.
Один источник констант — `src/theme/tab-bar.ts`.

---

## 11. Локализация, Android-темы и UX-исправления

### 11.1. i18n (5 языков)

- Словари — `src/i18n/locales/{en,ru,zh-Hans,kk,es}.ts`; движок — `src/i18n/index.ts`
  (`translate`, `useI18n`), чистая часть — `src/i18n/locale.ts` (`detectDeviceLocale`,
  `isAppLanguage`, `LOCALES`, `LANGUAGE_NAMES`).
- `en` — канонический источник ключей (тип `MessageKey` выводится из него); остальные
  локали — `Record<MessageKey, Message>` (полнота проверяется компилятором + тестом).
- Механизмы: интерполяция `{param}`, плюрализация (`{ one/few/many/other }`; правила в
  `pluralForm`), fallback en → ключ. Реактивность — через `settings.language` (persist).
- Язык: явный выбор пользователя > русский (язык по умолчанию). Даты —
  `formatDate(timestamp, locale)`, месяцы — `formatMonthLabel(timestamp, locale)`.
- Компактный переключатель — `src/features/settings/components/language-switcher.tsx`
  (кнопка + dropdown, варианты clean/glass/minimal; короткие коды `LANGUAGE_SHORT`).
- Добавление строки: в `en.ts` (ключ), затем все 4 остальные локали (компилятор не даст
  пропустить). Названия проектов и заметки пользователя НЕ переводятся.

### 11.2. Android-темы

- `getPlatformThemeIds('android')` → `['modern','neumorphism']` (без «Простого»).
- `resolveDesignThemeId(value, platform)` мигрирует `simple`/`minimalism` → `modern` на
  Android; iOS/прочее сохраняют `simple`.

### 11.3. Слайдер сравнения (геометрия)

- `compare-slider.tsx`: верхнее фото на всю область W×H, ширина меняется только у
  clipping-контейнера; позиция разделителя — shared value `ratio` (0..1) для поворота/ресайза.

### 11.4. Редактор заметки и клавиатура

- Tap по фону — только `Keyboard.dismiss()` (не закрывает окно); закрытие — кнопками;
  при отмене с изменениями — `Alert` подтверждения; `KeyboardAvoidingView` + `ScrollView`;
  Android Back (onRequestClose) учитывает несохранённые изменения.

### 11.5. Звук затвора (ограничение)

- Источник: `expo-camera` `takePictureAsync()` с `shutterSound` (default `true`) — системный
  звук камеры. Своего звука нет, двойного срабатывания нет (shutter bridge + guard `isCapturing`).
- Поддерживаемое управление — только `shutterSound: false` (полное отключение); громкость
  системного звука через API не регулируется. Принято: не отключать и не добавлять свой звук.

---

## 12. Что нельзя делать при поддержке

- Добавлять сетевые запросы с фото или метаданными.
- Добавлять рекламные или аналитические SDK.
- Включать облачный бэкап по умолчанию.
- Сохранять фото в галерею без явного действия пользователя.
- Менять версии из STACK_RESOLVED.md без проверки совместимости.

Любое такое изменение требует отдельного решения и записи в DECISIONS.md.

---

## 13. Связанные документы

- CONSTITUTION.md — неизменяемые правила
- ARCHITECTURE.md — границы слоёв
- STACK_RESOLVED.md — актуальные версии
- TESTING.md — протокол тестов
- DECISIONS.md — журнал решений
- MAINTENANCE_AI.md — инструкция для ИИ поддержки и развития
- PRIVACY.md — политика конфиденциальности
