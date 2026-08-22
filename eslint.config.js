// Конфигурация ESLint для проекта (flat config, ESLint 9).
// Базовый набор правил — eslint-config-expo (SDK 57),
// eslint-config-prettier отключает правила, конфликтующие с Prettier.

const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    // Глобальные исключения: сборка, сгенерированные типы и нативные папки.
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts', 'ios/*', 'android/*'],
  },
]);
