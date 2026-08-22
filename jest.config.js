// Конфигурация Jest для проекта (пресет jest-expo, SDK 57).
// Маппинг alias `@/` на `src/` — как в tsconfig.json.
// transformIgnorePatterns расширен пакетами react-native-mmkv и
// react-native-nitro-modules (ESM-пакеты, требуют babel-трансформации).

module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|react-native-mmkv|react-native-nitro-modules))',
    '/node_modules/react-native-reanimated/plugin/',
    '/node_modules/@react-native/babel-preset/',
  ],
};
