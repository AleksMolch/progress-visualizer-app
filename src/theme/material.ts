/**
 * Назначение: политика выбора материала поверхности (стекло/blur/solid).
 *
 * Функции:
 * - resolveMaterial(): по запрошенному материалу и возможностям платформы
 *   возвращает фактический материал с безопасным fallback.
 *
 * Слой: theme (/src/theme). Чистая функция без React-зависимостей.
 * Ограничение: это намерение оформления; рендер выполняет AdaptiveSurface.
 */

/** Запрошенный материал поверхности. */
export type RequestedMaterial = 'solid' | 'frosted' | 'native-glass';

/** Фактический материал после учёта платформы и accessibility. */
export type ResolvedMaterial = RequestedMaterial;

/** Возможности текущей платформы для выбора материала. */
export interface MaterialCapabilities {
  /** iOS (нативный blur/glass доступен). */
  isIos: boolean;
  /** Доступен ли Liquid Glass API (iOS 26+, без багов беты). */
  glassApiAvailable: boolean;
  /** Доступен ли Liquid Glass дизайн на устройстве. */
  liquidGlassAvailable: boolean;
  /** Включён ли пользователем Reduce Transparency. */
  reduceTransparency: boolean;
}

/**
 * Определяет фактический материал с учётом платформы и accessibility.
 *
 * Правила:
 * - solid → solid всегда;
 * - Reduce Transparency → solid (непрозрачная поверхность, оформление сохраняется);
 * - frosted → BlurView только на iOS, на остальных платформах solid;
 * - native-glass → GlassView только на iOS при доступном Liquid Glass;
 *   иначе на iOS frosted, на остальных solid.
 */
export function resolveMaterial(
  requested: RequestedMaterial,
  capabilities: MaterialCapabilities,
): ResolvedMaterial {
  if (requested === 'solid' || capabilities.reduceTransparency) {
    return 'solid';
  }

  if (requested === 'frosted') {
    return capabilities.isIos ? 'frosted' : 'solid';
  }

  // native-glass
  if (capabilities.isIos && capabilities.glassApiAvailable && capabilities.liquidGlassAvailable) {
    return 'native-glass';
  }
  return capabilities.isIos ? 'frosted' : 'solid';
}
