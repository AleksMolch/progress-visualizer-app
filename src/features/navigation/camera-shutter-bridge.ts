/**
 * Назначение: мост между нижней панелью вкладок и экраном камеры.
 *
 * Функции:
 * - setShutterHandler(fn): экран камеры регистрирует обработчик съёмки;
 * - triggerShutter(): центральная кнопка панели вызывает съёмку, когда открыта камера.
 *
 * Слой: UI (/src/features/navigation). Лёгкий модульный реестр вместо проброса
 * колбэка через навигацию/пропсы (таббар и камера — в разных деревьях навигатора).
 * Не хранит состояние — только ссылку на текущий обработчик.
 */

type ShutterHandler = () => void;

// Текущий обработчик съёмки (null — камера не активна).
let shutterHandler: ShutterHandler | null = null;

/**
 * Регистрирует обработчик съёмки.
 * @param handler — функция съёмки или null для сброса.
 */
export function setShutterHandler(handler: ShutterHandler | null): void {
  shutterHandler = handler;
}

/** Вызывает зарегистрированный обработчик съёмки (если есть). */
export function triggerShutter(): void {
  shutterHandler?.();
}
