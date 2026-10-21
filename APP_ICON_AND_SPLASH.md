# APP_ICON_AND_SPLASH — иконка, adaptive icon и анимированный splash

> Статус: реализовано 2026-10-20 по `AI_CODER_ANIMATED_SPLASH_FOCUS_PULL.md` и
> `AI_CODER_PREPRODUCTION_READINESS.md` (задача 3). Ниже — фактическое состояние,
> а не первоначальный план.

---

## 1. Источник и генерация ассетов

Исходник: `assets/brand/logo-source.png` (растровый логотип: диафрагма с белыми
лепестками и одним синим `#208AEF` на тёмной подложке).

Генератор: `scripts/generate-brand-assets.py` (Python 3 + Pillow, вне бандла).
Он:

- разделяет знак на слои по цвету и восстанавливает alpha из смеси с тёмным фоном;
- отсекает кант скруглённой подложки исходника;
- масштабирует слои с premultiplied alpha (без тёмных ореолов);
- собирает все ассеты.

Запуск:

```bash
python3 -m pip install pillow numpy
python3 scripts/generate-brand-assets.py
```

## 2. Splash-ассет

```text
assets/images/splash-icon.png — полный оригинальный знак (белые лепестки +
                               синий акцент), 1024, прозрачный фон
```

Один и тот же файл используется нативным splash и JS-оверлеем: знак рисуется
160 dp. Никаких слоёв, белых версий, бликов и размытия.

## 3. Иконки

```text
assets/images/icon.png                       — opaque #0B0D12, знак ~74%
assets/images/android-icon-foreground.png    — прозрачный, знак в центральных ~66%
assets/images/android-icon-background.png    — сплошной #0B0D12 (1024×1024)
assets/images/android-icon-monochrome.png    — белый силуэт для Android 13+
assets/images/splash-icon.png                — полный знак (1024×1024, прозрачный)
```

`icon.png`, `android-icon-*` и `splash-icon.png` генерируются тем же скриптом из полного знака; splash использует `splash-icon.png` (оригинальные цвета, с синим лепестком).

## 4. app.json

```jsonc
{
  "icon": "./assets/images/icon.png",
  "ios": {
    "icon": "./assets/images/icon.png",
    "bundleIdentifier": "ru.nov.molcha.progressvisualizer",
    "buildNumber": "1"
  },
  "android": {
    "package": "ru.nov.molcha.progressvisualizer",
    "versionCode": 5,
    "adaptiveIcon": {
      "backgroundColor": "#0B0D12",
      "foregroundImage": "./assets/images/android-icon-foreground.png",
      "monochromeImage": "./assets/images/android-icon-monochrome.png"
    },
    "blockedPermissions": [
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.USE_FINGERPRINT"
    ]
  },
  "plugins": [
    [
      "expo-splash-screen",
      {
        "backgroundColor": "#0B0D12",
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 160,
        "dark": {
          "backgroundColor": "#0B0D12",
          "image": "./assets/images/splash-icon.png"
        }
      }
    ]
  ]
}
```

## 5. Мягкий splash

- Нативный splash: тёмный `#0B0D12`, знак 160 dp, `splash-icon.png` — тот же
  оригинальный логотип с синим лепестком, что и иконка приложения.
- JS-оверлей: `src/features/splash/components/soft-splash-overlay.tsx` — тот же
  фон, PNG, размер и центр; первый кадр строго `opacity: 1`, `scale: 1`.
- Пока хранилище не готово — спокойное дыхание `scale 1 ↔ 1.018`, цикл ~1.8 с,
  `Easing.inOut(Easing.quad)`, без пульсации яркости.
- После готовности: `1 → 1.025` (220 мс) → `1` (220 мс), затем fade-out 200 мс;
  всего ~640 мс. `onFinish` вызывается ровно один раз.
- Reduced Motion: без движения, оверлей скрывается сразу после готовности.
- Жизненный цикл: `onLayout` оверлея → `SplashScreen.hideAsync()` →
  `nativeSplashHidden` → старт анимации. `hideAsync()` защищён ref-guard.
- Никаких слоёв, вращения, blur, glow и новых ассетов.

## 6. Проверка результата

- `npx expo prebuild --platform ios --clean` + `npx expo run:ios` (или EAS) —
  обязательна native-пересборка после изменения app.json/иконок/splash.
- Холодный запуск: нет белой вспышки, знак по центру, первый кадр совпадает.
- Проверить на Android: иконка в круглой/квадратной маске, monochrome (Android 13+),
  adaptive foreground не обрезается.
- iPad/планшет: знак того же физического размера, по центру.
- Reduced Motion и медленная инициализация — ручная проверка (см. TESTING.md).
