/**
 * Назначение: компактный переключатель языка (кнопка + dropdown).
 *
 * Функции:
 * - кнопка: иконка Globe, короткий код языка (RU/EN/KZ…), стрелка вниз;
 * - dropdown с нативным названием, коротким кодом и check-иконкой у активного;
 * - переключение меняет settings.language (источник истины i18n) реактивно,
 *   без смены маршрута и query-параметров; выбор персистится (MMKV).
 *
 * Слой: UI (/src/features/settings/components). Варианты оформления: clean/glass/minimal.
 * Доступность: aria-label через accessibilityLabel, focus/hover состояния, клавиатура.
 */

import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { useI18n } from '@/i18n';
import { LANGUAGE_NAMES, LANGUAGE_SHORT, LOCALES } from '@/i18n/locale';
import { type AppLanguage } from '@/models/settings';
import { useSettingsStore } from '@/store/settingsStore';
import { radii } from '@/theme';
import { useAppTheme } from '@/theme/ThemeProvider';
import { triggerHaptic } from '@/utils/haptics';

/** Варианты оформления. */
export type LanguageSwitcherVariant = 'clean' | 'glass' | 'minimal';

// Геометрия dropdown.
const MENU_WIDTH = 232;
const MENU_ITEM_HEIGHT = 46;
const MENU_PADDING = 8;
const MENU_MARGIN = 8;

interface LanguageSwitcherProps {
  /** Вариант оформления (для быстрого переключения под контекст). */
  variant?: LanguageSwitcherVariant;
}

export function LanguageSwitcher({ variant = 'clean' }: LanguageSwitcherProps) {
  const { colors, scheme } = useAppTheme();
  const { t } = useI18n();
  const language = useSettingsStore((s) => s.settings.language);
  const hapticsEnabled = useSettingsStore((s) => s.settings.hapticsEnabled);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const buttonRef = useRef<View>(null);

  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const isDark = scheme === 'dark';

  // Тинт фона активного/наведения для каждого варианта.
  const hoverBackground =
    variant === 'glass'
      ? 'rgba(255,255,255,0.12)'
      : variant === 'minimal'
        ? 'rgba(128,128,128,0.12)'
        : 'rgba(128,128,128,0.10)';
  // Активный пункт — лёгкий тинт акцентного цвета (12% альфа).
  const activeBackground = `${colors.primary}1F`;

  const openMenu = () => {
    buttonRef.current?.measureInWindow((x, y, _w, h) => {
      const menuHeight = LOCALES.length * MENU_ITEM_HEIGHT + MENU_PADDING * 2 + 12;
      // Если не хватает места снизу — раскрываем вверх.
      const top =
        y + h + 6 + menuHeight > windowHeight ? y - menuHeight - 6 : y + h + 6;
      const left = Math.max(MENU_MARGIN, Math.min(x, windowWidth - MENU_WIDTH - MENU_MARGIN));
      setAnchor({ top, left });
      setOpen(true);
    });
  };

  const closeMenu = () => setOpen(false);

  const handleSelect = (lang: AppLanguage) => {
    updateSettings({ language: lang });
    void triggerHaptic('selection', hapticsEnabled);
    closeMenu();
  };

  // Стиль кнопки по варианту.
  const triggerStyle: ViewStyle = (() => {
    if (variant === 'minimal') {
      return {
        backgroundColor: hovered || focused ? hoverBackground : 'transparent',
      };
    }
    if (variant === 'glass') {
      return {
        backgroundColor: hovered || focused ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)',
        borderColor: 'rgba(255,255,255,0.18)',
      };
    }
    return {
      backgroundColor: hovered || focused ? hoverBackground : colors.surface,
      borderColor: colors.border,
    };
  })();

  // Стиль dropdown-карточки по варианту.
  const menuStyle: ViewStyle = (() => {
    if (variant === 'glass') {
      return {
        backgroundColor: isDark ? 'rgba(24,26,30,0.92)' : 'rgba(255,255,255,0.94)',
        borderColor: 'rgba(255,255,255,0.16)',
      };
    }
    return {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    };
  })();

  return (
    <View>
      <Pressable
        ref={buttonRef}
        onPress={openMenu}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityRole="button"
        accessibilityLabel={t('language.change')}
        accessibilityState={{ expanded: open }}
        style={[
          styles.trigger,
          variant !== 'minimal' && styles.triggerBordered,
          triggerStyle,
          focused && styles.triggerFocused,
        ]}>
        <Ionicons name="globe-outline" size={16} color={colors.text} />
        <AppText variant="caption" color="text" style={styles.triggerCode}>
          {LANGUAGE_SHORT[language]}
        </AppText>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textSecondary}
        />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeMenu}>
        <View style={styles.modalRoot}>
          {/* Затемнение/клик вне меню закрывает dropdown. */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeMenu}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
          />
          {anchor ? (
            <View
              style={[
                styles.menu,
                menuStyle,
                { top: Math.max(anchor.top, 8), left: anchor.left },
              ]}>
              {LOCALES.map((lang) => {
                const selected = lang === language;
                return (
                  <Pressable
                    key={lang}
                    onPress={() => handleSelect(lang)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    accessibilityLabel={LANGUAGE_NAMES[lang]}
                    style={({ pressed }) => [
                      styles.item,
                      selected && { backgroundColor: activeBackground },
                      pressed && { opacity: 0.7 },
                    ]}>
                    <AppText variant="body" color="text" style={styles.itemName}>
                      {LANGUAGE_NAMES[lang]}
                    </AppText>
                    <AppText variant="caption" color="textSecondary" style={styles.itemCode}>
                      {LANGUAGE_SHORT[lang]}
                    </AppText>
                    <View style={styles.itemCheck}>
                      {selected ? (
                        <Ionicons name="checkmark" size={16} color={colors.primary} />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 40,
    minWidth: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  triggerBordered: {
    borderWidth: 1,
  },
  triggerFocused: {
    // Видимый focus state (кольцо) — через границу-тень на web.
    boxShadow: [{ offsetX: 0, offsetY: 0, color: 'rgba(32,138,239,0.45)', blurRadius: 4 }],
  },
  triggerCode: {
    fontWeight: '600',
  },
  modalRoot: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    width: MENU_WIDTH,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: MENU_PADDING,
    boxShadow: [{ offsetX: 0, offsetY: 8, color: 'rgba(0,0,0,0.18)', blurRadius: 24 }],
    elevation: 12,
  },
  item: {
    height: MENU_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
  },
  itemName: {
    flex: 1,
  },
  itemCode: {
    minWidth: 24,
    textAlign: 'right',
  },
  itemCheck: {
    width: 20,
    alignItems: 'center',
  },
});
