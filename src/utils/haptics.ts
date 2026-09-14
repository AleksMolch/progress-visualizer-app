/**
 * Назначение: утилита тактильного отклика (haptics).
 *
 * Функции:
 * - triggerHaptic(type, enabled): вызывает нужный тип вибрации, если haptics
 *   включены; безопасно no-op на web/unsupported и при отключении.
 *
 * Слой: util (/src/utils). Единственное место, где импортируется expo-haptics —
 * экраны не вызывают Haptics напрямую.
 */

import * as Haptics from 'expo-haptics';

/** Типы тактильного события приложения. */
export type HapticEvent =
  | 'capture'
  | 'selection'
  | 'impact'
  | 'success'
  | 'warning';

/**
 * Вызывает тактильный отклик заданного типа.
 *
 * @param type — тип события.
 * @param enabled — включён ли haptics (берётся из settings.hapticsEnabled).
 */
export async function triggerHaptic(type: HapticEvent, enabled: boolean): Promise<void> {
  if (!enabled) {
    return;
  }

  try {
    switch (type) {
      case 'capture':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
      case 'impact':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
    }
  } catch {
    // Web/unsupported: тактильный отклик недоступен — игнорируем без падения.
  }
}
