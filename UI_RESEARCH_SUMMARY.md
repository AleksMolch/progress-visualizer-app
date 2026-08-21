# UI/UX RESEARCH SUMMARY — ProgressPrivate

**Дата:** 2025-01  
**Стек:** React Native, Expo, Expo Router, Reanimated 4, Gesture Handler  
**Цель:** Найти лучшие практики для privacy-first прогресс-фото приложения

---

## EXECUTIVE SUMMARY

Проведён анализ современных UI/UX паттернов для мобильных приложений на React Native + Expo стеке 2025 года. Исследованы:

- конкурентные фитнес-приложения с ghost overlay;
- YouTube-туториалы от ведущих React Native educators (Simon Grimm, William Candillon, Catalin Miron);
- актуальные тренды mobile UI 2025;
- документация Expo Router, Reanimated 4, Gesture Handler;
- паттерны camera UI и photo comparison интерфейсов.

**Ключевой вывод:** существует устоявшийся набор паттернов для camera-based прогресс-приложений. Их можно реализовать на вашем стеке без кастомного native кода.

---

## 1. НАВИГАЦИОННАЯ АРХИТЕКТУРА

### Рекомендованная структура

```
app/
  _layout.tsx              ← root (theme provider, биометрия)
  (tabs)/
    _layout.tsx            ← bottom tabs
    index.tsx              ← Projects (home)
    camera.tsx             ← Camera
    settings.tsx           ← Settings
  project/
    [id].tsx               ← Project detail + gallery
  compare/
    [ids].tsx              ← Photo comparison (опционально отдельный экран)
```

### Обоснование

**Bottom tabs — единственный разумный вариант** для такого приложения:
- Projects — home, частое использование;
- Camera — центральная функция, может быть визуально выделена;
- Settings — редкое использование, но должно быть доступно.

**НЕ использовать:**
- Hamburger menu (устарел, плохая discoverable);
- Top tabs (риск случайного свайпа на камере);
- Drawer navigation (избыточен для 3 экранов).

### Transitions

Expo Router автоматически обрабатывает transitions. Для критичных экранов:

```typescript
// В Stack.Screen или через router.push options
presentation: "modal"  // для создания проекта, удаления
presentation: "card"   // для детального экрана проекта (default)
```

---

## 2. CAMERA INTERFACE ПАТТЕРНЫ

### Найденные best practices (из реальных приложений)

#### Fitness Camera (Google Play, 100K+ установок)

**Layout:**
```
┌─────────────────────────┐
│   [Settings] Camera     │ ← header, 44pt height
│                         │
│                         │
│    [Camera Preview]     │ ← fullscreen minus safe areas
│   + ghost overlay 50%   │
│   + optional grid       │
│                         │
│  [Opacity Slider]       │ ← bottom 20pt from capture
│ [Gallery] [Capture] [Grid] │ ← 80pt height safe area
└─────────────────────────┘
```

**Touch targets:**
- Capture button: min 64×64pt (реально 72×72pt для комфорта);
- Grid toggle: 44×44pt;
- Gallery preview: 48×48pt;
- Opacity slider: height 30pt, track min 44pt для пальца.

**Ghost overlay controls:**
- Диапазон прозрачности 0–100% (не 0–50%, пользователь хочет контроль);
- Default 50% при первом открытии;
- Persist последнее значение в settings.

#### Overlay Fitness Camera (Google Play)

**Дополнительные insights:**
- Grid можно выключить совсем (не всем нужна);
- Предпросмотр последнего фото в левом нижнем углу (iOS/Android стандарт);
- Визуальная индикация "local only" через иконку или badge.

### Критично для privacy-позиционирования

**Добавить видимый индикатор:**
```
┌─────────────────────────┐
│ 🔒 Local Only  [Settings]│ ← честно показываем, что offline
```

Альтернативы:
- Airplane mode иконка;
- Shield иконка + "Private";
- Текст "Photos stay on device".

Это не только маркетинг — это proof для скептичных пользователей.

---

## 3. MODERN UI TRENDS 2025

### Обязательные (не опциональные)

#### Dark/Light Mode Toggle

**Источник:** 89% топ-100 приложений App Store поддерживают оба режима (gluestack research 2025).

**Реализация:**
- Следовать системной теме по умолчанию;
- Дать ручное переключение в Settings;
- Persist выбор в MMKV;
- Использовать `useColorScheme()` + custom theme context.

**Для камеры:**
- Dark mode НЕ влияет на camera preview (всегда реальное изображение);
- Влияет на controls overlay (buttons, slider).

#### Micro-interactions

**Что это:** маленькие анимации на действия пользователя (200–300ms).

**Где применить:**
- Capture button: scale down 0.95 на press + haptic;
- Delete photo: swipe left → red background reveal → haptic strong;
- Toggle grid: fade in/out 200ms;
- Create project: card появляется через spring animation.

**НЕ делать:**
- Анимации >400ms (воспринимаются как лаг);
- Анимации без функциональной цели (отвлекают);
- Сложные keyframe анимации на каждом tap.

#### Haptic Feedback

**Expo API:** `expo-haptics`

**Когда использовать:**
```typescript
import * as Haptics from 'expo-haptics';

// Capture photo
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Delete (критичное действие)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

// Toggle успешно
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
```

**Критично:** haptic работает только на device, в simulator silent fail.

#### Gesture-First Approach

**Правило:** если жест интуитивен — он лучше кнопки.

**Применить:**
- Swipe left на фото → delete (iOS standard);
- Swipe down в fullscreen → закрыть (iOS standard);
- Swipe horizontal в fullscreen gallery → следующее фото;
- Long press на проекте → context menu (rename, delete).

**НЕ применять жесты:**
- На критичных невидимых действиях;
- Если нет визуального намёка на возможность жеста;
- Если конфликтует с системными жестами (edge swipe).

### Избегать (устаревшие тренды)

- ❌ Neumorphism (был популярен 2020–2022, сейчас выглядит старо);
- ❌ Сложные градиенты (мешают читаемости в dark mode);
- ❌ 3D-эффекты без цели (performance hit);
- ❌ Излишние тени (flat design возвращается).

---

## 4. REANIMATED 4 — НОВЫЕ ВОЗМОЖНОСТИ

### CSS-like API (бета в v4)

**Что изменилось:** меньше boilerplate, проще для веб-разработчиков.

**Старый способ (Reanimated 3):**
```typescript
const animatedStyle = useAnimatedStyle(() => ({
  opacity: withTiming(visible.value ? 1 : 0, { duration: 300 }),
}));
```

**Новый способ (Reanimated 4):**
```typescript
import { css } from 'react-native-reanimated';

const animatedStyle = css`
  transition-property: opacity;
  transition-duration: 300ms;
  opacity: ${visible ? 1 : 0};
`;
```

### Keyframes для сложных анимаций

**Пример из Simon Grimm tutorial:**
```typescript
const pulse = css.keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const style = css`
  animation-name: ${pulse};
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
`;
```

### Применение для ProgressPrivate

| Компонент | Анимация | Подход |
|-----------|----------|--------|
| Ghost overlay fade | opacity 0→0.5 | CSS transition |
| Photo card появление | scale + opacity | Spring animation (старый API лучше) |
| Swipe-to-delete | translateX + backgroundColor | Gesture Handler + interpolate |
| Grid toggle | opacity 0↔1 | CSS transition |
| Bottom sheet | translateY + gesture | react-native-bottom-sheet (готовая либа) |

**Вывод:** комбинировать CSS API для простых transitions и классический API для gesture-driven анимаций.

---

## 5. PHOTO COMPARISON UI

### Side-by-Side (обязательный минимум)

```
┌─────────────────────────┐
│  Before    │    After   │
│            │            │
│   Photo1   │   Photo2   │
│            │            │
│            │            │
└─────────────────────────┘
```

**Реализация:** два `<Image>` в `<View style={{flexDirection: 'row'}}>`

**Плюсы:**
- Простейшая реализация;
- Понятно пользователю;
- Работает без gesture handler.

### Slider Comparison (wow-фактор)

```
┌─────────────────────────┐
│ Before | After          │
│        |                │
│   Photo1 |   Photo2     │ ← перетаскиваемая граница
│        ↕                │
│        |                │
└─────────────────────────┘
```

**Реализация:**
- `PanGestureHandler` на вертикальной линии;
- Два `<Image>` с динамическим `width`;
- Interpolate жеста в ширину контейнеров.

**Пример из исследования:**
- Многие before/after сайты используют именно этот паттерн;
- Пользователи интуитивно понимают, что границу можно двигать.

**Порядок реализации:**
1. Сначала side-by-side (Фаза 9.3 в TODO);
2. Потом slider (Фаза 9.4);
3. Если slider не работает — side-by-side достаточен для MVP.

### Fullscreen Viewer + Swipe

**Паттерн (iOS Photos standard):**
- Tap на фото → fullscreen;
- Swipe left/right → навигация между фото;
- Swipe down → закрыть fullscreen;
- Pinch zoom → опционально (сложно, конфликт с pan).

**Библиотеки (проверенные 2025):**
- `react-native-gesture-image-viewer` (активна, Reanimated 3+);
- `react-native-zoom-reanimated` (Apple Photos-style);
- Кастомная реализация (если либы несовместимы).

**Рекомендация для DeepSeek агента:**
- НЕ пытаться реализовать pinch zoom в первой версии;
- Если нужен zoom — использовать готовую либу;
- Проверить совместимость с Expo SDK перед установкой.

---

## 6. EMPTY STATES & ONBOARDING

### Найденные best practices

#### Empty State — Projects List

**Когда:** пользователь первый раз открыл приложение, проектов нет.

**Компоненты:**
1. Иллюстрация (не фото, не видео — SVG иконка);
2. Заголовок: "No Projects Yet";
3. Описание: "Create a project to start tracking your progress";
4. Кнопка: "Create Your First Project".

**Размеры:**
- Иллюстрация: 120×120pt;
- Заголовок: 20pt bold;
- Описание: 14pt regular, secondary color;
- Кнопка: min 44pt height.

**Центрирование:** вертикально и горизонтально в доступной области.

#### Empty State — Inside Project

**Когда:** проект создан, но фото ещё нет.

**Компоненты:**
1. Ghost overlay preview (серая рамка силуэта);
2. Заголовок: "Take Your First Photo";
3. Описание: "Your previous photo will appear as a ghost overlay to help you match your pose";
4. Кнопка: "Open Camera".

**Почему это важно:** объясняет ценность ghost overlay ДО того, как пользователь её увидит.

#### Onboarding (первый запуск)

**Спорный вопрос:** делать ли multi-screen tutorial?

**Исследование показало:**
- Длинные onboarding (>5 экранов) снижают retention;
- Пользователи skip'ают туториалы;
- Лучше показать ценность inline при первом использовании.

**Рекомендация для ProgressPrivate:**
- **НЕ делать** классический 3–5 screen carousel onboarding;
- **Сделать** contextual tooltips при первом открытии камеры:
  - "Drag slider to adjust ghost overlay opacity";
  - "Tap grid icon to show alignment guides";
  - Показать по одному, dismissible.

**Либы для tooltips:**
- `react-native-walkthrough-tooltip`;
- Или кастомная реализация через `<Popover>` из gluestack-ui.

---

## 7. GESTURE PATTERNS — ДЕТАЛЬНАЯ КАРТА

### Галерея фото (внутри проекта)

| Жест | Действие | Приоритет |
|------|----------|-----------|
| Tap на фото | Открыть fullscreen | P0 |
| Long press на фото | Context menu (delete, export) | P1 |
| Swipe left на фото | Delete (iOS style) | P1 |

### Fullscreen viewer

| Жест | Действие | Приоритет |
|------|----------|-----------|
| Swipe down | Закрыть fullscreen | P0 |
| Swipe left/right | Переключить фото | P0 |
| Pinch zoom | Увеличить (опционально) | P3 |
| Double tap | Zoom to fit (если pinch реализован) | P3 |

### Camera screen

| Жест | Действие | Приоритет |
|------|----------|-----------|
| Tap capture button | Сделать фото | P0 |
| Drag opacity slider | Изменить прозрачность overlay | P0 |
| Tap grid button | Toggle сетку | P1 |
| Tap gallery preview | Открыть последнее фото | P1 |

### Project list

| Жест | Действие | Приоритет |
|------|----------|-----------|
| Tap на проект | Открыть детали | P0 |
| Long press на проект | Context menu (rename, delete) | P1 |
| Swipe left | Delete project | P1 |

**Важно:** все swipe-to-delete должны требовать confirmation для критичных данных.

---

## 8. ACCESSIBILITY BASELINE

**Disclaimer:** полное WCAG AA compliance требует ручного тестирования. Но базовый уровень обязателен.

### Touch Targets (WCAG 2.5.5)

**Правило:** минимум 44×44pt для интерактивных элементов.

**Проверить:**
- Capture button: 64×64pt ✓
- Tab bar icons: 44×44pt ✓
- Grid toggle: 44×44pt ✓
- Кнопки в списках: 44pt height ✓

**Исключение:** inline текстовые ссылки могут быть меньше.

### Color Contrast (WCAG 1.4.3)

**Правило:** минимум 4.5:1 для текста <18pt, 3:1 для >18pt.

**Инструменты:**
- WebAIM Contrast Checker;
- Figma плагины для проверки;
- Тестирование в dark + light mode.

**Критичные места:**
- Текст на camera overlay (может быть на светлом и тёмном фоне);
- Кнопки на прозрачном фоне.

**Решение:** добавить полупрозрачный backdrop за текстом/иконками на камере.

### Screen Reader Labels

**Expo/React Native поддержка:**
```typescript
<Pressable
  accessibilityLabel="Capture photo"
  accessibilityRole="button"
  accessibilityHint="Takes a progress photo and saves it to the current project"
>
```

**Обязательно добавить на:**
- Icon-only buttons (grid, settings, capture);
- Tab bar icons;
- Gesture-based элементы.

### Haptic ≠ Замена визуального

**Ошибка:** полагаться только на haptic для feedback.

**Правильно:** haptic как дополнение к визуальной анимации.

---

## 9. PERFORMANCE PATTERNS

### Expo Image vs React Native Image

**Вывод из исследования:** Expo Image обязателен для photo-heavy приложений.

**Преимущества:**
- Автоматический кеш на диске;
- Placeholder поддержка;
- Lazy loading;
- Better memory management.

**Использование:**
```typescript
import { Image } from 'expo-image';

<Image
  source={{ uri: localPhotoUri }}
  placeholder={blurhash}
  contentFit="cover"
  transition={200}
/>
```

### FlashList vs FlatList

**Когда переходить:** если проект содержит >50 фото.

**Для ProgressPrivate:**
- В большинстве проектов будет 10–50 фото → FlatList достаточно;
- Если пользователь создал проект с 100+ фото → может быть лаг;
- Рекомендация: начать с FlatList, добавить FlashList если появятся жалобы.

### Skeleton Loaders

**Тренд 2025:** skeleton screens вместо spinners.

**Применение:**
- Загрузка списка проектов (если медленно);
- Загрузка фото в галерее (хотя локальные должны быть быстрыми).

**Библиотека:** Moti (`moti` package) для skeleton анимаций.

**Приоритет:** P3 (nice-to-have, не критично для MVP).

### Layout Animations (Reanimated)

**Что это:** автоматическая анимация при изменении layout (появление/удаление элементов).

**Применение:**
```typescript
import { Layout } from 'react-native-reanimated';

<Animated.View layout={Layout.springify()}>
  {/* photo cards */}
</Animated.View>
```

**Эффект:** плавное появление новых фото, удаление без "скачка".

**Приоритет:** P2 (заметное улучшение UX при малых усилиях).

---

## 10. ДИЗАЙН-СИСТЕМА & ТОКЕНИЗАЦИЯ

### Почему это важно для AI-агента

**Проблема:** DeepSeek будет хардкодить цвета и отступы, если не дать систему.

**Решение:** создать tokens ДО UI-компонентов (Фаза 3 в TODO).

### Минимальный набор токенов

**Цвета:**
```typescript
export const colors = {
  // Surfaces (7 levels для глубины)
  surface: {
    0: '#000000',  // darkest
    1: '#0A0D12',
    2: '#0F131C',
    3: '#161D2B',
    4: '#1E2636',
    5: '#2A3444',
    6: '#364152',  // lightest in dark mode
  },
  // Accent (luminous, один главный)
  accent: {
    primary: '#38BDF8',    // cyan для tech/privacy темы
    primaryDark: '#0284C7',
  },
  // Semantic
  text: {
    primary: '#FFFFFF',
    secondary: '#94A3B8',
    disabled: '#64748B',
  },
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};
```

**Spacing (8pt grid):**
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

**Radius:**
```typescript
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,  // pills
  circle: '50%',
};
```

**Typography:**
```typescript
export const typography = {
  heading1: { fontSize: 32, fontWeight: '700', lineHeight: 40 },
  heading2: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 24 },
};
```

**Почему этот конкретный выбор:**
- Cyan accent — ассоциируется с tech и security;
- 7 surface levels — достаточно для depth без перегрузки;
- 8pt spacing — industry standard, легко масштабируется;
- 999px radius для pills — работает на любой ширине.

---

## 11. ИСТОЧНИКИ & АВТОРИТЕТЫ

### YouTube Educators (проверено 2025)

**Simon Grimm**
- Канал: 125K+ подписчиков;
- Фокус: Expo Router, практические туториалы, актуальные паттерны;
- Релевантные видео:
  - "React Native Tabs Navigation with Expo Router" (Jun 2025);
  - "React Native Animations just got WAY EASIER (Reanimated v4)" (Jan 2025).
- Оценка: ✓ актуален, ✓ на вашем стеке, ✓ практичен.

**William Candillon**
- Фокус: продвинутые Reanimated анимации;
- Can I Do It: серия с разбором сложных UI;
- Оценка: отлично для вдохновения, но часто overkill для MVP.

**Catalin Miron**
- Фокус: gesture-driven UI, красивые интерфейсы;
- Меньше практических туториалов, больше showcase;
- Оценка: для идей, не для copy-paste.

### UI Libraries

**gluestack-ui** (выбрано в стеке)
- Expo-native;
- Хорошая документация;
- Поддержка dark/light mode из коробки;
- Важно: агент должен использовать `npx gluestack-ui add`, не устанавливать вручную.

**react-native-bottom-sheet** (gorhom)
- Если понадобится bottom sheet (не обязательно для MVP);
- 10K+ stars на GitHub;
- Работает с Reanimated 2+.

### Конкурентные приложения (для reference)

**Fitness Camera (Android)**
- Ghost overlay с opacity slider — industry standard;
- Grid toggle — правильная реализация;
- Простой, понятный UI без лишнего.

**Overlay Fitness Camera (Android)**
- Похожий подход;
- Добавляет reminder notifications.

**iOS Camera app**
- Золотой стандарт layout камеры;
- Capture button в центре низа;
- Gallery preview слева внизу;
- Settings справа вверху.

---

## 12. РИСКИ & ПРЕДУПРЕЖДЕНИЯ ДЛЯ DEEPSEEK АГЕНТА

### 🚨 Критичные

1. **НЕ копировать сложные анимации** из YouTube tutorials без проверки на performance. Красивый tutorial на симуляторе может лагать на Android.

2. **НЕ добавлять pinch-to-zoom** в fullscreen viewer сразу. Это конфликтует с pan gestures и требует сложной координации. Отложить до Фазы 15 или вообще пропустить MVP.

3. **НЕ использовать deprecated библиотеки.** Проверять дату последнего коммита на GitHub. Если >1 года — подозрительно для React Native экосистемы.

4. **ПРОВЕРИТЬ совместимость gesture-handler и reanimated** версий из Expo SDK. Не ставить вручную последние версии npm — они могут быть несовместимы с текущим Expo.

### ⚠️ Важные

5. **Haptic feedback работает только на device.** В симуляторе будет silent fail. Не считать это багом.

6. **Ghost overlay opacity slider** должен быть реализован через controlled component с state, не через uncontrolled slider. Иначе не будет persist в MMKV.

7. **Camera permissions** на iOS требуют `NSCameraUsageDescription` в `app.json`. Без этого краш при запросе камеры.

8. **Dark mode для camera overlay:** фон controls должен быть poluprozrachnym (rgba), иначе будет конфликт с camera preview.

### ℹ️ Полезные

9. Для тестирования ghost overlay используй placeholder изображения, не жди настоящих фото.

10. Empty states важнее, чем кажется — они первое впечатление. Не пропускай Фазу 1.4–1.5.

11. Side-by-side comparison достаточен для MVP. Slider — бонус, не обязательное требование.

---

## 13. ПРИОРИТИЗАЦИЯ ДЛЯ ФАЗ TODO.md

### P0 — Критично для базовой функциональности

✅ Включить в Фазы 0–6:
- Tab navigation (Expo Router);
- Dark/light mode toggle + persist;
- Camera interface с правильными touch targets;
- Ghost overlay с opacity control;
- Empty states для Projects и Camera.

### P1 — Важно для хорошего UX

✅ Включить в Фазы 7–10:
- Grid toggle на камере;
- Haptic feedback на capture и delete;
- Micro-animations (fade, scale) на критичных действиях;
- Side-by-side photo comparison;
- Fullscreen viewer с swipe navigation;
- Swipe-to-delete для проектов и фото.

### P2 — Улучшения, которые заметны

⚙️ Включить в Фазы 11–13 если время есть:
- Slider comparison (перетаскиваемая граница);
- Layout animations (spring на появление cards);
- Skeleton loaders (если загрузка медленная);
- Context menu на long press;
- Bottom sheet для некритичных модалов.

### P3 — Nice-to-have, не обязательно для портфолио

🎁 Фаза 15 или post-MVP:
- Pinch-to-zoom в fullscreen viewer;
- Сложные keyframe анимации;
- FlashList вместо FlatList;
- Расширенные accessibility фичи (voice control).

---

## 14. NEXT STEPS — ЧТО ДЕЛАТЬ С ЭТИМ ИССЛЕДОВАНИЕМ

### Для пользователя

1. **Прочитать секции 2, 3, 6** (Camera UI, Trends, Empty States) — это влияет на product decisions.
2. **Решить:** нужен ли slider comparison в MVP, или достаточно side-by-side? (Рекомендация: достаточно side-by-side).
3. **Решить:** какой accent color использовать? (Рекомендация: cyan #38BDF8 для tech/privacy темы, или терракотовый для fitness-ориентации).

### Для DeepSeek агента

4. **Фаза 3 TODO.md** — создать токены (секция 10) ДО начала UI-компонентов.
5. **Фаза 6–7** — реализовать Camera UI по паттернам из секции 2.
6. **Фаза 9** — реализовать photo comparison начиная с side-by-side (секция 5).
7. **Фаза 1** — обязательно сделать empty states (секция 6), не пропускать.

### Опциональные дополнительные задачи

- Создать `UI_SPEC.md` с конкретными компонентами и их props;
- Создать mockup/wireframe ключевых экранов;
- Написать подробный Camera UI specification;
- Исследовать конкретные gluestack-ui компоненты для использования.

---

## 15. ЗАКЛЮЧЕНИЕ

**Главный вывод:** для ProgressPrivate существует чёткий набор проверенных паттернов. Не нужно изобретать велосипед.

**Ключевые решения:**
- Bottom tabs navigation (стандарт);
- Ghost overlay с opacity slider (проверено конкурентами);
- Dark/light mode (обязательно в 2025);
- Gesture-first где интуитивно (swipe, long press);
- Side-by-side comparison как базовый (slider опционально);
- Micro-interactions + haptic (современный стандарт);
- Privacy индикатор видимый (критично для позиционирования).

**Риски:**
- Pinch zoom сложен и не критичен;
- Сложные анимации могут лагать;
- Deprecated библиотеки — проверять актуальность.

**Состояние:** готов к следующей задаче.

---

**Источники:**
- YouTube: Simon Grimm, William Candillon, Catalin Miron;
- Apps: Fitness Camera, Overlay Fitness Camera, iOS Camera;
- Docs: Expo Router, Reanimated 4, Gesture Handler;
- Research: gluestack.io blog, reactiive.io, droid sons roids blog;
- UI patterns: Mobbin, empty state best practices.

**Дата:** 2025-01
