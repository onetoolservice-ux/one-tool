const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured for you soon)
    '^@/(.*)$': '<rootDir>/$1', 
    '^@/app/(.*)$': '<rootDir>/app/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'app/tools/**/*.{ts,tsx}',
    '!app/tools/**/layout.tsx',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
