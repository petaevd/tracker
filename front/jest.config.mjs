export default {
  testEnvironment: 'jsdom',  // Для тестирования в браузерной среде (нужно для React)
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',  // Для обработки файлов JSX и JS
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios)/',  // Если нужно игнорировать папку node_modules, кроме axios
  ],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy', // Для обработки CSS файлов
  },
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],  // Расширения
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
};
