/**
 * Назначение: стартовый онбординг (4 шага, показывается до первого входа).
 *
 * Функции:
 * - показывает 4 шага с иконкой, заголовком и описанием;
 * - «Пропустить» доступен на любом шаге, «Далее»/«Начать» — переход/завершение;
 * - завершение пишет hasCompletedOnboarding в settingsStore (MMKV);
 * - навигацию после завершения выполняет Stack.Protected в корневом layout.
 *
 * Слой: UI (/src/app). Тексты — через useI18n, состояние — useSettingsStore.
 */

import { useState } from 'react';

import { AppScreen } from '@/components/ui/app-screen';
import {
  OnboardingScreen,
  type OnboardingIconName,
} from '@/features/onboarding/components/onboarding-screen';
import { useI18n, type MessageKey } from '@/i18n';
import { useSettingsStore } from '@/store/settingsStore';

// Шаги онбординга: ключи переводов и иконки Ionicons.
const ONBOARDING_STEPS: {
  title: MessageKey;
  description: MessageKey;
  icon: OnboardingIconName;
}[] = [
  {
    title: 'onboarding.progressTitle',
    description: 'onboarding.progressDesc',
    icon: 'camera-outline',
  },
  {
    title: 'onboarding.ghostTitle',
    description: 'onboarding.ghostDesc',
    icon: 'copy-outline',
  },
  {
    title: 'onboarding.compareTitle',
    description: 'onboarding.compareDesc',
    icon: 'git-compare-outline',
  },
  {
    title: 'onboarding.timelapseTitle',
    description: 'onboarding.timelapseDesc',
    icon: 'play-circle-outline',
  },
];

export default function OnboardingRoute() {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  // Завершение онбординга (кнопка «Начать» или «Пропустить»).
  const finishOnboarding = () => updateSettings({ hasCompletedOnboarding: true });

  // Переход к следующему шагу; на последнем — завершение.
  const handleNext = () => {
    if (currentStep >= ONBOARDING_STEPS.length - 1) {
      finishOnboarding();
      return;
    }
    setCurrentStep((step) => step + 1);
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <AppScreen edges={['top', 'bottom', 'left', 'right']}>
      <OnboardingScreen
        title={t(step.title)}
        description={t(step.description)}
        icon={step.icon}
        currentStep={currentStep}
        totalSteps={ONBOARDING_STEPS.length}
        isLast={currentStep === ONBOARDING_STEPS.length - 1}
        onNext={handleNext}
        onSkip={finishOnboarding}
      />
    </AppScreen>
  );
}
