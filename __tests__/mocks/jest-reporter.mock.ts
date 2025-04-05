/**
 * Mock Jest reporter context and results
 */

describe('Jest Reporter Mocks', () => {
  it('should provide mock Jest reporter objects', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockGlobalConfig).toBeDefined();
    expect(mockReporterOptions).toBeDefined();
    expect(mockTestContext).toBeDefined();
    expect(mockJestTestResult).toBeDefined();
    expect(mockProcessArgvWithGenerateIssues).toBeDefined();
    expect(mockProcessArgvWithTrackIssues).toBeDefined();
    expect(mockProcessArgvWithBothFlags).toBeDefined();
    expect(mockProcessArgvWithNoFlags).toBeDefined();
  });
});

// Mock for Jest global config
export const mockGlobalConfig = {
  rootDir: '/project',
  testPathIgnorePatterns: [],
  testMatch: ['**/*.test.ts'],
  verbose: true
};

// Mock for reporter options
export const mockReporterOptions = {
  databasePath: '/project/test-issue-mapping.json'
};

// Mock for Jest test context
export const mockTestContext = {
  context: {
    config: {
      rootDir: '/project'
    }
  }
};

// Mock for Jest test result with multiple test cases
export const mockJestTestResult = {
  testFilePath: '/project/path/to/test.test.ts',
  testResults: [
    {
      ancestorTitles: ['TestSuite'],
      title: 'should do something but fails',
      status: 'failed',
      failureMessages: ['Expected true to be false'],
      failureDetails: [
        {
          stack: 'Error: Expected true to be false\n    at Object.<anonymous> (/project/path/to/test.test.ts:10:10)'
        }
      ],
      duration: 100
    },
    {
      ancestorTitles: ['TestSuite'],
      title: 'should do something else and pass',
      status: 'passed',
      duration: 50
    }
  ]
};

// Mock for process.argv
export const mockProcessArgvWithGenerateIssues = [
  'node',
  'jest',
  '--generate-issues'
];

export const mockProcessArgvWithTrackIssues = [
  'node',
  'jest',
  '--track-issues'
];

export const mockProcessArgvWithBothFlags = [
  'node',
  'jest',
  '--generate-issues',
  '--track-issues'
];

export const mockProcessArgvWithNoFlags = [
  'node',
  'jest'
];
