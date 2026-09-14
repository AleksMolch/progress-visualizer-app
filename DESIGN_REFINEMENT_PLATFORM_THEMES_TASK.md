# Задание ИИ-разработчику: доработка дизайнов, platform defaults, свайпы между вкладками, кнопка снимка и haptics

Назначение файла: передать ИИ-разработчику в VS Code точные инструкции по улучшению уже работающего приложения `progress-visualizer-app` без пересоздания проекта и без изменения приватностной модели.

Репозиторий: https://github.com/AleksMolch/progress-visualizer-app.git

Важный контекст: приложение уже функционально. Не выполнять bootstrap, `create-expo-app`, reset-project и старые фазы первичной разработки. Задача — дизайн и UX-доработки поверх существующего кода.

---

## 1. Что видно по текущим скриншотам

На приложенных скриншотах видны текущие варианты оформления:

1. **Минимализм** — чистый белый интерфейс, крупные заголовки, простые карточки, синий акцент.
2. **Liquid Glass** — выбранный стиль уже есть в настройках, но пока выглядит ближе к слегка прозрачному/размытому tabbar и светлым карточкам. Требуется усилить ощущение стекла: плавающий bar, полупрозрачные поверхности, мягкие границы, blur/fallback, меньше ощущения обычного прямоугольного контейнера.
3. **Галерея** — выглядит лучше как Wolt-inspired направление: светлый фон, крупнее карточки, бирюзовый акцент. Но в этой итерации пользователь просит добавить Material Design и Neumorphism, а не развивать Галерею как обязательный дефолт.
4. **Projects screen** — карточки проектов уже стали визуальными, но чёрные пустые обложки выглядят грубо. Для тем с визуальными карточками надо сделать аккуратную заглушку/градиент/иконку, если фото нет или фото не загрузилось.

### 1.1. Уточнение по эталонным Liquid Glass скриншотам 5 и 6

Пользователь дополнительно прислал два эталонных изображения Liquid Glass. Они уточняют цель лучше, чем текущий экран приложения.

**Что видно на эталоне:**

1. Нижнее меню — это НЕ широкая панель на всю ширину экрана. Это **компактная плавающая капсула** примерно по центру нижней части экрана.
2. Капсула расположена **поверх контента**: на одном примере поверх фотографии, на другом поверх светлой карточки/фона.
3. У капсулы сильное скругление, мягкая стеклянная граница, blur/refraction и лёгкая тень.
4. Внутри капсулы есть **активный сегмент-пилюля**. Активная вкладка выглядит как отдельная более плотная стеклянная/светлая область внутри общего стекла.
5. В тёмном примере общий tabbar тёмно-дымчатый, активный сегмент чуть светлее, активная иконка/текст — синие. Неактивная иконка — белая/светло-серая.
6. В светлом примере общий tabbar светло-молочный и прозрачный, активный сегмент почти белый, неактивный текст серый.
7. Фон под tabbar заметно просвечивает и размывается. При этом подписи вкладок остаются читаемыми.
8. У меню только две вкладки на эталоне, но наше приложение сохраняет три: Проекты / Камера / Настройки. Нужно адаптировать эстетику, а не копировать количество вкладок.

**Что нужно изменить относительно текущего Liquid Glass:**

- Убрать ощущение широкой прямоугольной нижней панели.
- Сделать tabbar визуально компактнее: плавающий остров/капсула с горизонтальными полями, не full-width.
- Высота ориентировочно 64–72 pt, ширина — по содержимому или около 75–86% экрана, но не от края до края.
- Добавить внутренний активный сегмент с pill-radius, который двигается/переключается между вкладками.
- Визуально отделить внешний glass-container и внутреннюю active-pill.
- Контент должен проходить под tabbar; сам tabbar должен выглядеть как слой над контентом.
- На экране проектов последний элемент списка не должен перекрываться капсулой: добавить корректный нижний padding.

**Запрещено:**

- Просто подкрасить текущий tabbar полупрозрачным цветом и считать это Liquid Glass.
- Делать широкую full-width панель с большими боковыми «ушами», как на текущем скриншоте.
- Размывать пользовательские фото или ухудшать их читаемость ради эффекта.
- Ломать три вкладки приложения ради копирования двух вкладок из эталона.

Если локально требуется сохранить текущий `expo-router/js-tabs`, можно реализовать кастомный `tabBar`, который визуально имитирует эталонную капсулу, но использует тот же navigation state. Не менять тип навигатора без необходимости.

---

## 2. Итоговая матрица стилей

### 2.1. Общие стили для обеих платформ

Обе платформы должны иметь в настройках:

1. **Простой** (`simple` или существующий `minimalism`) — текущий минималистичный дизайн.
2. **Неоморфизм** (`neumorphism`) — новый общий стиль, вдохновлённый указанными видео.

Если в коде уже используется id `minimalism`, не ломай существующие сохранённые настройки. Можно оставить внутренний id `minimalism`, но в UI показывать название **«Простой»**. Не мигрируй id без необходимости.

### 2.2. Стиль по умолчанию для iOS

На iOS стиль по умолчанию для новых установок:

- **Liquid Glass** (`liquid-glass`).

В настройках iOS должны быть доступны минимум:

- Liquid Glass;
- Простой;
- Неоморфизм.

Material Design на iOS не обязателен. Если он уже реализован кроссплатформенно и его можно показать без ухудшения UX — можно оставить, но не делать его iOS-дефолтом.

### 2.3. Стиль по умолчанию для Android

На Android стиль по умолчанию для новых установок:

- **Material Design** (`material`).

В настройках Android должны быть доступны минимум:

- Material Design;
- Простой;
- Неоморфизм.

Liquid Glass на Android не должен притворяться настоящим iOS Liquid Glass. Если показывается как вариант, он должен иметь понятный fallback и описание «адаптированное стеклянное оформление». Но для текущей задачи лучше не делать Liquid Glass основным Android-вариантом.

### 2.4. Web / прочие платформы

Если web поддерживается локальным кодом:

- default: Простой;
- доступно: Простой, Неоморфизм;
- Material можно включить, если он уже реализован без native-зависимостей;
- Liquid Glass только как fallback, без обещания нативного эффекта.

---

## 3. Модель настроек и миграция

В настройках уже есть поле оформления или его нужно добавить. Требуемый контракт:

```ts
export type DesignThemeId =
  | 'minimalism'
  | 'liquid-glass'
  | 'gallery'
  | 'material'
  | 'neumorphism';
```

Если уже есть часть этих id — расширь существующий тип, не создавай второй параллельный.

### 3.1. Platform default

Не ставь один и тот же default для всех платформ.

Логика default для новых установок:

```ts
function getDefaultDesignThemeId(platform: PlatformOSType): DesignThemeId {
  if (platform === 'ios') return 'liquid-glass';
  if (platform === 'android') return 'material';
  return 'minimalism';
}
```

Важное: если у пользователя уже сохранён выбор темы, не перезаписывать его platform default при обновлении приложения.

### 3.2. Старые сохранённые настройки

Обязательно протестировать случаи:

1. В старом payload нет `designTheme` → подставляется platform default.
2. В старом payload есть `minimalism` → сохраняется и отображается как «Простой».
3. В payload неизвестное значение → platform default, не crash.
4. `themeMode`, `ghostOpacity`, `requireBiometrics`, `remindersEnabled` не теряются.
5. Если используется Zustand persist с вложенным объектом `settings`, нельзя поверхностным merge потерять новые поля.

---

## 4. Неоморфизм: источники, выводы и применение

### 4.1. Источники

Использовать идеи и кодовые подходы из видео:

1. https://www.youtube.com/watch?v=GFssmWUhwww
2. https://www.youtube.com/watch?v=VPwsKUwZPao

### 4.2. Что взять из первого видео

Первое видео показывает более технически сильный подход к Neumorphism через `@shopify/react-native-skia` и `BoxShadow`:

- raised-состояние: светлая тень сверху-слева + тёмная снизу-справа;
- pressed/inset-состояние: внутренние тени;
- мягкая поверхность, почти совпадающая с фоном;
- отдельные shadow tokens для light/dark;
- идея универсального `NeumorphicSurface` / `NeuBox`.

Важно: не добавлять `@shopify/react-native-skia` автоматически без оценки цены. Если текущий проект уже не использует Skia, сначала реализуй облегчённый вариант на стандартных RN-тенях и elevation. Если Android-качество будет неприемлемым, зафиксируй в `DECISIONS.md` вариант с Skia и запроси подтверждение владельца.

### 4.3. Что взять из второго видео

Второе видео показывает более простой React Native подход через вложенные `View`:

- цвет фона: мягкий серо-голубой (`#DEE9FD` как reference, не обязательно точный);
- поверхность почти совпадает с фоном;
- верхняя светлая тень (`#FFFFFF`);
- нижняя синевато-серая тень (`#B7C4DD`);
- вложенные контейнеры для имитации двух теней;
- круглые кнопки, карточки, слайдеры и переключатели.

Этот подход использовать как P0-реализацию, потому что он не требует новой тяжёлой зависимости.

### 4.4. Где применять Neumorphism

Применять:

- экран настроек;
- карточки выбора оформления;
- карточки проектов без агрессивных фото-эффектов;
- кнопки «Создать», «Переименовать», «Поддержать разработчика»;
- chips времени напоминаний;
- переключатели и небольшие панели.

Не применять или применять крайне осторожно:

- поверх живой камеры;
- поверх фотографии в fullscreen;
- в compare slider, где важна точность сравнения;
- для destructive-действий так, чтобы красная опасность стала менее заметной;
- в местах с мелким текстом и низким контрастом.

### 4.5. Neumorphism tokens

Добавить в систему тем неоморфные токены:

```ts
interface NeumorphismTokens {
  background: string;
  surface: string;
  surfacePressed: string;
  text: string;
  textSecondary: string;
  accent: string;
  accentText: string;
  border: string;
  shadowLight: string;
  shadowDark: string;
  raisedShadow: {
    lightOffset: { width: number; height: number };
    darkOffset: { width: number; height: number };
    radius: number;
    opacity: number;
  };
  pressedShadow: {
    lightOffset: { width: number; height: number };
    darkOffset: { width: number; height: number };
    radius: number;
    opacity: number;
  };
}
```

Для светлой темы можно вдохновиться палитрой второго видео:

- background `#DEE9FD` или более нейтральный `#EAF0FA`;
- surface `#E6EEF9`;
- shadowLight `#FFFFFF`;
- shadowDark `#B7C4DD`;
- text `#2E3440`;
- textSecondary `#6C7A93`;
- accent `#7B9BFF`.

Для тёмной темы:

- background `#18191D`;
- surface `#1E1F24`;
- shadowLight `#2A2C34`;
- shadowDark `#0D0E11`;
- text `#E1E4EB`;
- textSecondary `#8B93A6`;
- accent `#7B9BFF`.

Перед финализацией проверить контраст текста. Неоморфизм часто визуально красивый, но доступность плохая.

### 4.6. NeuSurface компонент

Создать один компонент-обёртку, например:

- `src/components/ui/neu-surface.tsx`

Он должен поддерживать:

- `variant: 'raised' | 'pressed' | 'flat'`;
- `radius`;
- `style`;
- `children`;
- disabled/pressed через Pressable wrapper там, где нужно.

Не размазывать shadow-логику по каждому экрану.

---

## 5. Material Design: выбранный reference и применение

### 5.1. Выбранный источник кода

Для реализации Material Design не добавлять React Native Paper автоматически. Но использовать как code/reference модель:

- React Native Paper MD3 theming: https://callstack.github.io/react-native-paper/docs/guides/theming/
- Material Design 3: https://m3.material.io/

Если нужен видео-reference, использовать официальный/практический поиск по Material 3 и React Native Paper:

- YouTube search: `React Native Paper Material Design 3 Expo`
- YouTube search: `Material Design 3 mobile app components Android Developers`

Причина выбора: Material Design лучше реализовывать не как «копию видео», а как систему токенов и компонентов. React Native Paper даёт полезную структуру MD3 color roles, cards, buttons, chips, switches. Но внедрение всей библиотеки в уже существующую UI-систему создаст лишнюю зависимость и риск переписывания приложения. Поэтому в этой задаче — реализовать Material-like слой на существующих `AppCard`, `AppButton`, `AppText`, tabbar и settings controls.

Если владелец позже захочет настоящие Paper-компоненты — это отдельная задача.

### 5.2. Material Design как Android default

На Android новый пользователь по умолчанию видит Material Design.

Визуальные признаки:

- фон `surface` / `background` в стиле Material 3;
- карточки с мягким elevation;
- активный tab как pill/indicator в navigation bar;
- tonal buttons;
- chips для выбора времени/проекта/режима;
- понятные pressed/ripple-like состояния;
- shape system: 12 / 16 / 24 radius;
- достаточный контраст и крупные touch targets.

### 5.3. Material tokens

Предложение для светлой темы:

```ts
const materialLight = {
  background: '#FFFBFE',
  surface: '#FFFBFE',
  surfaceVariant: '#E7E0EC',
  surfaceContainer: '#F3EDF7',
  text: '#1D1B20',
  textSecondary: '#49454F',
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005D',
  outline: '#79747E',
  danger: '#B3261E',
};
```

Предложение для тёмной темы:

```ts
const materialDark = {
  background: '#141218',
  surface: '#141218',
  surfaceVariant: '#49454F',
  surfaceContainer: '#211F26',
  text: '#E6E0E9',
  textSecondary: '#CAC4D0',
  primary: '#D0BCFF',
  primaryContainer: '#4F378B',
  onPrimary: '#381E72',
  onPrimaryContainer: '#EADDFF',
  outline: '#938F99',
  danger: '#F2B8B5',
};
```

Можно заменить primary на брендовый синий/бирюзовый, если это уже принято в проекте, но сохранить Material-роли.

### 5.4. Где применять Material

- Android tabbar: navigation bar с активным pill-индикатором.
- Settings: Material cards / switches / segmented buttons.
- Projects: cards с elevation и clear hierarchy.
- Project screen: floating action button с плюсом.
- Camera: controls должны оставаться минимальными, но Material chips допустимы.

---

## 6. Liquid Glass: уточнение для iOS default

Liquid Glass — стиль по умолчанию только на iOS.

### 6.1. Цель улучшения по скриншотам

Сейчас Liquid Glass выглядит недостаточно «стеклянным». Надо усилить:

- floating bottom bar как отдельная капсула;
- меньше ощущения full-width прямоугольника;
- больше depth: blur/transparent layer + border + shadow;
- карточки оформления и проектов с semi-transparent surface;
- мягкие highlights, но без потери читаемости;
- таббар не должен закрывать последний контент.

### 6.2. Ограничения

- Настоящий `expo-glass-effect` доступен только на поддерживаемой iOS.
- На Android не обещать настоящий Liquid Glass.
- Если используются `expo-blur` / `expo-glass-effect`, установить только через `npx expo install` и проверить `expo-doctor`.
- Не менять навигационный тип всего приложения ради дизайна.
- Не использовать opacity fade на родителях GlassView, если документация предупреждает о проблемах.

### 6.3. Компонент AdaptiveSurface

Создать или доработать единый компонент:

- `src/components/ui/adaptive-surface.tsx`

Он должен выбирать материал:

- simple → обычный View;
- liquid-glass → GlassView/BlurView/fallback;
- material → View + elevation/shadow;
- neumorphism → NeuSurface;
- gallery → обычная фото-карточка/soft surface.

Не делать условие `if theme === ...` в каждом экране.

---

## 7. Настройки оформления

Экран настроек должен показывать только релевантные варианты для платформы.

### iOS

Порядок:

1. Liquid Glass — по умолчанию.
2. Простой.
3. Неоморфизм.
4. Галерея — если уже реализована и не удаляется.
5. Material — опционально, если уже есть и не ломает UX.

### Android

Порядок:

1. Material Design — по умолчанию.
2. Простой.
3. Неоморфизм.
4. Галерея — если уже реализована.
5. Liquid Glass — лучше скрыть или показать как адаптированный fallback, но не дефолт.

### UI карточки выбора

Каждая карточка должна иметь:

- название;
- короткое описание;
- мини-превью из искусственных блоков, не из пользовательских фото;
- selected indicator;
- accessibilityLabel и accessibilityState selected;
- haptic selection при выборе, если haptics включены.

---

## 8. Жест смахивания основных окон

Требование пользователя: добавить жест смахивания между основными окнами приложения.

Под «основными окнами» понимать вкладки:

1. Проекты;
2. Камера;
3. Настройки.

### 8.1. Поведение

- Swipe left/right переключает вкладки в порядке:
  - Проекты → Камера → Настройки;
  - Настройки → Камера → Проекты.
- На первой вкладке свайп вправо ничего не делает.
- На последней вкладке свайп влево ничего не делает.
- Использовать `router.replace(...)` или navigation API так, чтобы не плодить историю переходов.
- При успешном переключении дать лёгкий haptic feedback, если включён.

### 8.2. Ограничения конфликтов

Не должен срабатывать:

- при горизонтальном скролле project selector на камере;
- при перетаскивании opacity slider;
- при before/after compare slider;
- при fullscreen gallery swipe;
- при системном back gesture;
- при нажатии на кнопки, chips, tabbar;
- внутри stack-экранов проекта/viewer/compare/timelapse, если это ломает локальные жесты.

### 8.3. Реализация

Предпочтительно создать отдельную обёртку:

- `src/features/navigation/components/main-tab-swipe-gesture.tsx`

или небольшой hook:

- `src/features/navigation/hooks/use-main-tab-swipe.ts`

Использовать `react-native-gesture-handler` modern API:

```ts
const gesture = Gesture.Pan()
  .activeOffsetX([-60, 60])
  .failOffsetY([-20, 20])
  .onEnd((event) => {
    // определить направление и перейти на соседнюю вкладку
  });
```

Точные пороги проверить на устройстве. Не ставить слишком низкий threshold, иначе пользователь будет случайно менять вкладки.

### 8.4. Документация

В README_staff описать:

- где находится логика свайпа;
- как добавить новую вкладку в порядок;
- какие области исключены из жеста;
- как отключить жест, если появятся конфликты.

---

## 9. Кнопка нового снимка в окне проекта

Требование: добавить кнопку «плюс в круге» в окне проекта. Нажатие переводит в камеру с автоматическим выбором текущего проекта.

### 9.1. Где

Экран:

- `src/app/project/[id]/index.tsx`

Добавить Floating Action Button в правом нижнем углу над tabbar/safe area.

### 9.2. Поведение

При нажатии:

1. Установить `activeProjectId` в `useAppStore` равным id текущего проекта.
2. Перейти на вкладку Камера.
3. Камера должна открыться уже с выбранным проектом.
4. Если проект удалён или не найден — не переходить, показать безопасное состояние.
5. Дать haptic impact light/medium, если включён.

Пример логики:

```ts
const setActiveProjectId = useAppStore((s) => s.setActiveProjectId);

const handleAddPhoto = () => {
  if (!project) return;
  setActiveProjectId(project.id);
  router.push('/camera'); // проверить фактический route в Expo Router
};
```

Путь проверить в реальном проекте. Не угадывать, если typed routes ругаются.

### 9.3. Визуал

- Simple: синяя круглая кнопка `+`.
- Liquid Glass: стеклянная круглая кнопка с blur/границей.
- Material: FloatingActionButton в стиле Material 3.
- Neumorphism: круглая raised-кнопка с pressed-состоянием.

Размер: примерно 56–64 dp/pt.

Accessibility:

- `accessibilityRole="button"`;
- `accessibilityLabel="Сделать новый снимок в этом проекте"`;
- `accessibilityHint="Откроет камеру и выберет текущий проект"`.

---

## 10. Тактильный отклик

Добавить `expo-haptics`:

```bash
npx expo install expo-haptics
npx expo-doctor
```

Если пакет уже есть — не переустанавливать.

### 10.1. Настройка

В `AppSettings` добавить:

```ts
hapticsEnabled: boolean;
```

Default: `true`.

Добавить переключатель в Settings:

- Заголовок: «Тактильный отклик»;
- Описание: «Лёгкая вибрация при съёмке и важных действиях».

Если устройство не поддерживает haptics — gracefully no-op.

### 10.2. Утилита

Создать:

- `src/utils/haptics.ts`

или

- `src/features/settings/utils/haptics.ts`

Лучше общий utils:

```ts
export async function triggerHaptic(type: HapticEvent): Promise<void> {
  // читает settings.hapticsEnabled или принимает enabled параметром
  // безопасно no-op на web/unsupported
}
```

Не дублировать `import * as Haptics` по всем экранам без причины.

### 10.3. Где добавить haptics

Обязательно:

1. **Съёмка в камере** — medium impact при нажатии затвора или success notification после успешного сохранения. Не делать сильную вибрацию при каждом промежуточном состоянии.

Рекомендуется:

2. Выбор дизайна в настройках — selection feedback.
3. Переключение вкладок свайпом — selection feedback.
4. Включение/выключение призрака, сетки, быстрого режима 90% — light impact.
5. Удаление фото/проекта после подтверждения — warning notification.
6. Нажатие FAB «новый снимок» — light/medium impact.
7. Успешный экспорт в галерею — success notification.

Не добавлять haptic на каждый scroll, каждый render и каждое движение slider. Slider может дать haptic только при завершении или при значимых шагах, но лучше не трогать в этой задаче.

### 10.4. Тесты

- При `hapticsEnabled=false` утилита не вызывает expo-haptics.
- При `true` вызывает правильный метод для capture/theme/success/warning.
- Web/unsupported не падает.

---

## 11. Камера и режим призрака 90%

Если режим 90% уже реализован по предыдущему заданию — не переписывать, только проверить совместимость со стилями, haptics и жестами вкладок.

Если не реализован:

- тап по свободной области камеры переключает временную видимость призрака `opacity: 0.9`;
- повторный тап возвращает обычный режим;
- UI-контролы не должны запускать этот жест;
- добавить явную кнопку/чип «Призрак 90%» в controls для доступности;
- временное состояние не сохраняется в MMKV;
- при съёмке, смене проекта, уходе с камеры — сбросить режим;
- сделать light haptic при включении/выключении, если включено.

Не смешивать этот жест со свайпом вкладок: tap и horizontal pan должны иметь разные recognizers и пороги.

---

## 12. Улучшения карточек проектов

Сейчас на скриншоте Projects видны чёрные блоки обложек. Это выглядит как ошибка, если фото нет или не загрузилось.

Требуется:

1. Если у проекта есть фото — показывать latest photo как cover.
2. Если фото нет или URI не загрузился — показывать theme-specific placeholder:
   - Simple: светлая заглушка с иконкой изображения;
   - Liquid Glass: мягкий стеклянный/градиентный placeholder;
   - Material: surfaceVariant + image icon;
   - Neumorphism: raised soft block с иконкой;
   - Gallery: аккуратный gradient/image placeholder.
3. Не показывать просто чёрный прямоугольник.
4. Не создавать новые файлы миниатюр на диске в этой задаче.
5. Не менять модель Project ради coverPhotoId; вычислять cover из существующих photos через `getLatestPhoto`.

---

## 13. Файлы, которые вероятно надо изменить

Проверь локальные имена перед изменением. По текущему репозиторию вероятные пути:

- `src/models/settings.ts`
- `src/store/settingsStore.ts`
- `src/store/settingsStore.test.ts`
- `src/theme/index.ts`
- `src/theme/ThemeProvider.tsx`
- `src/app/(tabs)/_layout.tsx`
- `src/app/(tabs)/settings.tsx`
- `src/app/(tabs)/camera.tsx`
- `src/app/(tabs)/index.tsx`
- `src/app/project/[id]/index.tsx`
- `src/components/ui/app-card.tsx`
- `src/components/ui/app-button.tsx`
- `src/components/ui/app-screen.tsx`
- `src/features/projects/components/project-list-item.tsx`
- `src/features/camera/components/overlay-controls.tsx`
- `src/features/camera/components/ghost-overlay.tsx`
- `src/utils/haptics.ts` (new)
- `src/components/ui/neu-surface.tsx` (new)
- `src/components/ui/adaptive-surface.tsx` (new or existing)
- `README.md`
- `README_staff.md`
- `MAINTENANCE_AI.md`
- `DECISIONS.md`
- `PROGRESS.md`

Не обязательно создавать все новые файлы. Если можно сделать проще без ухудшения архитектуры — делай проще.

---

## 14. Тесты

### 14.1. Unit tests

Обязательно добавить/обновить тесты:

1. platform default:
   - iOS → liquid-glass;
   - Android → material;
   - web/unknown → minimalism.
2. old settings без designTheme → platform default, остальные поля сохраняются.
3. explicit user designTheme сохраняется и не заменяется platform default.
4. `hapticsEnabled` default true.
5. haptics util не вызывает native API при disabled.
6. haptics util вызывает нужный тип при enabled.
7. Project FAB устанавливает activeProjectId перед переходом — если логика вынесена в тестируемую функцию/hook.
8. Placeholder cover выбирается при отсутствии фото/ошибке URI — если есть чистая функция.

### 14.2. Component/manual tests

Проверить вручную:

- iOS fresh install: default Liquid Glass.
- Android fresh install: default Material.
- Старый пользователь с выбранным Минимализмом остаётся в Простом.
- Обе платформы имеют Простой и Неоморфизм.
- Настройка haptics отключает вибрацию.
- Съёмка вызывает haptic только когда включено.
- FAB в проекте открывает камеру и выбирает правильный проект.
- Свайп между вкладками работает и не конфликтует со slider/compare/gallery.
- Нет чёрных пустых cover-блоков.
- Liquid Glass tabbar не перекрывает последний элемент списка.
- Material tabbar/карточки выглядят Android-friendly.
- Neumorphism сохраняет читаемость текста.

---

## 15. Команды проверки

Перед изменениями зафиксировать baseline:

```bash
git status
npm run typecheck
npm run lint
npm test -- --runInBand --ci
npx expo-doctor
```

После изменений:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand --ci
npx expo-doctor
npm run ios
npm run android
```

Если iOS/Android недоступны в окружении, отметить как BLOCKED, а не PASS.

---

## 16. Документация

Обновить на русском:

### README.md

- Описать стили: Liquid Glass, Material Design, Простой, Неоморфизм.
- Указать defaults: iOS — Liquid Glass, Android — Material.
- Описать свайпы между основными окнами.
- Описать кнопку «+» в проекте.
- Описать тактильный отклик и возможность отключения.

### README_staff.md

- Описать модель `designTheme`, platform default и миграцию.
- Описать haptics util и точки вызова.
- Описать gesture navigation и его ограничения.
- Описать Neumorphism implementation и ограничения контраста.
- Описать Material theme без обязательной зависимости React Native Paper.

### MAINTENANCE_AI.md

- Как добавлять новый стиль.
- Как не ломать platform defaults.
- Как не конфликтовать с camera gestures.
- Как проверять haptics.

### DECISIONS.md

Добавить решения:

1. iOS default Liquid Glass, Android default Material.
2. Neumorphism общий, но не доминирует над фото/камерой.
3. Material реализуется через текущую UI-систему, без внедрения React Native Paper в этой задаче.
4. Haptics opt-out через настройки.
5. Swipe между вкладками через Gesture Handler с исключениями конфликтных зон.

---

## 17. Definition of Done

Задача готова только если:

- [ ] На iOS fresh install default Liquid Glass.
- [ ] На Android fresh install default Material Design.
- [ ] На обеих платформах доступны Простой и Неоморфизм.
- [ ] Старые сохранённые настройки не теряются.
- [ ] Liquid Glass заметно отличается от минимализма и имеет корректный fallback.
- [ ] Material выглядит как Android-friendly Material 3, а не просто перекрашенный минимализм.
- [ ] Neumorphism имеет raised/pressed/inset элементы и не ломает читаемость.
- [ ] В проекте есть круглая кнопка «+», открывающая камеру с выбранным проектом.
- [ ] Swipe между основными окнами работает и не конфликтует с важными жестами.
- [ ] Haptics есть при съёмке и отключается в настройках.
- [ ] Нет чёрных пустых cover-заглушек.
- [ ] Typecheck/lint/tests/expo-doctor выполнены.
- [ ] iOS/Android запуск выполнен или явно BLOCKED.
- [ ] README.md, README_staff.md, MAINTENANCE_AI.md, DECISIONS.md обновлены.
- [ ] Нет новых сетевых запросов, аналитики, рекламы или изменения приватности.

---

## 18. Стартовая команда для ИИ в VS Code

Скопировать агенту:

```text
Прочитай DESIGN_REFINEMENT_PLATFORM_THEMES_TASK.md, AGENTS.md/CLAUDE.md, DECISIONS.md, README_staff.md и текущие файлы темы/настроек/камеры/табов.

Это уже готовое приложение. Не делай bootstrap, reset-project и не меняй архитектуру хранения.

Сначала:
1. проверь git status;
2. зафиксируй текущий HEAD;
3. запусти baseline проверки, если окружение позволяет;
4. покажи краткий план изменений и список файлов;
5. уточни, что platform defaults будут: iOS = Liquid Glass, Android = Material;
6. уточни, что Neumorphism и Простой доступны на обеих платформах;
7. не устанавливай новые зависимости без явного обоснования.

Затем реализуй задачу маленькими коммитами: настройки/темы → UI styles → haptics → swipe tabs → FAB в проекте → тесты → документация. Не отмечай готово без реальных проверок.
```
