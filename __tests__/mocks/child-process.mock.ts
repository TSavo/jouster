/**
 * Mock for child_process.exec
 */

describe('Child Process Mocks', () => {
  it('should provide mock child_process.exec implementations', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockExecSuccess).toBeDefined();
    expect(mockExecFailure).toBeDefined();
    expect(mockExecAsyncSuccess).toBeDefined();
    expect(mockExecAsyncFailure).toBeDefined();
  });
});

// Mock for successful exec
export const mockExecSuccess = jest.fn().mockImplementation(
  (command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
    // Handle different commands
    if (command.includes('gh --version')) {
      callback(null, 'gh version 2.0.0', '');
    } else if (command.includes('gh issue create')) {
      callback(null, 'https://github.com/TSavo/directorymonster/issues/123', '');
    } else if (command.includes('gh issue close')) {
      callback(null, 'Issue closed', '');
    } else {
      callback(null, 'Command executed successfully', '');
    }
  }
);

// Mock for failed exec
export const mockExecFailure = jest.fn().mockImplementation(
  (command: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
    callback(new Error('Command failed'), '', 'Error: Command failed');
  }
);

// Mock for promisified exec
export const mockExecAsyncSuccess = jest.fn().mockImplementation(
  (command: string) => {
    // Handle different commands
    if (command.includes('gh --version')) {
      return Promise.resolve({ stdout: 'gh version 2.0.0', stderr: '' });
    } else if (command.includes('gh issue create')) {
      return Promise.resolve({ stdout: 'https://github.com/TSavo/directorymonster/issues/123', stderr: '' });
    } else if (command.includes('gh issue close')) {
      return Promise.resolve({ stdout: 'Issue closed', stderr: '' });
    } else {
      return Promise.resolve({ stdout: 'Command executed successfully', stderr: '' });
    }
  }
);

// Mock for failed promisified exec
export const mockExecAsyncFailure = jest.fn().mockImplementation(
  (command: string) => {
    return Promise.reject(new Error('Command failed'));
  }
);

// Reset all mocks
export const resetExecMocks = (): void => {
  mockExecSuccess.mockClear();
  mockExecFailure.mockClear();
  mockExecAsyncSuccess.mockClear();
  mockExecAsyncFailure.mockClear();
};
