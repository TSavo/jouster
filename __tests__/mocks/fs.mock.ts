/**
 * Mock for file system operations
 */

import { MappingDatabase } from '../../types';

describe('FS Mocks', () => {
  it('should provide mock implementations', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockExistsSync).toBeDefined();
    expect(mockReadFileSync).toBeDefined();
    expect(mockWriteFileSync).toBeDefined();
    expect(mockMkdirSync).toBeDefined();
    expect(mockRenameSync).toBeDefined();
    expect(mockUnlinkSync).toBeDefined();
  });
});

// Mock database content
export const mockEmptyDatabase: MappingDatabase = {
  testIdentifiers: {}
};

export const mockPopulatedDatabase: MappingDatabase = {
  testIdentifiers: {
    'path/to/test.test.ts:TestSuite:testName': {
      issueNumber: 123,
      status: 'open',
      lastFailure: '2023-01-01T00:00:00.000Z',
      lastUpdate: '2023-01-01T00:00:00.000Z'
    },
    'path/to/fixed.test.ts:TestSuite:fixedTest': {
      issueNumber: 456,
      status: 'open',
      lastFailure: '2023-01-01T00:00:00.000Z',
      lastUpdate: '2023-01-01T00:00:00.000Z'
    },
    'path/to/closed.test.ts:TestSuite:closedTest': {
      issueNumber: 789,
      status: 'closed',
      lastFailure: '2023-01-01T00:00:00.000Z',
      lastUpdate: '2023-01-02T00:00:00.000Z'
    }
  }
};

// Mock for fs.existsSync
export const mockExistsSync = jest.fn().mockImplementation((path: string) => {
  // Return true for database file, false for other paths
  return path.includes('test-issue-mapping.json');
});

// Mock for fs.readFileSync
export const mockReadFileSync = jest.fn().mockImplementation((path: string, encoding: string) => {
  if (path.includes('test-issue-mapping.json')) {
    return JSON.stringify(mockPopulatedDatabase);
  }
  throw new Error(`File not found: ${path}`);
});

// Mock for fs.writeFileSync
export const mockWriteFileSync = jest.fn();

// Mock for fs.mkdirSync
export const mockMkdirSync = jest.fn();

// Mock for fs.renameSync
export const mockRenameSync = jest.fn();

// Mock for fs.unlinkSync
export const mockUnlinkSync = jest.fn();

// Reset all mocks
export const resetFsMocks = (): void => {
  mockExistsSync.mockClear();
  mockReadFileSync.mockClear();
  mockWriteFileSync.mockClear();
  mockMkdirSync.mockClear();
  mockRenameSync.mockClear();
  mockUnlinkSync.mockClear();
};
