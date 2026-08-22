/**
 * Назначение: экран сравнения двух фото «до/после».
 *
 * Функции:
 * - показывает текущее фото проекта и предыдущее (если есть);
 * - два режима: перетаскиваемый разделитель и «рядом»;
 * - переключение режима кнопкой в шапке.
 *
 * Слой: UI (/src/app). Данные — useProjectStore, навигация — expo-router.
 */

import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/app-button';
import { AppText } from '@/components/ui/app-text';
import { CompareSideBySide } from '@/features/gallery/components/compare-side-by-side';
import { CompareSlider } from '@/features/gallery/components/compare-slider';
import { useProjectStore } from '@/store/projectStore';
import { useAppTheme } from '@/theme/ThemeProvider';
import { getPreviousPhoto } from '@/utils/photos';

// Режимы сравнения.
type CompareMode = 'slider' | 'side-by-side';

export default function CompareScreen() {
  const { id, photoId } = useLocalSearchParams<{ id: string; photoId: string }>();
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<CompareMode>('slider');

  const photos = useProjectStore((s) => s.photos);

  // Текущее фото — «после»; предыдущее — «до».
  const after = photos.find((p) => p.id === photoId);
  const before = getPreviousPhoto(photos, id, photoId);

  // Сравнение невозможно без текущего и предыдущего фото.
  if (!after || !before) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Сравнение' }} />
        <AppText variant="title">Нет фото для сравнения</AppText>
        <AppText color="textSecondary" style={styles.emptyText}>
          Сравнение доступно, когда в проекте есть хотя бы два фото.
        </AppText>
      </View>
    );
  }

  const toggleMode = () => {
    setMode((m) => (m === 'slider' ? 'side-by-side' : 'slider'));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Сравнение',
          headerRight: () => (
            <AppButton
              label={mode === 'slider' ? 'Рядом' : 'Разделитель'}
              variant="ghost"
              onPress={toggleMode}
            />
          ),
        }}
      />

      {mode === 'slider' ? (
        <CompareSlider beforeUri={before.uri} afterUri={after.uri} />
      ) : (
        <CompareSideBySide beforeUri={before.uri} afterUri={after.uri} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  emptyText: {
    textAlign: 'center',
  },
});
