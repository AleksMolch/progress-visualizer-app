// Тесты утилиты тактильного отклика.
// Проверяем, что при disabled haptics не вызывается, а при enabled — нужный тип.

import * as Haptics from 'expo-haptics';

import { triggerHaptic } from './haptics';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('triggerHaptic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('не вызывает haptics при enabled=false', async () => {
    await triggerHaptic('capture', false);
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });

  it('capture вызывает impactAsync Medium', async () => {
    await triggerHaptic('capture', true);
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('selection вызывает selectionAsync', async () => {
    await triggerHaptic('selection', true);
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it('success вызывает notificationAsync Success', async () => {
    await triggerHaptic('success', true);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('warning вызывает notificationAsync Warning', async () => {
    await triggerHaptic('warning', true);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('не падает, если нативное API бросает (web/unsupported)', async () => {
    (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('unsupported'));
    await expect(triggerHaptic('capture', true)).resolves.toBeUndefined();
  });
});
