/**
 * Назначение: политика выбора материала поверхности (стекло/blur/solid/elevated/neumorphic).
 *
 * Функции:
 * - resolveMaterial(): по запрошенному материалу и возможностям платформы
 *   возвращает фактический материал с безопасным fallback.
 *
 * Слой: theme (/src/theme). Чистая функция без React-зависимостей.
 * Ограничение: это намерение оформления; рендер выполняет AdaptiveSurface.
 */

/** Вид поверхности, который может запросить оформление. */
export type SurfaceKind =
  | 'solid'
  | 'frosted'
  | 'native-glass'
  | 'elevated'
  | 'neumorphic';

/** Запрошенный материал поверхности. */
export type RequestedMaterial = SurfaceKind;
/** Фактический материал после учёта платформы и accessibility. */
export type ResolvedMaterial = SurfaceKind;

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
 * - solid / elevated / neumorphic — чистые RN-поверхности, без нативного
 *   fallback (возвращаются как есть);
 * - frosted → BlurView только на iOS, иначе solid;
 * - native-glass → GlassView только на iOS при доступном Liquid Glass;
 *   иначе на iOS frosted, на остальных solid;
 * - Reduce Transparency → solid для прозрачных материалов (frosted/native-glass),
 *   но НЕ для уже непрозрачных elevated/neumorphic.
 */
export function resolveMaterial(
  requested: RequestedMaterial,
  capabilities: MaterialCapabilities,
): ResolvedMaterial {
  switch (requested) {
    case 'solid':
      return 'solid';
    case 'elevated':
    case 'neumorphic':
      return requested;
    case 'frosted':
      if (capabilities.reduceTransparency || !capabilities.isIos) {
        return 'solid';
      }
      return 'frosted';
    case 'native-glass':
      if (capabilities.reduceTransparency) {
        return 'solid';
      }
      if (
        capabilities.isIos &&
        capabilities.glassApiAvailable &&
        capabilities.liquidGlassAvailable
      ) {
        return 'native-glass';
      }
      return capabilities.isIos ? 'frosted' : 'solid';
  }
}
