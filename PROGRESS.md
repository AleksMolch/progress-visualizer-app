# PROGRESS — журнал сессий

> AI-агент:
> В начале каждой новой сессии читай последнюю запись.
> В конце каждой завершённой фазы добавляй новую запись.
> Не пропускай этот шаг — это механизм восстановления контекста.

## ⚠️ ВАЖНО ДЛЯ СЛЕДУЮЩЕЙ СЕССИИ (читай первым)

- **Где мы сейчас**: выполнены `AI_CODER_ANIMATED_SPLASH_FOCUS_PULL.md` и
  `AI_CODER_PREPRODUCTION_READINESS.md` (см. записи 2026-10-20 ниже). Секторная/
  кометная анимация splash отклонена владельцем и заменена мягкой заставкой по
  `AI_CODER_SOFT_ANIMATED_SPLASH` (дыхание + fade, один цельный PNG). Проверки:
  typecheck/lint чисто, тесты 198/198; Android-manifest проверен.
  Выполнена native-пересборка iOS (новый bundle ID).
- **Следующая задача**: native/EAS-сборка `preview` и проверка на физическом
  Android (splash без вспышки, иконки, разрешения, камера, онбординг); проверить
  публикацию обновлённой политики после пуша; затем задача 2 из
  `AI_CODER_CAMERA_FIX_AND_ANIMATED_GRID_LIST.md` (Grid/List morph).
- **Package name**: `ru.nov.molcha.progressvisualizer` (Android и iOS; менять
  после публикации нельзя). versionCode 5, iOS buildNumber 1.
- **GitHub Pages**: включён, каноническая политика —
  https://aleksmolch.github.io/progress-visualizer-app/privacy-policy.html
  (обновлённое содержимое появится после пуша `main`).
- **Рабочая папка проекта**: `/Users/aleks/dev/progress-visualizer-app` (ASCII-путь).
- **Git remote**: origin = `https://github.com/AleksMolch/progress-visualizer-app.git`.
- **PATH**: `pod`/`brew`/CocoaPods — в `/opt/homebrew/bin`; перед prebuild/run:ios/pod install
  выполни `export PATH="/opt/homebrew/bin:$PATH"`.
- **Окружение**: Node v22.18.0, Xcode 26.6, CocoaPods 1.17.0, Apple M4.
- **Запуск**: native-модули — только dev build (`npx expo run:ios`), НЕ Expo Go.
  Metro на :8081 (`/tmp/metro.log`). EAS: `npx eas-cli build -p android --profile apk`
  (токен в `~/.expo-token`, аккаунт alomium; НЕ коммитить).

## Шаблон записи

### YYYY-MM-DD — Фаза X — название

- Что сделано:
- Какие файлы созданы или изменены:
- Какие команды запускались:
- Результат проверок:
- Известные проблемы:
- Следующий шаг:

---

### 2026-10-20 — Мягкий splash: дыхание + fade (по AI_CODER_SOFT_ANIMATED_SPLASH)

- Что сделано:
  - (1) **Новый `SoftSplashOverlay`**
    (`src/features/splash/components/soft-splash-overlay.tsx`): один цельный
    `splash-icon.png` (оригинальный знак с синим лепестком), фон `#0B0D12`,
    160 dp, первый кадр строго `opacity 1` / `scale 1` — совпадает с нативным.
  - (2) **Анимация**: пока storage не готов — дыхание `1 ↔ 1.018` (цикл ~1.8 с,
    inOut quad); после готовности — `1 → 1.025` (220 мс) → `1` (220 мс), затем
    fade-out 200 мс (всего ~640 мс). `onFinish` — ровно один раз (ref-guard),
    анимации отменяются при размонтировании. Reduced Motion — без движения и
    задержек.
  - (3) **Жизненный цикл** (`src/app/_layout.tsx`): оверлей монтируется сразу,
    `onLayout` → `SplashScreen.hideAsync()` (ref-guard) → `nativeSplashHidden` →
    старт анимации; `AppRoot` — только после `storageReady`. Флаги
    `storageReady`/`nativeSplashHidden`/`showSplashOverlay` раздельные.
  - (4) **Удалено лишнее**: старый `animated-splash.tsx`, `splash-timing.ts` +
    тест, ассеты `iris-glow.png`/`sector-0..5.png`; генератор упрощён (splash —
    один PNG). `app.json` не менялся.
- Какие файлы созданы или изменены:
  - создан: `src/features/splash/components/soft-splash-overlay.tsx`
  - изменены: `src/app/_layout.tsx`, `scripts/generate-brand-assets.py`,
    `APP_ICON_AND_SPLASH.md`, `README_staff.md`, `MAINTENANCE_AI.md`,
    `TESTING.md`, `DECISIONS.md`, `PROGRESS.md`
  - удалены: `src/features/splash/components/animated-splash.tsx`,
    `src/features/splash/splash-timing.ts`, `splash-timing.test.ts`,
    `assets/images/splash/{iris-glow,sector-0..5}.png`
- Какие команды запускались:
  - генерация ассетов, `npm run typecheck`, `npm run lint`, `npm test`
    (198/198), `npx expo-doctor` (20/21 — прежний patch-дрейф)
- Результат проверок:
  - typecheck/lint: чисто; тесты: 198/198 (удалены тесты старого тайминга)
  - iOS: запуск на симуляторе после изменений (JS-only) без ошибок/redbox
- Известные проблемы:
  - Бесшовность первого кадра, статус-бары и Reduced Motion — только ручная
    проверка на физических iOS/Android (устройств нет).
  - **Фикс визуального стыка**: нативный splash и оверлей переведены на
    `splash-icon.png` (оригинальный знак с синим лепестком). Раньше native/JS
    использовали белую версию, из-за чего на стыке была видна подмена знака.
    `app.json` обновлён (`image` → `splash-icon.png`), нужна native-пересборка.
- Следующий шаг: ручная приёмка заставки; затем EAS `preview` (versionCode 5) и
  проверка на Android.

---

### 2026-10-20 — Анимированный splash «фокус-пул» + preproduction-подготовка

- Что сделано:
  - (1) **Логотип разделён на слои** скриптом `scripts/generate-brand-assets.py`
    (Pillow): splash-слои 512 — `iris-white` (белый знак), `iris-glow` (блик),
    `sector-0..5` (6 синих секторов); `iris-full` 1024 (иконки/канон). Отсечён
    кант исходной подложки, alpha восстановлена из смеси с фоном, premultiplied.
  - (2) **Анимированный splash**: `AnimatedSplash` (Reanimated) — покой → синие
    сектора вспыхивают поочерёдно по часовой стрелке (6×280 мс, без вращения;
    цикл повторяется до готовности) → фокус-пул (blur 3→0) → блик → финал
    (scale 1.08, fade, фон в цвет темы).
  - (2b) **Тайминг**: вспышка-задержка-угасание 280 мс на сектор (60/160/60),
    полный круг 1680 мс, финал не раньше полного круга (INTRO 1830 мс), один
    таймер-страж (`splash-timing.ts`); reduced motion отключает сцену; нативный
    splash скрывается после первого layout оверлея.
  - (2c) **Вариант 3 (один слой сектора)**: вместо 6 смонтированных слоёв —
    ОДИН AnimatedImage, source которого переключается по `useAnimatedReaction`
    (`Math.floor(sweep) % 6` → `runOnJS(setActiveSector)`); прозрачность вспышки —
    один shared value. Меньше узлов и worklet'ов, код проще. Визуал откатан к
    простой вспышке (без кометы/дыхания/замыкания/размытой базы); нативный splash
    снова острый `iris-white`. 512-ассеты сохранены (≈257 КБ: white 77K +
    glow 79K + сектора ~101K).
  - (3) **Иконки/adaptive/splash**: icon.png (opaque #0B0D12, знак ~74%),
    foreground (центральные ~66%), background #0B0D12, monochrome, splash-icon;
    в app.json — splash `#0B0D12`/160/dark (`iris-white`) и `monochromeImage`.
  - (4) **Preproduction**: `SHOW_AD_PLACEHOLDERS = false`; профили EAS `preview`,
    `production` (AAB), `production-apk` (валидированы `eas config`);
    package/bundle `ru.nov.molcha.progressvisualizer`, iOS buildNumber 1,
    versionCode 5; убраны `WRITE_EXTERNAL_STORAGE`/`USE_FINGERPRINT` (+ blocked,
    т.к. плагины добавляли их обратно); GitHub Pages включён (POST 201), политика
    обновлена (no ads/purchases, дата), `PRIVACY.md`/`PRIVACY_POLICY.md` —
    указатели на канонический `docs/privacy-policy.html`; удалены неиспользуемые
    ассеты (react-logo, expo-logo/badge, logo-glow, tutorial-web, tabIcons,
    expo.icon); добавлен CI `.github/workflows/ci.yml`; обновлён
    `APP_ICON_AND_SPLASH.md`.
- Какие файлы созданы или изменены:
  - созданы: `scripts/generate-brand-assets.py`, `assets/brand/logo-source.png`,
    `assets/images/splash/{iris-white,iris-glow,sector-0..5,iris-full}.png`,
    `src/features/splash/components/animated-splash.tsx`,
    `src/features/splash/splash-timing.ts` + тест,
    `src/types/assets.d.ts`,
    `.github/workflows/ci.yml`
  - изменены: `app.json`, `eas.json`, `src/features/ads/config.ts`,
    `src/app/_layout.tsx`, иконки в `assets/images/`, `docs/privacy-policy.html`,
    `PRIVACY.md`, `PRIVACY_POLICY.md`, `README.md`, `README_staff.md`,
    `MAINTENANCE_AI.md`, `TESTING.md`, `APP_ICON_AND_SPLASH.md`, `DECISIONS.md`
  - удалены: `assets/images/{react-logo*,expo-logo,expo-badge*,logo-glow,tutorial-web}.png`,
    `assets/images/tabIcons/`, `assets/expo.icon/`
- Какие команды запускались:
  - генерация ассетов (Pillow), `npm run typecheck`, `npm run lint`, `npm test`
    (203/203), `npx expo-doctor` (20/21 — прежний patch-дрейф)
  - `npx expo prebuild --platform android --clean --no-install` + проверка
    AndroidManifest (CAMERA/USE_BIOMETRIC есть; WRITE/FINGERPRINT — remove;
    `applicationId ru.nov.molcha.progressvisualizer`, versionCode 5)
  - `npx expo prebuild --platform ios --clean` + `pod install` (через
    ENTERPRISE_REPOSITORY) + `npx expo run:ios` (новый bundle ID)
- Результат проверок:
  - typecheck/lint: чисто; тесты: 203/203 (+4 теста тайминга splash)
  - expo-doctor: 20/21 (только предсуществующий дрейф patch-версий expo/*)
  - Pages: `privacy-policy.html` отдаёт 200
  - iOS: `expo prebuild --platform ios --clean` + `pod install` + `run:ios` —
    Build Succeeded (0 errors/0 warnings), приложение с новым bundle ID
    `ru.nov.molcha.progressvisualizer` установлено и запущено, JS-бандл загружен,
    MMKV чистый (0 ключей → показывается онбординг), redbox/ошибок в логах нет
- Известные проблемы:
  - Физический Android и визуальная сверка первого кадра splash — только вручную.
    EAS-сборка не запускалась (по условию предыдущей задачи; для проверки нужна).
  - Первый кадр JS-оверлея слегка размыт (blur 3), нативный splash — резкий:
    лёгкое несовпадение по фокусу, но без скачка фона/позиции/размера.
  - Обновлённая политика на Pages появится после пуша `main`.
  - Удаление `WRITE_EXTERNAL_STORAGE` может повлиять на экспорт в галерею на
    очень старых Android (≤ API 28) — проверить на устройстве.
- Следующий шаг: EAS `preview` APK (versionCode 5) + прогон чек-листа на
  физическом Android/iOS; затем задача 2 (Grid/List morph).

---

### 2026-10-13 — Ad placeholder: переполнение текста + каскадное появление

- Что сделано (по `AI_CODER_AD_PLACEHOLDER_OVERFLOW_AND_STAGGER.md`):
  - (1) **Переполнение**: в `ad-placeholder.tsx` жёсткий `height` заменён на
    `minHeight` (64 compact / 88 medium), добавлены `paddingVertical`, `overflow:
    'hidden'`; описанию — `numberOfLines={2}`, `flexShrink: 1`,
    `includeFontPadding: false` (локально, не в AppText); label — `numberOfLines={1}`.
  - (2) **Текст-обрывок исправлен** во всех 5 локалях: `ads.placeholderText` теперь
    цельная фраза («Здесь будет реклама — она поддержит приложение» и т.д.),
    ключи не менялись.
  - (3) **Каскад**: `AdPlaceholder` получил `animated`/`animationIndex` (default
    false/1), анимация по `getStaggerDelay` (opacity + translateY, spring),
    `useReducedMotion` отключает; inline-слот в списке Проектов передаёт
    `animated animationIndex={1}`, перезапуск при возврате — key от
    `animationNonce`. Empty state / Project / Settings остаются статичными.
  - (4) Индексы карточек НЕ сдвигались (по заданию — только после визуальной
    проверки); слот и вторая карточка появляются одновременно на 60 мс.
  - `stagger.ts` и его тесты не менялись; новых зависимостей нет.
- Какие файлы созданы или изменены:
  - изменены: `src/features/ads/components/ad-placeholder.tsx`,
    `src/app/(tabs)/index.tsx`, `src/i18n/locales/{ru,en,es,kk,zh-Hans}.ts`,
    `PROGRESS.md`, `README_staff.md`, `MAINTENANCE_AI.md`, `TESTING.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - smoke на iOS-симуляторе (dev build + Metro): перезапуск приложения,
    проверка логов на redbox/runtime-ошибки
- Результат проверок:
  - typecheck/lint: чисто; тесты: 198/198 (stagger-тесты без изменений)
  - expo-doctor: 20/21 (предсуществующий patch-дрейф expo/*)
  - iOS: бандл загружен, ошибок в логах нет
- Известные проблемы:
  - Визуальные проверки (5 локалей, макс. системный шрифт, 3 темы, ~360 dp,
    Reduced Motion) и физический Android — только вручную: устройства нет.
    Для проверки на Android нужна новая сборка (APK v3 не содержит этих правок).
  - iOS-визуал (minHeight/паддинги) — ручная приёмка.
- Следующий шаг: ручная проверка слота на Android/iOS; затем задача 2
  (Animated Grid List, Grid/List morph) — ждёт подтверждения камеры на Samsung.

---

### 2026-10-13 — Native-пересборка iOS (expo-image-manipulator, iPad) + фикс миграции

- Что сделано:
  - `expo prebuild --platform ios --clean` + `pod install` + `npx expo run:ios`
    (iPhone 17 Pro Max): сборка успешна (0 errors/0 warnings), приложение
    установлено, запущено, JS-бандл загружен (2064 модуля), native-модуль
    `expo-image-manipulator` доступен, крашей нет.
  - **Побочная проблема окружения**: `pod install` падал на скачивании
    `reactnative-dependencies`/`reactnative-core` с `repo1.maven.org` →
    `repo.reactnative.dev` (соединение виснет/рвётся). Решение: зеркало
    `ENTERPRISE_REPOSITORY=https://maven-central.storage-download.googleapis.com/maven2`
    + ручная загрузка обоих tarball'ов (debug/release) в
    `~/Library/Caches/ReactNative/` и `ios/Pods/*-artifacts/` (SHA1 сверены).
    После этого pod install и сборка прошли. Зафиксировано в STACK_RESOLVED.md
    и README_staff.md (раздел 9).
  - **Фикс по итогам smoke-теста**: миграция миниатюр пыталась сжимать фото,
    чьи файлы отсутствуют (stale-пути из старого контейнера симулятора) и
    писала WARN-цикл. В `ensureThumbnails` добавлена проверка
    `photoFileExists(photo.uri)` (новый helper в storage-слое); битые записи
    пропускаются. Проверено: после перезапуска новых предупреждений нет.
- Какие файлы созданы или изменены:
  - изменены: `src/storage/photoFiles.ts` (+photoFileExists),
    `src/store/projectStore.ts` (ensureThumbnails пропускает missing),
    `src/store/projectStore.test.ts` (+1 тест), `STACK_RESOLVED.md`,
    `README_staff.md`, `PROGRESS.md`
- Какие команды запускались:
  - `npx expo prebuild --platform ios --clean`
  - `ENTERPRISE_REPOSITORY=... pod install` (в `ios/`)
  - `npx expo run:ios --device "iPhone 17 Pro Max"`
  - `npm run typecheck`, `npm run lint`, `npm test` (198/198)
- Результат проверок:
  - сборка iOS: Build Succeeded (0 errors/0 warnings); запуск без redbox
  - typecheck/lint: чисто; тесты: 198/198 (было 197)
  - после перезапуска: новых WARN миграции нет
- Известные проблемы:
  - Ошибка `osascript ... Simulator` при run:ios — некритична (активация окна).
  - iPad-макеты и онбординг визуально не проверялись (ручная приёмка).
- Следующий шаг: ручная визуальная приёмка (онбординг при первом запуске,
  миниатюры, iPad); далее задача 2 — Animated Grid List (Grid/List morph).

---

### 2026-10-12 — iPad, онбординг, политика конфиденциальности, миниатюры

- Что сделано (по `IMPLEMENTATION_IPAD_ONBOARDING_PRIVACY_THUMBNAILS.md` +
  `ALTERNATIVE_STORES_REQUIREMENTS.md`, с адаптацией под фактический код):
  - (1) **iPad**: `ios.supportsTablet: true` в app.json.
  - (2) **Онбординг**: 4 шага (`src/app/onboarding.tsx` +
    `onboarding-screen.tsx`), флаг `hasCompletedOnboarding` в AppSettings/MMKV,
    гейтинг через `Stack.Protected` (без ручных redirect), тексты в 5 локалях,
    «Пропустить» на каждом шаге, индикаторы прогресса, accessibility-метки.
  - (3) **Политика**: `PRIVACY_POLICY.md` (EN для магазинов), ссылка из `PRIVACY.md`
    (RU), `docs/privacy-policy.html` под GitHub Pages, `extra.privacyPolicyUrl`
    в app.json (сейчас GitHub-rendered markdown), кнопка «Политика
    конфиденциальности» в Настройках (`Linking.openURL`).
  - (4) **Миниатюры**: `expo-image-manipulator` ~57.0.21 (SDK-pinned);
    `PhotoMetadata.thumbnailUri`; `createPhotoThumbnail`/`getPhotoThumbnailUri`
    в storage-слое (400px JPEG 0.7, `<имя>_thumb.jpg`); сохранение генерирует
    миниатюру (сбой — не критичен); удаление фото удаляет и миниатюру;
    `ensureThumbnails()` в root layout — фоновая миграция старых фото (один
    batched set); списки/превью (обложка проекта, timeline, hero, лист выбора)
    используют `getPhotoPreviewUri` (миниатюра → fallback оригинал),
    viewer/compare/камера — полный размер.
- Какие файлы созданы или изменены:
  - созданы: `src/app/onboarding.tsx`,
    `src/features/onboarding/components/onboarding-screen.tsx`,
    `PRIVACY_POLICY.md`, `docs/privacy-policy.html`,
    `__mocks__/expo-image-manipulator.ts`
  - изменены: `app.json` (supportsTablet, extra.privacyPolicyUrl),
    `package.json` (+expo-image-manipulator), `src/models/settings.ts`,
    `src/models/photo.ts`, `src/store/settingsStore.ts`, `src/store/projectStore.ts`,
    `src/storage/photoFiles.ts`, `src/utils/photos.ts`, `src/app/_layout.tsx`,
    `src/app/(tabs)/settings.tsx`, `src/app/(tabs)/index.tsx`,
    `src/app/project/[id]/index.tsx`,
    `src/features/gallery/components/photo-picker-sheet.tsx`,
    `src/i18n/locales/*.ts` (+onboarding.*, +settings.privacyPolicy),
    `__mocks__/expo-file-system.ts` (+move), тесты (photoFiles/projectStore/photos/
    settingsStore), `PRIVACY.md`, `STACK_RESOLVED.md`, `DECISIONS.md`,
    `README_staff.md`, `MAINTENANCE_AI.md`, `TESTING.md`
- Какие команды запускались:
  - `npx expo install expo-image-manipulator`
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`,
    `npx expo export --platform ios`
- Результат проверок:
  - typecheck/lint: чисто; тесты: 197/197 (было 189; +8: миниатюры, preview-uri,
    онбординг-флаг)
  - экспорт iOS: собран (новый модуль бандлится без ошибок)
  - expo-doctor: 19/21 — предсуществующий patch-дрейф expo/* + временная
    сетевая ошибка проверки React Native Directory (не связаны с задачей)
- Известные проблемы:
  - **Нужна native-пересборка**: `expo-image-manipulator` — новый native-модуль;
    старый dev build/APK v2 без пересборки запускать нельзя (краш при импорте).
  - GitHub Pages для `docs/privacy-policy.html` включается вручную в настройках
    репозитория; до этого ссылка ведёт на GitHub-rendered `PRIVACY_POLICY.md`.
  - Ручные проверки: макеты/ландшафт iPad, показ онбординга один раз, скорость
    генерации миниатюр на большом архиве, ссылка политики.
  - Из action items магазинов остаются организационные шаги владельца (аккаунты,
    feature graphic, IARC, RuStore-документы) — кода не требуют.
- Следующий шаг: native-сборка (EAS/run:ios) → ручная приёмка iPad/онбординга/
  миниатюр; далее задача 2 — Animated Grid List (Grid/List morph).

---

### 2026-10-12 — Задача 1: возврат разрешения CAMERA + полный permission flow

- Что сделано:
  - (1) **Причина найдена и исправлена**: у `expo-image-picker` в `app.json` стояло
    `cameraPermission: false` — плагин вызывает `withBlockedPermissions(CAMERA)`
    (`tools:node="remove"`), из-за чего разрешение камеры вырезалось из манифеста
    и Samsung не показывал «Камера». Поле удалено; добавлен `microphonePermission: false`
    (image-picker по умолчанию добавлял `RECORD_AUDIO` без необходимости);
    `photosPermission: false` и `recordAudioAndroid: false` сохранены.
  - (2) `android.versionCode` 1 → 2; выполнен `expo prebuild --platform android --clean`.
    Проверено в `android/app/src/main/AndroidManifest.xml`: CAMERA присутствует,
    правила `tools:node="remove"` для CAMERA нет, RECORD_AUDIO помечен remove.
  - (3) **Полный permission flow** (`src/app/(tabs)/camera.tsx`): чистая функция
    `resolveCameraPermissionView` (`src/utils/cameraPermission.ts`, TDD, 4 состояния);
    состояние загрузки без диалога и CameraView; экран запроса с guard повторного
    нажатия и текстом «Запрос разрешения…»; экран постоянного отказа с
    `Linking.openSettings()`, обработкой ошибки и повтором; кнопка «Назад к проектам»;
    одна подписка `AppState` перечитывает `getPermission()` при возврате в active.
  - (4) Permission-экраны используют цвета темы, safe area и отступ под нижнее меню —
    читаемость во всех оформлениях (фикс светлого текста на светлом фоне).
  - (5) i18n: удалены устаревшие `camera.allow`/`camera.permissionDenied`, добавлены
    `camera.allowCamera`, `camera.permissionRequesting`, `camera.permissionDeniedTitle`,
    `camera.permissionSettingsHint`, `camera.openSettings`, `camera.backToProjects`,
    `camera.settingsError` во все 5 локалей.
  - Задача 2 (Animated Grid List) намеренно НЕ начиналась — по заданию только после
    проверки камеры на физическом устройстве.
- Какие файлы созданы или изменены:
  - созданы: `src/utils/cameraPermission.ts`, `src/utils/cameraPermission.test.ts`
  - изменены: `app.json` (plugins + versionCode 2), `src/app/(tabs)/camera.tsx`,
    `src/i18n/locales/{en,ru,zh-Hans,kk,es}.ts`, `DECISIONS.md`, `README_staff.md`,
    `MAINTENANCE_AI.md`, `TESTING.md`, `PROGRESS.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test` (189/189)
  - `npx expo prebuild --platform android --clean --no-install` + проверка Manifest
- Результат проверок:
  - typecheck/lint: чисто; тесты: 189/189 (было 185; +4 теста permission-view)
  - Manifest: `android.permission.CAMERA` есть, `tools:node="remove"` для CAMERA нет,
    `RECORD_AUDIO` с remove; versionCode 2
- EAS-сборка (2026-10-12):
  - build `12d375a6-adc0-4a0d-adfd-e5c9a8939210`, profile `apk`, versionCode 2,
    commit `0fb76c1`, статус FINISHED
  - APK: https://expo.dev/artifacts/eas/-v4XAeebcRQllI3hJH74QnC4Jh6p7J3Do76dzN0d_g8.apk
  - страница: https://expo.dev/accounts/alomium/projects/progress-visualizer-app/builds/12d375a6-adc0-4a0d-adfd-e5c9a8939210
  - запрошенные разрешения установленного APK (парсер): CAMERA есть, RECORD_AUDIO нет,
    versionCode 2 (примечание: INTERNET/READ_MEDIA_* — предсуществующие, от библиотек)
- Известные проблемы:
  - Чистая установка, системный диалог и тихий затвор проверяются владельцем на
    физическом Samsung по свежему EAS APK (в окружении нет Android-устройства).
  - Итоговый объединённый манифест (после AGP merge) стоит дополнительно проверить
    через `aapt dump badging` на скачанном APK — в отчёте по задаче.
- Следующий шаг: EAS APK (versionCode 2) → ручная проверка камеры на Samsung →
  только после этого задача 2 (Animated Grid List Grid/List morph).

---

### 2026-10-07 — Звук затвора (Android) + UI-анимации: список, слайдер, числа

- Что сделано:
  - (1) **Фикс звука затвора**: `takePictureAsync` вызывается с типизированной
    константой `CAPTURE_OPTIONS: CameraPictureOptions = { shutterSound: false }`
    (`src/app/(tabs)/camera.tsx`). Штатный громкий Android-звук Expo отключён;
    визуальная анимация затвора и haptic (по настройке) сохранены, свой звук не добавлен.
  - (2) **Animated Grid List**: чистая утилита `src/utils/stagger.ts`
    (`getStaggerDelay`: шаг 60 мс, первые 10 карточек, дальше мгновенно) + тесты;
    `ProjectListItem` получил `index`/`animateOnMount`/`animationNonce` и анимацию
    `opacity 0→1` + `translateY 20→0` с пружиной; каскад перезапускается при возврате
    на вкладку (`useFocusEffect`); `useReducedMotion` отключает анимацию.
  - (3) **Усиленный слайдер сравнения** (в `compare-slider.tsx`, без нового компонента):
    handle 44pt с `chevron-back/forward`, intro 0%→100%→50% (прерывается жестом),
    пружинная доводка с учётом `velocityX`, haptic у краёв через `triggerHaptic`
    (только при `hapticsEnabled`), градиентная линия на встроенном RN
    `experimental_backgroundImage` (без `expo-linear-gradient`), accessibility
    (`adjustable` + проценты), reduced motion.
  - (4) **AnimatedNumber** (`src/components/ui/animated-number.tsx`): count-up на
    паттерне Reanimated 4 (`createAnimatedComponent(TextInput)` + `useAnimatedProps`,
    т.к. `addWhitelistedNativeProps` в 4.x отсутствует). Интегрирован: статистика
    проекта (фото/дни), процент ghost overlay камеры (25%↔85%), дни между снимками
    в compare. Поддержка decimals/prefix/suffix, reduced motion.
  - (5) **Попутный фикс**: в `project/[id]/index.tsx` проверка `hasHydrated`/skeleton
    была ошибочно вставлена внутрь `handleAddPhoto` (с коммита cf7b03a) — вынесена
    в ранний return тела экрана.
  - (6) i18n: ключи `project.statPhotos`, `project.statDays`, `compare.daysBetweenLabel`,
    `compare.sliderA11y` во все 5 локалей.
- Какие файлы созданы или изменены:
  - созданы: `src/components/ui/animated-number.tsx`, `src/utils/stagger.ts`,
    `src/utils/stagger.test.ts`
  - изменены: `src/app/(tabs)/camera.tsx`, `src/app/(tabs)/index.tsx`,
    `src/app/project/[id]/index.tsx`, `src/app/project/[id]/compare.tsx`,
    `src/features/projects/components/project-list-item.tsx`,
    `src/features/gallery/components/compare-slider.tsx`,
    `src/features/camera/components/overlay-controls.tsx`,
    `src/i18n/locales/{en,ru,zh-Hans,kk,es}.ts`,
    `DECISIONS.md`, `README_staff.md`, `MAINTENANCE_AI.md`, `TESTING.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`,
    `npx expo export --platform ios`
  - `npx expo run:ios` (iPhone 17 Pro Max) + `npx expo start` + запуск приложения:
    iOS Bundled 807ms (2056 модулей), приложение живо, в логах Metro/симулятора
    нет JS-ошибок/redbox
- Результат проверок:
  - typecheck/lint: чисто; тесты: 185/185 (было 180; +5 тестов stagger)
  - expo-doctor: 20/21 — предсуществующий дрейф patch-версий expo/* (новых
    зависимостей не добавлялось; сверять с STACK_RESOLVED.md)
  - экспорт iOS: собран; запуск без runtime-ошибок
- Известные проблемы:
  - Звук затвора проверяется только вручную на **release/preview APK и физическом
    Android** — в окружении нет устройства/эмулятора (см. TESTING.md, п. OEM).
  - Визуальная приёмка анимаций (каскад, intro слайдера, count-up, reduced motion) —
    ручная: модель не читает скриншоты.
  - Переводы новых ключей zh-Hans/kk/es не проверены носителями (полнота — компилятор).
- Следующий шаг: ручная приёмка на устройствах (звук затвора и OEM-регионы, анимации,
  жесты); затем bundleIdentifier и публикация.

---

### 2026-09-17 — Дизайн-полировка и рекламные placeholder-слоты

- Что сделано: (1) единый нижний отступ `getBottomInset()` (safe area + меню + выступ
  кнопки + буфер + опц. ad-слот), применён на Projects/Settings, отступ под FAB на Project;
  (2) reusable `AdPlaceholder` (флаг `SHOW_AD_PLACEHOLDERS`, без SDK/сети, не кликабелен)
  в разрешённых местах: Projects (после 1-й карточки / под CTA), Project (после quick
  compare), Settings (near-bottom); (3) Neumorphism — тени снижены ~25–30%;
  (4) compare — плавающая капсула режимов, полупрозрачный разделитель + handle `‹›`,
  подписи «До/После»; (5) камера — тёмное полупрозрачное нижнее меню; (6) блок
  «Первое и последнее» с заголовком, подписью, датами и периодом; (7) выбранный стиль
  в настройках подсвечен мягким фоном.
- Какие файлы созданы или изменены:
  - созданы: `src/features/ads/config.ts`, `src/features/ads/components/ad-placeholder.tsx`,
    `src/theme/tab-bar.test.ts`
  - изменены: `src/theme/tab-bar.ts` (+getBottomInset), `src/app/(tabs)/{index,settings}.tsx`,
    `src/app/project/[id]/{index,compare}.tsx`, `src/features/navigation/components/main-tab-bar.tsx`
    (тёмное меню на камере), `src/features/gallery/components/compare-slider.tsx`,
    `src/components/ui/neu-surface.tsx`, `src/features/settings/components/appearance-settings-card.tsx`,
    `src/i18n/locales/*.ts` (+ads.*, +firstLast*), `DECISIONS.md`, `README_staff.md`,
    `MAINTENANCE_AI.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo export --platform ios`
  - перезапуск Metro (`--clear`) + relaunch на симуляторе
- Результат проверок:
  - typecheck/lint: чисто; тесты: 174/174 (было 171); экспорт iOS: собран; запуск без
    redbox/ошибок
- Известные проблемы:
  - Визуальная проверка (тени Neumorphism, капсула compare, handle, тёмное меню на камере,
    placeholder-зоны) — ручная (модель не читает скриншоты).
  - `SHOW_AD_PLACEHOLDERS` сейчас `true` для dev-превью; перед публикацией без SDK — `false`.
- Следующий шаг: ручная визуальная приёмка трёх экранов (Projects/Project/Settings) и
  проверка отсутствия placeholder на Camera/Compare/Timelapse; затем bundleIdentifier и публикация.

---

### 2026-09-17 — Корректировка UI экрана проекта (safe area, hero, action sheet, skeleton)

- Что сделано: (1) убран двойной верхний safe-area: `AppScreen` получил проп `edges`,
  стек-экраны с header (project/timelapse) используют `edges={['left','right']}`;
  (2) hero «Первое и последнее» — даты под миниатюрами, короткий элемент с днями,
  бейджи эталона/избранного; (3) вторичные действия на карточке проекта и в timeline
  перенесены в `...`/ActionSheet (постоянная корзина и кнопка «Переименовать» убраны);
  (4) skeleton loading (`SkeletonBlock`/`ProjectListSkeleton`/`ProjectDetailsSkeleton` +
  `hasHydrated` в projectStore); (5) рекламный текст — пользовательский
  `ads.placeholderText`, технический `ads.placeholderSize` удалён; (6) Quick Compare —
  подсказка до двух строк, `minHeight`.
- Какие файлы созданы или изменены:
  - создан: `src/components/ui/skeleton.tsx`
  - изменены: `src/components/ui/app-screen.tsx` (+edges), `src/app/project/[id]/index.tsx`
    (hero/skeleton/action sheet/2-line), `src/app/project/[id]/timelapse.tsx` (edges),
    `src/app/(tabs)/index.tsx` (skeleton), `src/features/projects/components/project-list-item.tsx`
    (переписан: `...` + ActionSheet), `src/store/projectStore.ts` (+hasHydrated),
    `src/store/index.ts` (set hasHydrated), `src/features/ads/components/ad-placeholder.tsx`,
    `src/i18n/locales/*.ts` (+ads.placeholderText, +common.moreActions, −ads.placeholderSize/Dev),
    `src/i18n/i18n.test.ts`, `DECISIONS.md`, `README_staff.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo export --platform ios`
  - перезапуск Metro (`--clear`) + relaunch на симуляторе
- Результат проверок:
  - typecheck/lint: чисто; тесты: 176/176 (было 174); экспорт iOS: собран; запуск без
    redbox/ошибок
- Известные проблемы:
  - Визуальная проверка (hero, action sheet, safe-area, skeleton-переходы) — ручная.
  - Skeleton подключён к `hasHydrated`, но гидратация блокирующая (root возвращает null
    до готовности), поэтому скелет на практике не «мигает» — задел на будущее.
- Следующий шаг: ручная визуальная приёмка; затем bundleIdentifier и публикация.

---

### 2026-09-22 — Импорт фото, экспорт с подтверждением, Predictive Back

- Что сделано: (1) импорт фото с устройства через системный picker (`expo-image-picker` +
  `src/storage/imagePicker.ts`); кнопка «Выбрать фото с устройства» в empty state Проектов,
  пункт «Добавить фото с устройства» в action sheet проекта; файл копируется в sandbox через
  `saveCapturedPhoto`; (2) экспорт в галерею с подтверждающим модалом
  (`ExportConfirmationModal`) и toast-результатом (`ToastProvider`/`useToast`); (3) включён
  predictive back (`predictiveBackGestureEnabled: true`); (4) убраны избыточные
  Android-разрешения на чтение; (5) удалён `BOOTSTRAP_PROMPT.md`; (6) `createProject`
  возвращает Project (id).
- Какие файлы созданы или изменены:
  - созданы: `src/storage/imagePicker.ts`, `src/storage/imagePicker.test.ts`,
    `__mocks__/expo-image-picker.ts`, `src/features/gallery/components/export-confirmation-modal.tsx`,
    `src/components/ui/toast.tsx`
  - удалён: `BOOTSTRAP_PROMPT.md`
  - изменены: `app.json` (plugin image-picker, разрешения, predictive back),
    `package.json` (+expo-image-picker), `src/store/projectStore.ts` (createProject → Project),
    `src/app/(tabs)/index.tsx` (импорт), `src/features/projects/components/project-list-item.tsx`
    (+добавить фото), `src/app/project/[id]/viewer/[photoId].tsx` (экспорт-модал+toast),
    `src/app/_layout.tsx` (ToastProvider), `src/i18n/locales/*.ts` (+импорт/экспорт ключи,
    −старые export-ключи), `DECISIONS.md`
- Какие команды запускались:
  - `npx expo install expo-image-picker`
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - `npx expo export --platform ios`, `npx expo run:ios` (пересборка с нативным модулем)
- Результат проверок:
  - typecheck/lint: чисто; тесты: 180/180 (было 176); сборка iOS: Build Succeeded
    (0 errors/0 warnings), expo-image-picker залинкован; запуск без краша
  - expo-doctor: 20/21 (предсуществующий дрейф patch-версий expo/*, не связан с задачей)
- Известные проблемы:
  - Импорт/экспорт и predictive back требуют ручной проверки на реальном Android 13+
    устройстве (нет Android-эмулятора/устройства; на симуляторе iOS picker тоже нативный).
- Следующий шаг: ручная проверка импорта/экспорта/predictive back на устройствах; затем
  bundleIdentifier и публикация.

---

### 2026-09-16 — UX-исправления: i18n, слайдер, клавиатура, звук, Android-темы

- Что сделано: (1) i18n на 5 языков (ru/en/zh-Hans/kk/es) — собственный движок
  (интерполяция, плюрализация, fallback en, полнота через типы + тест), селектор языка
  в настройках, определение языка устройства при первом запуске; (2) empty states
  («Наблюдайте за изменениями» / первое фото / один снимок / все скрыты); (3) фикс
  геометрии слайдера сравнения (clip вместо сжатия, позиция сохраняется при повороте);
  (4) кнопка «Отмена» в быстром сравнении на месте «Выбрать»; (5) редактор заметки:
  tap по фону скрывает только клавиатуру, подтверждение при отмене с изменениями,
  KeyboardAvoidingView; (6) Android скрывает «Простой» (simple/minimalism → modern);
  (7) «Timelapse» → «Таймлапс»; (8) звук затвора — исследование (системный, ограничение
  зафиксировано, без изменений кода).
- Какие файлы созданы или изменены (ключевые):
  - i18n: `src/i18n/{index,locale,types}.ts`, `locales/{en,ru,zh-Hans,kk,es}.ts`,
    `i18n.test.ts`
  - модели/store: `models/settings.ts` (+language), `store/settingsStore.ts`
    (+language/миграция Android), `theme/design-themes.ts` (+resolveDesignThemeId,
    Android без simple)
  - экраны переведены на t(): `app/_layout.tsx`, `(tabs)/_layout.tsx`,
    `(tabs)/{index,camera,settings}.tsx`, `project/[id]/{index,compare,timelapse}.tsx`,
    `viewer/[photoId].tsx`, `support.tsx`
  - компоненты: `main-tab-bar.tsx`, `overlay-controls.tsx`, `ghost-reference-modal.tsx`,
    `photo-picker-sheet.tsx`, `action-sheet.tsx`, `note-editor-modal.tsx` (переписан),
    `compare-slider.tsx` (переписан), `compare-overlay/side-by-side.tsx`,
    `appearance-settings-card.tsx`, `language-settings-card.tsx` (новый),
    `reminder-settings-card.tsx`, `project-list-item.tsx`, `project-form-modal.tsx`,
    `lock-screen.tsx`
  - utils: `dates.ts` (formatDate/formatMonthLabel locale-aware, убран formatDays),
    `progress.ts` (groupPhotosByMonth locale)
  - docs: `DECISIONS.md`, `README.md`, `README_staff.md`, `MAINTENANCE_AI.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - `npx expo export --platform ios` (проверка бандла)
- Результат проверок:
  - typecheck/lint: чисто; тесты: 169/169 (было 145); expo-doctor: 21/21
  - бандл iOS: собран без ошибок
- Известные проблемы:
  - Звук затвора — системный (`expo-camera`, `shutterSound` default true); громкость
    через API не регулируется; нужна проверка на реальных iOS/Android (эмулятор не
    слышно) — решение зафиксировано, код не менялся.
  - Слайдер/клавиатура/жесты — ручная приёмка на устройстве (модель не читает скриншоты).
  - Переводы zh-Hans/kk/es не проверены носителем (полнота — компилятор + тест).
- Следующий шаг: ручная приёмка на устройствах, проверка переводов, затем bundleIdentifier
  и публикация.

---

### 2026-09-17 — Фикс высоты «Быстрого сравнения» и карточки проекта

- Что сделано: (1) блок «Быстрое сравнение» получил фиксированную высоту
  (`minHeight: 96` + центрирование) и однострочную подсказку — высота не меняется
  при переключении «Выбрать»↔«Отмена»; (2) карточка проекта в «Современном» —
  непрозрачная поверхность (`colors.surface`) + рамка (чёткое отличие от фона),
  кнопка «Удалить» заменена иконкой корзины в правом нижнем углу, «Переименовать»
  остаётся кнопкой; Neumorphism сохраняет мягкий материал.
- Какие файлы созданы или изменены:
  - изменены: `src/app/project/[id]/index.tsx`,
    `src/features/projects/components/project-list-item.tsx`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`
  - перезапуск приложения на симуляторе
- Результат проверок:
  - typecheck/lint: чисто; тесты: 171/171; запуск без redbox/ошибок
- Известные проблемы:
  - Визуальная проверка карточки (рамка/иконка корзины) — ручная (модель не читает
    скриншоты).
- Следующий шаг: ручная приёмка UI; далее bundleIdentifier и публикация.

---

### 2026-09-17 — Переключатель языка (dropdown) + русский по умолчанию

- Что сделано: (1) русский язык по умолчанию (`DEFAULT_SETTINGS.language = 'ru'`,
  убрано определение языка устройства); (2) компонент `LanguageSwitcher` — компактная
  кнопка (Globe + короткий код + chevron) с dropdown (Modal + measureInWindow), варианты
  clean/glass/minimal, пункты с нативным названием + кодом + check-иконкой, без флагов,
  доступный (aria/hover/focus/клавиатура); (3) переключатель встроен в Настройки вместо
  прежнего списка `LanguageSettingsCard` (удалён); (4) короткие коды `LANGUAGE_SHORT`.
- Какие файлы созданы или изменены:
  - создан: `src/features/settings/components/language-switcher.tsx`
  - удалён: `src/features/settings/components/language-settings-card.tsx`
  - изменены: `src/i18n/locale.ts` (+LANGUAGE_SHORT, −detectDeviceLocale),
    `src/i18n/index.ts` (реэкспорт), `src/store/settingsStore.ts` (default ru),
    `src/store/settingsStore.test.ts`, `src/i18n/i18n.test.ts` (+метаданные языков),
    `src/i18n/locales/*.ts` (+language.change), `src/app/(tabs)/settings.tsx`,
    `DECISIONS.md`, `README.md`, `README_staff.md`, `MAINTENANCE_AI.md`
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo export --platform ios`
  - перезапуск Metro (`--clear`) + relaunch на симуляторе
- Результат проверок:
  - typecheck/lint: чисто; тесты: 171/171 (было 169); экспорт iOS: собран без ошибок;
    запуск на симуляторе без redbox/ошибок
- Известные проблемы:
  - Визуальная проверка dropdown (позиция, hover/focus, варианты glass/minimal) — ручная
    (модель не читает скриншоты).
- Следующий шаг: ручная приёмка переключателя на устройстве/web; далее bundleIdentifier
  и публикация.

---

### 2026-09-15 — Продуктовая итерация UI (redesign, timeline, ghost reference, compare)

- Что сделано: (1) оставлены три оформления `modern`/`simple`/`neumorphism` с
  миграцией старых id и platform-рендером `modern` (iOS glass / Android Material);
  (2) единое нижнее меню «Проекты — [камера/затвор] — Настройки» с центральной
  выступающей кнопкой и анимацией «камера → затвор» (shutter bridge);
  (3) ghost reference per project (latest/first/manual) + tap-to-boost вместо
  режима «90%»; (4) экран проекта как история: summary, первое/последнее,
  быстрое сравнение (Flow A), timeline по месяцам, бейджи; (5) заметки/избранное/
  скрытие фото без удаления; (6) viewer с листом действий и compare-modal (Flow B);
  (7) compare-экран на 3 режима (слайдер/рядом/наложение) с выбором пары (Flow C),
  без сохранения файла.
- Какие файлы созданы или изменены (ключевые):
  - модели: `models/settings.ts` (+modern/simple/neumorphism), `models/project.ts`
    (+referenceMode/referencePhotoId), `models/photo.ts` (+note/isFavorite/isHidden)
  - тема: `theme/design-themes.ts` (переписан), `theme/ThemeProvider.tsx`
    (+Platform.OS), `theme/tab-bar.ts` (+MAIN_TAB_BAR_*)
  - store: `store/settingsStore.ts` (миграция), `store/projectStore.ts`
    (+setProjectReference/+updatePhoto)
  - utils: `utils/reference.ts`, `utils/progress.ts`, `utils/dates.ts`
    (+formatDays/formatMonthLabel), `utils/photos.ts` (+visible/first/latest),
    `utils/ghost.ts` (tap-to-boost 0.85)
  - навигация: `features/navigation/components/main-tab-bar.tsx`,
    `camera-shutter-bridge.ts`, удалён `liquid-glass-tab-bar.tsx`,
    `app/(tabs)/_layout.tsx` (единый таббар)
  - камера: `app/(tabs)/camera.tsx`, `overlay-controls.tsx`,
    `ghost-reference-modal.tsx`
  - экраны: `app/project/[id]/index.tsx`, `viewer/[photoId].tsx`,
    `compare.tsx` (заменил `compare/[photoId].tsx`), `app/(tabs)/index.tsx`,
    `settings.tsx`
  - gallery: `photo-picker-sheet.tsx`, `action-sheet.tsx`, `note-editor-modal.tsx`,
    `compare-overlay.tsx`, `compare-side-by-side.tsx` (+подписи дат)
  - settings: `appearance-settings-card.tsx` (3 стиля)
- Какие команды запускались:
  - `npm run typecheck`, `npm run lint`, `npm test`, `npx expo-doctor`
  - `npx expo export --platform ios` (проверка бандла)
  - перезапуск Metro (`--clear`) + relaunch на симуляторе
- Результат проверок:
  - typecheck/lint: чисто; тесты: 145/145 (было 108); expo-doctor: 21/21
  - бандл iOS: собран (2036 модулей, 4.4MB hbc) без ошибок
  - запуск на симуляторе iPhone 17 Pro Max: без redbox/ERROR/fatal в логах Metro
- Известные проблемы:
  - Визуальная проверка (темы, анимация затвора, tap-to-boost, слайдер сравнения,
    Liquid Glass) — ручная: модель не поддерживает ввод изображений.
  - Жесты (tap-to-boost на камере, pan-слайдер сравнения, свайп вкладок) требуют
    проверки на реальном устройстве.
  - Android — нет эмулятора; Modern/Material-рендер не проверен.
- Следующий шаг: ручной ревью владельцем, затем bundleIdentifier и публикация.

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
