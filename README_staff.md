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

- `Project`: id, name, createdAt, updatedAt.
- `PhotoMetadata`: id, projectId, uri (локальный путь), takenAt, width?, height?.
- `AppSettings`: designTheme, themeMode, ghostEnabled, ghostOpacity, gridEnabled,
  requireBiometrics, remindersEnabled, reminderTime.

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

## 10. Оформления, материал и быстрый призрак

### 10.1. Два независимых выбора

- `designTheme`: `minimalism` | `liquid-glass` | `gallery` (default `minimalism`).
- `themeMode`: `system` | `light` | `dark` — независимый цветовой режим.

Определения тем, палитры, радиусы и материалы — в `src/theme/design-themes.ts`.
Провайдер (`src/theme/ThemeProvider.tsx`) резолвит пару
`(designTheme, scheme)` и отдаёт через `useAppTheme()`: `colors`, `scheme`,
`designTheme`, `metrics`, `material`.

### 10.2. Гидратация и совместимость

- `normalizeSettings()` в `src/store/settingsStore.ts` объединяет сохранённые
  настройки с `DEFAULT_SETTINGS`; отсутствующий/неизвестный `designTheme` → `minimalism`.
- persist использует кастомный `merge`; `skipHydration: true` и порядок
  `initializeStorage → rehydrateStores` не менялись.

### 10.3. Материал (Liquid Glass)

- `src/components/ui/adaptive-surface.tsx` + `.ios.tsx`: на iOS native-glass →
  `GlassView`, иначе `BlurView`, иначе solid `View`. Reduce Transparency → solid.
- Вне iOS материал всегда сводится к solid (без импорта iOS-only модулей).
- Плавающая капсула таббара — в `src/app/(tabs)/_layout.tsx` через `tabBarStyle`
  (`position: absolute`) + `tabBarBackground`. Размеры — `src/theme/tab-bar.ts`.

### 10.4. Быстрый призрак (hold-to-peek)

- Чистая логика — `src/utils/ghost.ts` (`resolveGhostVisibility`, `PEEK_OPACITY = 0.9`).
- Жест — `Gesture.Tap` c `onTouchesDown/onTouchesUp` на слое под контролами
  (`src/app/(tabs)/camera.tsx`). Временное состояние `isPeekActive` НЕ персистится.
- Доступная альтернатива — кнопка «Призрак 90%» в `overlay-controls.tsx` (toggle).
- Сбросы: на capture, смену проекта, изменение ползунка, blur-навигацию
  (`useFocusEffect`), фон (`AppState`).

### 10.5. Отступы под плавающую капсулу

Плавающий таббар перекрывает контент. Списки/настройки добавляют
`FLOATING_TAB_BAR_INSET`; камера смещает затвор и панель. Один источник
констант — `src/theme/tab-bar.ts`.

---

## 11. Что нельзя делать при поддержке

- Добавлять сетевые запросы с фото или метаданными.
- Добавлять рекламные или аналитические SDK.
- Включать облачный бэкап по умолчанию.
- Сохранять фото в галерею без явного действия пользователя.
- Менять версии из STACK_RESOLVED.md без проверки совместимости.

Любое такое изменение требует отдельного решения и записи в DECISIONS.md.

---

## 12. Связанные документы

- CONSTITUTION.md — неизменяемые правила
- ARCHITECTURE.md — границы слоёв
- STACK_RESOLVED.md — актуальные версии
- TESTING.md — протокол тестов
- DECISIONS.md — журнал решений
- MAINTENANCE_AI.md — инструкция для ИИ поддержки и развития
- PRIVACY.md — политика конфиденциальности
