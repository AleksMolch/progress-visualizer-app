#!/usr/bin/env python3
"""
Назначение: генерация брендовых ассетов из исходного логотипа.

Функции:
- разбирает растровый логотип (assets/brand/logo-source.png) на цвета и alpha;
- собирает полный знак (splash-icon) и иконки приложения;
- собирает иконки приложения (icon, adaptive foreground/background/monochrome)
  и splash-изображение;
- сохраняет всё в assets/images и assets/images/splash.

Слой: scripts (служебный инструмент, НЕ входит в бандл приложения).
Требование: Python 3 + Pillow (`python3 -m pip install pillow`).
Запуск: python3 scripts/generate-brand-assets.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "brand" / "logo-source.png"
IMAGES = ROOT / "assets" / "images"

# Фирменные цвета (по заданию).
WHITE = np.array([255, 255, 255], dtype=np.float32)
BLUE = np.array([32, 138, 239], dtype=np.float32)  # #208AEF
DARK = (11, 13, 18)  # #0B0D12
BG_SAMPLE = np.array([16, 17, 21], dtype=np.float32)  # фон исходного растрового логотипа


def unmix(pixels: np.ndarray, fg: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Восстанавливает alpha и residual для смеси «фон → цвет fg»."""
    direction = fg - BG_SAMPLE
    diff = pixels - BG_SAMPLE
    alpha = np.clip(diff @ direction / float(direction @ direction), 0.0, 1.0)
    residual = np.linalg.norm(diff - alpha[..., None] * direction, axis=-1)
    return alpha, residual


def build_layers() -> tuple[Image.Image, Image.Image]:
    """Возвращает слои (белые лепестки, синий лепесток) на общем холсте."""
    rgba = np.asarray(Image.open(SOURCE).convert("RGBA"), dtype=np.float32) / 255.0
    pixels = rgba[..., :3] * 255.0
    src_alpha = rgba[..., 3]

    alpha_w, residual_w = unmix(pixels, WHITE)
    alpha_b, residual_b = unmix(pixels, BLUE)

    # Пиксели с синим доминированием относим к акцентному лепестку,
    # остальные — к белым. Residual уточняет выбор на антиалиасинге.
    blue_dominant = (pixels[..., 2] - pixels[..., 0] > 35) & (pixels[..., 2] - pixels[..., 1] > 15)
    is_blue = blue_dominant | (residual_b + 6 < residual_w)

    alpha = np.where(is_blue, alpha_b, alpha_w)
    # Убираем шум тёмной подложки и учитываем исходную прозрачность.
    alpha = np.where(alpha < 0.05, 0.0, alpha) * src_alpha

    # Отсекаем светлый кант скруглённой подложки исходной картинки:
    # знак целиком лежит внутри радиуса ~0.425 от центра холста.
    h, w = alpha.shape
    yy, xx = np.mgrid[0:h, 0:w]
    canvas_cx, canvas_cy = (w - 1) / 2.0, (h - 1) / 2.0
    radius = np.hypot(xx - canvas_cx, yy - canvas_cy)
    alpha = np.where(radius <= min(w, h) * 0.425, alpha, 0.0)

    white_alpha = np.where(is_blue, 0.0, alpha)
    blue_alpha = np.where(is_blue, alpha, 0.0)

    # Квадратный кроп вокруг центра знака с небольшим полем.
    mask = alpha > 0.05
    ys, xs = np.where(mask)
    cx = (xs.min() + xs.max()) / 2.0
    cy = (ys.min() + ys.max()) / 2.0
    side = max(xs.max() - xs.min(), ys.max() - ys.min()) * 1.08
    left = int(round(cx - side / 2))
    top = int(round(cy - side / 2))
    size = int(round(side))

    def to_layer(alpha_channel: np.ndarray, color: np.ndarray) -> Image.Image:
        crop_alpha = alpha_channel[top : top + size, left : left + size]
        rgba_layer = np.zeros((size, size, 4), dtype=np.float32)
        rgba_layer[..., :3] = color / 255.0
        rgba_layer[..., 3] = crop_alpha
        return Image.fromarray((rgba_layer * 255).round().astype(np.uint8), "RGBA")

    return to_layer(white_alpha, WHITE), to_layer(blue_alpha, BLUE)


def resize_premultiplied(image: Image.Image, size: int) -> Image.Image:
    """Масштабирует RGBA без тёмных ореолов (через premultiplied alpha)."""
    data = np.asarray(image, dtype=np.float32) / 255.0
    alpha = data[..., 3:4]
    premultiplied = np.concatenate([data[..., :3] * alpha, alpha], axis=-1)
    source = Image.fromarray((premultiplied * 255).round().astype(np.uint8), "RGBA")
    scaled = np.asarray(source.resize((size, size), Image.LANCZOS), dtype=np.float32) / 255.0
    scaled_alpha = scaled[..., 3:4]
    rgb = np.divide(scaled[..., :3], np.maximum(scaled_alpha, 1e-6))
    result = np.concatenate([np.clip(rgb, 0.0, 1.0), scaled_alpha], axis=-1)
    return Image.fromarray((result * 255).round().astype(np.uint8), "RGBA")


def place_center(layer: Image.Image, canvas_size: int, fraction: float) -> Image.Image:
    """Вписывает квадратный слой в центр холста с заданной долей размера."""
    inner = int(round(canvas_size * fraction))
    scaled = resize_premultiplied(layer, inner)
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    offset = (canvas_size - inner) // 2
    canvas.alpha_composite(scaled, (offset, offset))
    return canvas


def solid(size: int, color: tuple[int, int, int]) -> Image.Image:
    return Image.new("RGBA", (size, size), (*color, 255))


def main() -> None:
    IMAGES.mkdir(parents=True, exist_ok=True)

    white_layer, blue_layer = build_layers()

    # Полный знак в исходных цветах (1024): splash-иконка и иконки приложения.
    full = Image.alpha_composite(
        resize_premultiplied(white_layer, 1024),
        resize_premultiplied(blue_layer, 1024),
    )

    # Иконка приложения: непрозрачный тёмный фон + знак (~74% холста).
    icon = solid(1024, DARK)
    icon.alpha_composite(place_center(full, 1024, 0.74))
    icon.convert("RGB").save(IMAGES / "icon.png")

    # Adaptive foreground: знак в центральных 66% холста.
    place_center(full, 1024, 0.66).save(IMAGES / "android-icon-foreground.png")

    # Монохромная тематическая иконка: белый силуэт знака в центральных 66%.
    silhouette = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    silhouette.putalpha(full.getchannel("A"))
    silhouette.paste((255, 255, 255, 255), (0, 0), full.getchannel("A"))
    place_center(silhouette, 1024, 0.66).save(IMAGES / "android-icon-monochrome.png")

    # Сплошной фон adaptive icon.
    solid(1024, DARK).convert("RGB").save(IMAGES / "android-icon-background.png")

    # Splash-изображение: тот же файл задаётся в app.json и импортируется
    # JS-оверлеем — первый кадр совпадает с нативным splash.
    full.save(IMAGES / "splash-icon.png")

    print("Готово: splash-icon (полный знак) и иконки приложения")


if __name__ == "__main__":
    main()
