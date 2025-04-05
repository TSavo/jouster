/**
 * Mock test results for testing
 */

import { TestResult } from '../../types';

describe('Test Results Mocks', () => {
  it('should provide mock test results', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockFailingTest).toBeDefined();
    expect(mockPassingTest).toBeDefined();
    expect(mockAlwaysPassingTest).toBeDefined();
    expect(mockClosedIssueTest).toBeDefined();
    expect(mockNewFailingTest).toBeDefined();
  });
});

// Mock for a failing test
export const mockFailingTest: TestResult = {
  testFilePath: '/project/path/to/test.test.ts',
  testSuiteName: 'TestSuite',
  testName: 'should do something but fails',
  status: 'failed',
  errorMessage: 'Expected true to be false',
  errorStack: 'Error: Expected true to be false\n    at Object.<anonymous> (/project/path/to/test.test.ts:10:10)',
  duration: 100
};

// Mock for a passing test that previously failed
export const mockPassingTest: TestResult = {
  testFilePath: '/project/path/to/fixed.test.ts',
  testSuiteName: 'TestSuite',
  testName: 'fixedTest',
  status: 'passed',
  duration: 50
};

// Mock for a test that has always passed
export const mockAlwaysPassingTest: TestResult = {
  testFilePath: '/project/path/to/always-passing.test.ts',
  testSuiteName: 'TestSuite',
  testName: 'alwaysPassingTest',
  status: 'passed',
  duration: 30
};

// Mock for a test that has a closed issue
export const mockClosedIssueTest: TestResult = {
  testFilePath: '/project/path/to/closed.test.ts',
  testSuiteName: 'TestSuite',
  testName: 'closedTest',
  status: 'passed',
  duration: 40
};

// Mock for a new failing test
export const mockNewFailingTest: TestResult = {
  testFilePath: '/project/path/to/new-failing.test.ts',
  testSuiteName: 'TestSuite',
  testName: 'newFailingTest',
  status: 'failed',
  errorMessage: 'New test failure',
  errorStack: 'Error: New test failure\n    at Object.<anonymous> (/project/path/to/new-failing.test.ts:15:10)',
  duration: 60
};
