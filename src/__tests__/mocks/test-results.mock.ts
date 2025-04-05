// @ts-nocheck
import { TestResult } from '../../types';

// Mock test result for a failing test
export const mockFailingTest: TestResult = {
  ancestorTitles: ['Test Suite'],
  duration: 100,
  failureMessages: [
    'Error: Expected true to be false\n    at Object.<anonymous> (/path/to/test.ts:10:10)'
  ],
  fullName: 'Test Suite › test should fail',
  location: '/path/to/test.ts:10:10',
  numPassingAsserts: 0,
  status: 'failed',
  title: 'test should fail'
};

// Mock test result for a passing test
export const mockPassingTest: TestResult = {
  ancestorTitles: ['Test Suite'],
  duration: 100,
  failureMessages: [],
  fullName: 'Test Suite › test should pass',
  location: '/path/to/test.ts:20:10',
  numPassingAsserts: 1,
  status: 'passed',
  title: 'test should pass'
};

// Mock test file results
export const mockTestFileResults = {
  testFilePath: '/path/to/test.ts',
  testResults: [mockFailingTest, mockPassingTest]
};

// Mock test results
export const mockTestResults = {
  testResults: [mockTestFileResults]
};

// Add a dummy test to avoid Jest error
describe('Test Results Mock', () => {
  it('should provide mock test results', () => {
    expect(mockFailingTest).toBeDefined();
    expect(mockPassingTest).toBeDefined();
    expect(mockTestFileResults).toBeDefined();
    expect(mockTestResults).toBeDefined();
  });
});
