/**
 * Test setup file for the test-issue-tracker module
 */

// Mock process.cwd for consistent test behavior
jest.mock('process', () => ({
  ...jest.requireActual('process'),
  cwd: jest.fn().mockReturnValue('/project')
}));

// Add a simple test to prevent the "Your test suite must contain at least one test" error
describe('Test Setup', () => {
  it('should set up the test environment', () => {
    // Don't test the actual value, just verify that it's a string
    expect(typeof process.cwd()).toBe('string');
  });
});

// Reset console mocks after each test
afterEach(() => {
  // Restore console methods if they were mocked
  // Use type assertion to avoid TypeScript errors
  const consoleLog = console.log as unknown as jest.Mock;
  const consoleError = console.error as unknown as jest.Mock;
  const consoleWarn = console.warn as unknown as jest.Mock;

  if (consoleLog.mockRestore) {
    consoleLog.mockRestore();
  }
  if (consoleError.mockRestore) {
    consoleError.mockRestore();
  }
  if (consoleWarn.mockRestore) {
    consoleWarn.mockRestore();
  }
});
