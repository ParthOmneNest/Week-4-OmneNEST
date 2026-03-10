import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
     '^@src/(.*)$': '<rootDir>/src/$1',
    // If you use @/ for src as well:
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|svg)$': '<rootDir>/__mocks__/fileMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
        // ADD THIS: This overrides the strict "verbatimModuleSyntax" for tests
        diagnostics: {
          ignoreCodes: [1295],
        },
        // Force ts-jest to treat files as ESM during transformation
        useESM: true,
      },
    ],
  },
};
 
export default config;
