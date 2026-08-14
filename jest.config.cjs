/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@widgets/(.*)$': '<rootDir>/src/widgets/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@entities/(.*)$': '<rootDir>/src/entities/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/shared/config/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          module: 'commonjs',
        moduleResolution: 'node',
        verbatimModuleSyntax: false,
        lib: ['ES2023', 'DOM'],
        types: ['jest', '@testing-library/jest-dom'],
        },
      },
    ],
  },
}
