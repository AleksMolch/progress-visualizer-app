# Отчёт об интеграции оформлений и быстрого призрака

> Итог выполнения задания `DESIGN_THEMES_AND_GHOST_TASK.md`.
> Отчёт честно разделяет автоматически проверенное и то, что требует ручной
> проверки владельцем (модель не читает скриншоты).

---

## 1. Коммиты

- Исходный commit (из ТЗ): `6738ef1` — совпал с локальным HEAD, откат не потребовался.
- Итоговые коммиты (по этапам):
  - `ea32ffe` — фундамент тем (designTheme + resolver + безопасная гидратация);
  - `d0dd33e` — Галерея + выбор оформления/режима в настройках + cover-превью;
  - `310053e` — быстрый призрак (hold-to-peek 90%) + доступная кнопка;
  - `fb7dd47` — Liquid Glass (adaptive surface, плавающий таббар, frosted-карточки).

---

## 2. Изменённые и новые файлы

### Изменены

- `src/models/settings.ts` — `DesignThemeId` + поле `designTheme`.
- `src/store/settingsStore.ts` — `normalizeSettings` + кастомный `merge`.
- `src/theme/ThemeProvider.tsx` — подключены `designTheme` + `themeMode`.
- `src/components/ui/app-card.tsx` — радиус/материал из токенов.
- `src/components/ui/app-button.tsx` — радиус из токенов.
- `src/features/projects/components/project-list-item.tsx` — cover-превью.
- `src/app/(tabs)/_layout.tsx` — иконки (уже было) + плавающий glass-таббар.
- `src/app/(tabs)/index.tsx`, `settings.tsx`, `camera.tsx` — отступы под капсулу, выбор тем, hold-to-peek.
- `src/features/camera/components/overlay-controls.tsx` — кнопка «Призрак 90%», подпись «Видимость призрака».
- `package.json` — новые зависимости.

### Созданы

- `src/theme/design-themes.ts` (+ `.test.ts`) — три оформления + resolver.
- `src/theme/material.ts` (+ `.test.ts`) — политика материала.
- `src/theme/tab-bar.ts` — размеры плавающей капсулы.
- `src/components/ui/adaptive-surface.tsx` (+ `.ios.tsx`) — material adapter.
- `src/features/settings/components/appearance-settings-card.tsx` — выбор оформления.
- `src/utils/ghost.ts` (+ `.test.ts`) — чистая логика призрака.

---

## 3. Зависимости (обоснование)

- `@expo/vector-icons` (Ionicons, MIT/Apache-2.0) — иконки вкладок и превью.
- `expo-glass-effect` ~57.0.3 — native Liquid Glass на iOS 26+.
- `expo-blur` ~57.0.3 — frosted-fallback для Liquid Glass.

Никакого нового трекинга, сетевого слоя, IAP или незапрошенного SDK upgrade.

---

## 4. Допущения (подтверждены владельцем)

- «90%» = видимость старого снимка 90% → `opacity: 0.9`.
- Жест — **hold-to-peek** (удержание → 90%, отпускание → обычный режим), НЕ tap-toggle
  (в ТЗ был конфликт между разделом 1 и 10.2; владелец выбрал раздел 10.2).
- Точное нативное поведение UITabBar не воспроизводится: оставлен JS Tabs,
  оформленный через `tabBarStyle`/`tabBarBackground`.

---

## 5. Результаты автоматических проверок

| Проверка | Результат |
|----------|-----------|
| `npm run typecheck` | PASS (без ошибок) |
| `npm run lint` | PASS (без ошибок и предупреждений) |
| `npm test` | PASS — 88/88 (было 59; +29: resolver, normalize, material, ghost) |
| `npx expo-doctor` | PASS — 21/21 |
| `npx expo run:ios` (сборка) | PASS — Build Succeeded, 0 errors / 0 warnings |
| iOS запуск + рендер | PASS — без redbox, экран отрисовывается |

Новые unit-тесты покрывают: resolver трёх тем, полные палитры, радиусы,
нормализацию старых настроек (designTheme absent/unknown), гидратацию старой
записи, политику материала (fallback по платформе/Reduce Transparency),
логику видимости призрака (0.9, ghostEnabled=false, referenceReady=false).

---

## 6. Что НЕ проверено автоматически (честно)

- **Визуальное соответствие каждой темы** — модель не читает изображения;
  требуется ручной просмотр скриншотов владельцем.
- **Нативный Liquid Glass** — на симуляторе `isLiquidGlassAvailable()` может
  вернуть false; в этом случае корректно срабатывает fallback (blur/solid).
  Настоящее стекло проверяется только на iOS 26+ устройстве.
- **Жест hold-to-peek** — симулятор не даёт надёжно проверить удержание и
  реальную камеру; проверка на устройстве.
- **Android** — нет эмулятора в окружении; адаптивная иконка и материал
  (solid fallback) не собраны/не проверены.
- **Web** — не проверялся; вне iOS материал сводится к solid, без импорта
  iOS-only модулей в неподдерживаемый runtime.
- **Reduce Transparency / крупный шрифт / VoiceOver** — реализованы, но не
  проверены вручную.

Статусы платформ: iOS — частично (build+render PASS, визуал/жест BLOCKED),
Android — BLOCKED, web — NOT_RUN.

---

## 7. Что взято из референсов, а что — своя адаптация

- **Code with Beto (Liquid Glass tabs)** — идея плавающей капсулы и стеклянного
  материала. Мы НЕ ставили `react-native-bottom-tabs`: оставили JS Tabs и
  оформили через `tabBarStyle`/`tabBarBackground`. Материал — собственный
  `AdaptiveSurface` (GlassView → BlurView → solid).
- **Simon Grimm (Wolt)** — визуальные приёмы: фото-карточки, иерархия заголовка,
  скруглённые поверхности, бирюзовый акцент. Данные/механика Wolt (адреса,
  карты, корзина, рейтинги) НЕ переносились. HEX/размеры — собственные.
- Токены Галереи (светлый/тёмный) — из ТЗ, дополнены `border`/`danger`
  (разумные значения, контраст не аудитирован по WCAG для всех состояний).

---

## 8. Ограничения и известные проблемы

- Плавающая капсула перекрывает контент — отступы добавлены в списках и камере,
  но точная проверка на узких экранах/крупном шрифте — ручная.
- Полная логика readiness эталонного изображения (onLoad/onError, гонка
  смены проекта) реализована частично: `referenceReady = latestPhoto !== null`.
  Полное отслеживание загрузки — отдельное улучшение.
- Сброс hold-to-peek при фоновом AppState и blur-навигации реализован; остальные
  сбросы (смена эталона, ошибка камеры) — частично.

---

## 9. Откат

- Оформление возвращается через настройки («Оформление» → «Минимализм»), без
  очистки пользовательского хранилища.
- Для отката кода — отдельный revert после проверки совместимости данных:
  `normalizeSettings` гарантирует, что старые записи остаются валидными
  (`designTheme` при отсутствии → `minimalism`).
