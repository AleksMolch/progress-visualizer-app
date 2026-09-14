# Точечное задание: исправить Liquid Glass tabbar и карточки

Назначение: передать ИИ-разработчику точные инструкции по исправлению текущего Liquid Glass результата. Текущее состояние по скриншоту НЕ соответствует референсу: вместо compact floating capsule получился обычный full-width tabbar.

Репозиторий: https://github.com/AleksMolch/progress-visualizer-app.git

---

## 1. Диагноз по текущему скриншоту

На текущем результате видно:

1. Нижнее меню осталось стандартным full-width tabbar.
2. Tabbar приклеен к нижней границе экрана, а не плавает поверх контента.
3. Нет компактной стеклянной капсулы по центру.
4. Нет внутреннего активного сегмента-пилюли.
5. Нет эффекта glass/refraction/blur, похожего на референс.
6. Иконки и подписи выглядят как обычная системная навигация.
7. Контент не проходит визуально под стеклянной панелью.
8. Карточки проектов всё ещё имеют чёрные прямоугольники-заглушки, что ломает премиальный вид.

Главная ошибка: разработчик, вероятно, стилизовал стандартный `Tabs` через `tabBarStyle`, но не сделал кастомный floating tabbar.

---

## 2. Цель исправления

Liquid Glass должен выглядеть как на эталонных изображениях пользователя:

- маленькая плавающая капсула внизу по центру;
- ширина примерно 58–68% экрана, НЕ 100%;
- сильное скругление `borderRadius: 999`;
- материал: blur / glass / semi-transparent fallback;
- внутри активная вкладка — отдельная светлая/молочная pill-плашка;
- активная иконка и текст — синие;
- неактивные вкладки — серые/белые, без тяжёлого фона;
- панель находится поверх контента, но не перекрывает последний элемент списка;
- внешняя зона вокруг капсулы не должна блокировать жесты экрана.

---

## 3. Что нужно сделать технически

### 3.1. Не пытаться исправить это только `tabBarStyle`

Обычный `tabBarStyle` почти наверняка не даст нужный результат, потому что стандартный tabbar остаётся full-width контейнером.

Нужно сделать кастомный tabbar component для `expo-router/js-tabs` / React Navigation tabbar API.

Примерный файл:

```text
src/features/navigation/components/liquid-glass-tab-bar.tsx
```

Этот компонент должен получать props стандартного tabbar:

```ts
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
```

Если тип недоступен напрямую из текущего стека, использовать фактические типы из installed packages или вывести тип из props. Не ставить новую библиотеку ради типа.

---

## 4. Структура компонента LiquidGlassTabBar

Псевдоструктура:

```tsx
export function LiquidGlassTabBar(props: BottomTabBarProps) {
  const { state, descriptors, navigation } = props;
  const { colors, designTheme } = useAppTheme();

  if (designTheme !== 'liquid-glass') {
    return <DefaultLikeTabBar {...props} />; // или не использовать компонент вне liquid-glass
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <AdaptiveGlassSurface style={styles.capsule}>
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={() => handlePress(route, index)}
                onLongPress={() => handleLongPress(route)}
                style={[styles.tabItem, focused && styles.tabItemActive]}>
                {focused ? <View style={styles.activePill} /> : null}
                <Icon />
                {focused ? <Text>...</Text> : null}
              </Pressable>
            );
          })}
        </View>
      </AdaptiveGlassSurface>
    </View>
  );
}
```

Важно: сохранить стандартное поведение:

```ts
const event = navigation.emit({
  type: 'tabPress',
  target: route.key,
  canPreventDefault: true,
});

if (!focused && !event.defaultPrevented) {
  navigation.navigate(route.name, route.params);
}
```

Не использовать `router.push` для каждого tab press, чтобы не плодить историю.

---

## 5. Геометрия tabbar

Использовать ориентиры:

```ts
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  capsule: {
    width: '64%',
    maxWidth: 340,
    minWidth: 250,
    height: 68,
    borderRadius: 999,
    marginBottom: 12,
    overflow: 'hidden',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  tabItem: {
    height: 52,
    minWidth: 52,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  tabItemActive: {
    minWidth: 112,
  },
});
```

Для трёх вкладок возможно, что 64% будет тесно. Тогда:

- активная вкладка показывает иконку + текст;
- неактивные — только иконку;
- использовать короткие подписи: `Проекты`, `Камера`, `Опции` или оставить существующие, если помещаются.

Не возвращаться к full-width.

---

## 6. Материал glass surface

Создать или исправить:

```text
src/components/ui/adaptive-glass-surface.tsx
```

Поведение:

### iOS + доступен native glass

Использовать `expo-glass-effect`, если пакет установлен и API доступен:

- `GlassView`;
- проверка `isGlassEffectAPIAvailable()`;
- проверка `isLiquidGlassAvailable()`;
- учёт `AccessibilityInfo.isReduceTransparencyEnabled()`.

Если пакет не установлен — НЕ ломать сборку. Либо установить через `npx expo install expo-glass-effect`, либо использовать fallback на `expo-blur`. Установка новой зависимости требует `expo-doctor`.

### Fallback через blur

Если `expo-blur` установлен:

```tsx
<BlurView
  intensity={70}
  tint={scheme === 'dark' ? 'dark' : 'light'}
  style={StyleSheet.absoluteFill}
/>
```

Если `expo-blur` не установлен, не ставить его молча без проверки. Можно временно использовать semi-transparent View.

### Solid fallback

```ts
backgroundColor:
  scheme === 'dark'
    ? 'rgba(28,28,30,0.72)'
    : 'rgba(255,255,255,0.72)'
```

Добавить:

- borderWidth: 1;
- borderColor: light `rgba(255,255,255,0.55)`, dark `rgba(255,255,255,0.18)`;
- shadowColor: `#000`;
- shadowOpacity: 0.18;
- shadowRadius: 18;
- shadowOffset: `{ width: 0, height: 8 }`;
- elevation: 8 для Android fallback.

---

## 7. Активный сегмент

Активный tab должен выглядеть как внутренняя pill-плашка, а не просто синяя иконка.

Ориентир:

```ts
activePill: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: 999,
  backgroundColor: scheme === 'dark'
    ? 'rgba(70,70,74,0.62)'
    : 'rgba(255,255,255,0.68)',
  borderWidth: 1,
  borderColor: scheme === 'dark'
    ? 'rgba(255,255,255,0.14)'
    : 'rgba(255,255,255,0.75)',
}
```

Активный текст/иконка:

- `#208AEF` или текущий primary;
- label visible.

Неактивный:

- icon only или icon + маленький label, если помещается;
- color dark: `rgba(255,255,255,0.72)`;
- color light: `rgba(80,80,86,0.74)`.

---

## 8. Подключение в `_layout.tsx`

В `src/app/(tabs)/_layout.tsx`:

- прочитать `designTheme` из `useAppTheme()`;
- если `designTheme === 'liquid-glass'`, передать кастомный tabbar;
- для остальных тем оставить текущую или themed-версию.

Примерно:

```tsx
<Tabs
  tabBar={designTheme === 'liquid-glass' ? (props) => <LiquidGlassTabBar {...props} /> : undefined}
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
  }}
>
```

Если `expo-router/js-tabs` не поддерживает prop `tabBar` в этой форме в текущей версии, проверить installed typings и документацию. Не угадывать. Возможные варианты:

1. использовать supported `tabBar` API;
2. использовать `tabBarBackground` + extreme style только если реально получается capsule;
3. как последний вариант — скрыть стандартный tabbar и отрисовать собственный overlay на tab layout, сохранив navigation state.

---

## 9. Контент и отступы

После floating tabbar обязательно:

1. В списках добавить нижний padding минимум `tabbarHeight + safeAreaBottom + 24`.
2. На Projects screen последний проект должен полностью прокручиваться выше капсулы.
3. В Camera screen shutter/controls не должны попасть под капсулу.
4. В Project screen FAB `+` не должен конфликтовать с tabbar.
5. Tabbar overlay должен иметь `pointerEvents="box-none"`, а сама capsule — перехватывать касания.

---

## 10. Исправить чёрные cover-заглушки

На скриншоте крупные чёрные прямоугольники в карточках проектов выглядят как сломанные изображения.

Для Liquid Glass темы сделать placeholder:

- мягкий серо-голубой / молочный gradient-like фон;
- иконка изображения или камеры по центру;
- можно добавить текст `Нет фото` маленьким caption;
- без чистого чёрного прямоугольника.

Если градиентной библиотеки нет — не ставить новую только ради этого. Использовать обычный View с backgroundColor и icon.

Пример:

```tsx
<View style={styles.coverPlaceholder}>
  <Ionicons name="images-outline" size={40} color="rgba(32,138,239,0.45)" />
  <AppText variant="caption" color="textSecondary">Нет фото</AppText>
</View>
```

Для карточек с фото сохранить `expo-image` и обработать `onError`, чтобы fallback заменял чёрный блок.

---

## 11. Проверки

### Visual acceptance

Liquid Glass считается исправленным только если:

- [ ] tabbar больше НЕ full-width;
- [ ] tabbar — компактная floating capsule по центру;
- [ ] активный tab — внутренняя pill-плашка;
- [ ] видно отличие от обычного blur/white panel;
- [ ] контент визуально проходит под tabbar;
- [ ] иконки и текст читаемы на светлом и тёмном фоне;
- [ ] последний элемент списка не перекрыт;
- [ ] нажатие за пределами capsule не нажимает tabbar;
- [ ] tap по tabbar не включает призрак 90% в камере;
- [ ] чёрные cover placeholders заменены.

### Команды

```bash
npm run typecheck
npm run lint
npm test -- --runInBand --ci
npx expo-doctor
npm run ios
```

Если iOS 26 / native Liquid Glass недоступны — проверить fallback и честно написать `native glass not verified`.

---

## 12. Запреты

- Не менять default Android на Liquid Glass.
- Не добавлять `react-native-bottom-tabs`, пока не доказано, что кастомный tabbar невозможен.
- Не ломать существующий swipe между вкладками.
- Не делать tabbar full-width ради простоты.
- Не оборачивать весь экран в BlurView.
- Не размывать пользовательские фото в карточках.
- Не делать active segment просто синим текстом без внутренней pill-поверхности.
- Не заявлять «готово», пока визуально не сравнишь с эталоном.

---

## 13. Краткая команда агенту

```text
Исправь только Liquid Glass по LIQUID_GLASS_FIX_TASK.md. Текущий результат неверный: tabbar full-width, а должен быть compact floating glass capsule с внутренней active pill. Не меняй бизнес-логику и не перестраивай навигацию без необходимости. Сначала проверь, поддерживает ли текущий expo-router/js-tabs кастомный tabBar. Затем реализуй LiquidGlassTabBar, AdaptiveGlassSurface/fallback, корректные bottom insets и замени чёрные cover placeholders. После этого запусти typecheck/lint/tests/expo-doctor и iOS preview, если доступен.
```
