# NEXT_SESSION — стартовый промпт для новой сессии

> Скопируй весь блок ниже как ПЕРВОЕ сообщение в новую сессию.
> Он самодостаточен: восстанавливает контекст и сразу включает в работу.

---

Продолжаем работу над ProgressPrivate. Рабочая папка проекта —
`/Users/aleks/dev/progress-visualizer-app` (ASCII-путь), НЕ старый путь
с кириллицей `/Volumes/Т5-Documents/...`. Перед любым
`npx expo prebuild` / `run:ios` / `pod install` выполни:
`export PATH="/opt/homebrew/bin:$PATH"`.

## Где мы сейчас (контекст)

- Закрыты Фазы 0–14. Последняя — Фаза 14 (псевдо-timelapse без видеофайла).
- Стек: Expo SDK 57 (`expo` ~57.0.16, `expo-router` ~57.0.16), RN 0.86.2,
  React 19.2.3, Reanimated 4.5.1, Gesture Handler ~2.32.0, zustand 5.0.15,
  react-native-mmkv 4.3.2 (Nitro-модуль, encrypted).
- Установлены: expo-camera, expo-file-system, expo-media-library,
  expo-local-authentication, expo-secure-store, expo-crypto, expo-notifications,
  expo-image, @react-native-community/slider.
- Окружение: Apple M4, macOS 26.3.1, Xcode 26.6 (Swift 6.3.3), Node 22.18.0,
  CocoaPods 1.17.0 (в `/opt/homebrew/bin`).
- Состояние: expo-doctor 21/21, тесты 59/59, сборка iOS 0 errors.
- Dev build только через `npx expo run:ios` (MMKV/camera/biometrics/notifications/
  media-library — не работают в Expo Go).

## Что уже реализовано (кратко)

Приватное приложение отслеживания прогресса по фото: проекты + съёмка камерой
+ ghost overlay/сетка, лента фото, сравнение «до/после» (Reanimated + Gesture
Handler), биометрия (local-authentication), локальные напоминания
(expo-notifications), экран поддержки + premium-заглушка, экспорт фото в галерею
(write-only), псевдо-timelapse. Всё on-device, без сети/аналитики/рекламы/облака.

## Порядок в начале сессии

1. Прочитай по порядку: `CONSTITUTION.md`, `STACK_LOCK.md`, `STACK_RESOLVED.md`,
   `PROGRESS.md` (секция «ВАЖНО ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ» + последняя запись),
   `TODO.md`.
2. Найди первую незакрытую подзадачу — это **Фаза 15**.
3. Работай по `AGENTS.md` (маленькими шагами, проверки после каждой фазы,
   честный результат, запрет ложных «готово»).

## Задача этой сессии: ФАЗА 15 — Полировка и подготовка портфолио

Подзадачи из TODO.md (раздел 15):

- 15.1 Проверить все empty states, error states, loading states.
- 15.2 Проверить корректность permission texts в app.json/Info.plist.
- 15.3 Подготовить app icon и splash screen.
- 15.4 Обновить README.md (основа `README.template.md`).
- 15.5 Написать честный Privacy Policy draft.
- 15.6 Проверить отсутствие: network/analytics/ad SDK, автоматической отправки
  фото, лишних разрешений.
- 15.7 Финальный прогон: `npm run typecheck`, `npm run lint`, `npm test`,
  `npx expo-doctor`.

## Проверки и правила

- После каждой фазы: `npm run typecheck`, `npm run lint`, `npm test`,
  `npx expo-doctor` — только реально запуская команды.
- Если проверка невозможна (нет эмулятора, нет биометрии и т.п.) — честно
  написать причину, не симулировать успех.
- Код и документация меняются в ОДНОМ коммите. Коммит после каждой фазы.
- Не добавлять библиотеки без причины; не менять архитектуру молча
  (фиксировать в DECISIONS.md).
- Если что-то противоречит CONSTITUTION.md или требуется спорная/deprecated
  библиотека — остановиться и спросить пользователя.

## Известные нюансы (чтобы не спотыкаться)

- `pod install` падает с «CocoaPods could not find compatible versions for pod
  ExpoModulesCore», если версия expo-modules-core изменилась: удали
  `ios/Pods` и `ios/Podfile.lock`, перезапусти `pod install`.
- После изменения `app.json` (плагины/разрешения) нужен `npx expo prebuild`.
- iOS-симулятор: биометрия не зарегистрирована (code -7), permission-диалоги
  уведомлений/галереи программно не принять — ручная проверка.
- Android не проверялся (нет эмулятора).
- Отдельная факультативная задача (вне MVP) — нативный модуль генерации
  видео-timelapse — описана в конце TODO.md.

---
