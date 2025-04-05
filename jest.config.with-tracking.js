// Determine if we should run E2E tests
const runE2ETests = process.env.RUN_E2E_TESTS === 'true';

module.exports = {
  // Use the current directory as the root
  rootDir: '.',
  
  // Use ts-jest for TypeScript files
  preset: 'ts-jest',
  
  // Test environment
  testEnvironment: 'node',
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.ts'
  ],
  
  // Exclude E2E tests by default, unless RUN_E2E_TESTS is true
  // Also exclude mock files and demo test files
  testPathIgnorePatterns: runE2ETests ? [
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/__tests__/demo-template-test.ts',
    '<rootDir>/__tests__/improved-template-test.ts',
    '<rootDir>/__tests__/sample-test.ts',
    '<rootDir>/__tests__/jest/issue-tracker-reporter.test.ts',
    '<rootDir>/__tests__/issues/issue-manager.test.ts',
    '<rootDir>/__tests__/storage/mapping-store.test.ts',
    '<rootDir>/__tests__/index.test.ts'
  ] : [
    '<rootDir>/__tests__/e2e/',
    '<rootDir>/__tests__/mocks/',
    '<rootDir>/__tests__/demo-template-test.ts',
    '<rootDir>/__tests__/improved-template-test.ts',
    '<rootDir>/__tests__/sample-test.ts',
    '<rootDir>/__tests__/jest/issue-tracker-reporter.test.ts',
    '<rootDir>/__tests__/issues/issue-manager.test.ts',
    '<rootDir>/__tests__/storage/mapping-store.test.ts',
    '<rootDir>/__tests__/index.test.ts'
  ],
  
  // Coverage configuration - disabled for now
  collectCoverage: false,
  
  // Coverage thresholds - disabled for now
  coverageThreshold: null,
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup.ts'
  ],
  
  // Use our custom reporter
  reporters: [
    'default',
    ['<rootDir>/jest/issue-tracker-reporter.js', {
      generateIssues: true,
      trackIssues: true
    }]
  ],
  
  // Global variables
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};
