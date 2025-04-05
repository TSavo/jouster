// Jest setup file
import { jest } from '@jest/globals';

// Mock console methods to avoid noise in test output
global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// Add a dummy test to avoid Jest error
describe('Setup', () => {
  it('should set up the test environment', () => {
    expect(true).toBe(true);
  });
});
