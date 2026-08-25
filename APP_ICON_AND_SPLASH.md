# APP_ICON_AND_SPLASH — план обновления иконки и splash-экрана

> Цель: заменить дефолтные Expo-ассеты на фирменные иконку и splash.
> Сейчас иконка и splash — дефолтные заглушки Expo (logo, react-logo).
> Splash-фон уже в фирменном цвете `#208AEF`.

---

## 1. Концепция метки (mark)

Простое, узнаваемое на малом размере: **апертура/диафрагма камеры, где кольцо
частично превращено в дугу прогресса** (символ «прогресс через фото»).

Цвета: фон `#208AEF` (фирменный), mark — белый.

Запасные концепции (если первая плохо отрисуется):
- две наложенные фоторамки «до/после» с вертикальным разрезом;
- фоторамка со стрелкой/полосой роста вверх.

---

## 2. Источники (бесплатные для коммерческого использования)

Если не хотите генерировать, а собрать из готовых иконок:

| Набор | Лицензия | Что это |
|-------|----------|---------|
| Material Symbols (Google) | Apache 2.0 | глифы (камера, диафрагма, прогресс) |
| Lucide | ISC | line-иконки |
| Heroicons (Tailwind) | MIT | line/solid иконки |
| Remix Icon | Apache 2.0 | глифы |
| Tabler Icons | MIT | line-иконки |
| Feather | MIT | line-иконки |
| unDraw | free (без атрибуции) | иллюстрации |

Для целостной иконки проще сгенерировать (см. раздел 3) — тогда ассет ваш,
без вопросов лицензирования готовых наборов.

---

## 3. Промпты для Nano Banana (Gemini image)

> Модели дают лучший результат на английском. Промпты ниже — готовые к вставке.

### 3.1 Основная иконка (opaque, 1024×1024)

```
Flat minimalist mobile app icon. The entire canvas is a solid deep blue color
(#208AEF), perfectly opaque, no rounded corners, no border. Centered large white
geometric mark: a camera aperture / iris symbol (a circle of overlapping rounded
blades) where the ring is partially drawn as a progress arc (about two-thirds
complete) ending in a small dot. Clean crisp vector style, subtle soft gradient
for depth, high contrast, no text, no letters, no drop shadow outside the mark.
The mark occupies about 60% of the canvas. 1024x1024, PNG.
```

### 3.2 Android adaptive foreground (прозрачный, mark по центру)

```
Minimal white camera-aperture-progress symbol on a fully transparent background.
Centered, with the mark occupying only the middle 60% of the canvas (leave safe
margins for Android adaptive icon cropping). Flat vector, crisp edges, no
background fill, no text, no letters. 1024x1024, transparent PNG.
```

### 3.3 Splash-логотип (прозрачный, маленький mark)

```
Minimal app logo mark: a white camera-aperture-progress symbol, flat vector, on
a fully transparent background, centered, simple and clean, no text. Designed to
look good at small sizes (about 200px wide). Transparent PNG.
```

### 3.4 Splash-фон (опционально, вместо flat-цвета)

```
Simple splash screen background: solid deep blue (#208AEF) with a very subtle
soft radial glow slightly brighter in the center, flat, no text, no logo, no
borders. 2732x2732.
```

---

## 4. Куда положить файлы и что поменять в app.json

1. `assets/images/icon.png` ← основная иконка (3.1), opaque 1024×1024.
2. `assets/images/android-icon-foreground.png` ← adaptive foreground (3.2),
   прозрачный, mark в средней зоне.
3. `assets/images/splash-icon.png` ← splash-логотип (3.3), прозрачный.

В `app.json`:

```jsonc
{
  "icon": "./assets/images/icon.png",        // уже так — файл просто заменяем
  "ios": {
    "icon": "./assets/images/icon.png",       // убрать "./assets/expo.icon"
    "bundleIdentifier": "com.anonymous.progress-visualizer-app"
  },
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#208AEF",           // цвет под adaptive-иконкой
      "foregroundImage": "./assets/images/android-icon-foreground.png"
      // "backgroundImage" и "monochromeImage" можно убрать
    }
  },
  "plugins": [
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#208AEF",
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200                      // подобрать размер mark
      }
    ]
  ]
}
```

---

## 5. Как сгенерировать все нужные размеры

Expo делает это автоматически при prebuild из одного исходного PNG:

```bash
export PATH="/opt/homebrew/bin:$PATH"
npx expo prebuild --platform ios   # генерирует AppIcon.appiconset (все размеры)
npx expo run:ios                    # собрать и проверить на симуляторе
```

- iOS: достаточно одного 1024×1024 PNG — prebuild нарежет все размеры.
- Android: adaptive icon собирается из `foregroundImage` + `backgroundColor`.

Важные требования:

- iOS-иконка должна быть **без прозрачности** (Apple режет скругление сам).
- Не использовать текст и брендовые знаки (Apple/Google отклоняют).
- Adaptive foreground — наоборот **с прозрачностью**, mark в центральных ~66%.

---

## 6. Проверка результата

- Собрать dev build и посмотреть иконку на домашнем экране симулятора.
- Splash — увидеть при холодном старте приложения.
- При необходимости прислать скриншоты в `screenshots/` для итерации.
