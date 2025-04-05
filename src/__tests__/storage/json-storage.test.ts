import { jest } from '@jest/globals';
import { JsonStorage } from '../../storage/json-storage';

// Mock fs module
jest.mock('fs', () => require('../mocks/fs.mock'), { virtual: true });

describe('JsonStorage', () => {
  let jsonStorage: JsonStorage;

  beforeEach(() => {
    jsonStorage = new JsonStorage('test-issue-mapping.json');
  });

  describe('getMapping', () => {
    it('should return a mapping for an existing test identifier', () => {
      const mapping = jsonStorage.getMapping('test-identifier-1');

      expect(mapping).toBeDefined();
      expect(mapping?.issueNumber).toBe(123);
      expect(mapping?.status).toBe('open');
    });

    it('should return undefined for a non-existing test identifier', () => {
      const mapping = jsonStorage.getMapping('non-existing-identifier');

      expect(mapping).toBeUndefined();
    });
  });

  describe('setMapping', () => {
    it('should set a mapping for a test identifier', () => {
      const testIdentifier = 'new-test-identifier';
      const issueNumber = 789;
      const status = 'open';
      const gitInfo = { author: 'Test Author', commit: '1234567890abcdef' };
      const testFilePath = '/path/to/test.ts';
      const testName = 'Test Name';

      jsonStorage.setMapping(testIdentifier, issueNumber, status, gitInfo, testFilePath, testName);

      const mapping = jsonStorage.getMapping(testIdentifier);
      expect(mapping).toBeDefined();
      expect(mapping?.issueNumber).toBe(issueNumber);
      expect(mapping?.status).toBe(status);
      expect(mapping?.fixedBy).toBeUndefined();
      expect(mapping?.testFilePath).toBe(testFilePath);
      expect(mapping?.testName).toBe(testName);

      const { writeFileSync } = require('fs');
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should set a mapping with git information when status is closed', () => {
      const testIdentifier = 'new-test-identifier';
      const issueNumber = 789;
      const status = 'closed';
      const gitInfo = { author: 'Test Author', commit: '1234567890abcdef', message: 'Fix test' };

      jsonStorage.setMapping(testIdentifier, issueNumber, status, gitInfo);

      const mapping = jsonStorage.getMapping(testIdentifier);
      expect(mapping).toBeDefined();
      expect(mapping?.issueNumber).toBe(issueNumber);
      expect(mapping?.status).toBe(status);
      expect(mapping?.fixedBy).toBe(gitInfo.author);
      expect(mapping?.fixCommit).toBe(gitInfo.commit);
      expect(mapping?.fixMessage).toBe(gitInfo.message);
    });
  });

  describe('updateMapping', () => {
    it('should update a mapping for an existing test identifier', () => {
      const testIdentifier = 'test-identifier-1';
      const updates = { status: 'closed' };
      const gitInfo = { author: 'Test Author', commit: '1234567890abcdef', message: 'Fix test' };

      jsonStorage.updateMapping(testIdentifier, updates, gitInfo);

      const mapping = jsonStorage.getMapping(testIdentifier);
      expect(mapping).toBeDefined();
      expect(mapping?.status).toBe('closed');
      expect(mapping?.fixedBy).toBe(gitInfo.author);
      expect(mapping?.fixCommit).toBe(gitInfo.commit);
      expect(mapping?.fixMessage).toBe(gitInfo.message);

      const { writeFileSync } = require('fs');
      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should do nothing for a non-existing test identifier', () => {
      const testIdentifier = 'non-existing-identifier';
      const updates = { status: 'closed' };

      jsonStorage.updateMapping(testIdentifier, updates);

      const mapping = jsonStorage.getMapping(testIdentifier);
      expect(mapping).toBeUndefined();
    });

    it('should update test file path and test name if provided', () => {
      const testIdentifier = 'test-identifier-1';
      const updates = { status: 'closed' };
      const gitInfo = {};
      const testFilePath = '/path/to/test.ts';
      const testName = 'Test Name';

      jsonStorage.updateMapping(testIdentifier, updates, gitInfo, testFilePath, testName);

      const mapping = jsonStorage.getMapping(testIdentifier);
      expect(mapping).toBeDefined();
      expect(mapping?.testFilePath).toBe(testFilePath);
      expect(mapping?.testName).toBe(testName);
    });
  });

  describe('getAllMappings', () => {
    it('should return all mappings', () => {
      const mappings = jsonStorage.getAllMappings();

      expect(mappings).toBeDefined();
      expect(Object.keys(mappings).length).toBe(2);
      expect(mappings['test-identifier-1']).toBeDefined();
      expect(mappings['test-identifier-2']).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle errors when loading mappings', () => {
      const { readFileSync } = require('fs');
      readFileSync.mockImplementationOnce(() => {
        throw new Error('Failed to read file');
      });

      const storage = new JsonStorage('test-issue-mapping.json');
      const mappings = storage.getAllMappings();

      expect(mappings).toEqual({});
    });

    it('should handle errors when saving mappings', () => {
      const { writeFileSync } = require('fs');
      writeFileSync.mockImplementationOnce(() => {
        throw new Error('Failed to write file');
      });

      const testIdentifier = 'new-test-identifier';
      const issueNumber = 789;
      const status = 'open';

      // This should not throw an error
      jsonStorage.setMapping(testIdentifier, issueNumber, status);

      // Verify the mapping was still set in memory
      const mapping = jsonStorage.getMapping(testIdentifier);
      expect(mapping).toBeDefined();
      expect(mapping?.issueNumber).toBe(issueNumber);
    });
  });

  describe('getLastFailure', () => {
    it('should return now when status is open', () => {
      const status = 'open';
      const mapping = {};
      const now = '2023-01-01T00:00:00.000Z';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getLastFailure'](status, mapping, now);

      expect(result).toBe(now);
    });

    it('should return existing lastFailure when status is closed', () => {
      const status = 'closed';
      const mapping = { lastFailure: '2022-01-01T00:00:00.000Z' };
      const now = '2023-01-01T00:00:00.000Z';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getLastFailure'](status, mapping, now);

      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should return now when status is closed but no existing lastFailure', () => {
      const status = 'closed';
      const mapping = {};
      const now = '2023-01-01T00:00:00.000Z';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getLastFailure'](status, mapping, now);

      expect(result).toBe(now);
    });
  });

  describe('getFixedBy', () => {
    it('should return author when status is closed', () => {
      const status = 'closed';
      const mapping = {};
      const gitInfo = { author: 'Test Author' };

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixedBy'](status, mapping, gitInfo);

      expect(result).toBe('Test Author');
    });

    it('should return Unknown when status is closed but no author', () => {
      const status = 'closed';
      const mapping = {};
      const gitInfo = {};

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixedBy'](status, mapping, gitInfo);

      expect(result).toBe('Unknown');
    });

    it('should return existing fixedBy when status is open', () => {
      const status = 'open';
      const mapping = { fixedBy: 'Previous Author' };
      const gitInfo = { author: 'Test Author' };

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixedBy'](status, mapping, gitInfo);

      expect(result).toBe('Previous Author');
    });
  });

  describe('getFixCommit', () => {
    it('should return commit when status is closed', () => {
      const status = 'closed';
      const mapping = {};
      const gitInfo = { commit: 'abc123' };

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixCommit'](status, mapping, gitInfo);

      expect(result).toBe('abc123');
    });

    it('should return Unknown when status is closed but no commit', () => {
      const status = 'closed';
      const mapping = {};
      const gitInfo = {};

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixCommit'](status, mapping, gitInfo);

      expect(result).toBe('Unknown');
    });

    it('should return existing fixCommit when status is open', () => {
      const status = 'open';
      const mapping = { fixCommit: 'def456' };
      const gitInfo = { commit: 'abc123' };

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixCommit'](status, mapping, gitInfo);

      expect(result).toBe('def456');
    });
  });

  describe('getFixMessage', () => {
    it('should return message when status is closed', () => {
      const status = 'closed';
      const mapping = {};
      const gitInfo = { message: 'Fix bug' };

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixMessage'](status, mapping, gitInfo);

      expect(result).toBe('Fix bug');
    });

    it('should return empty string when status is closed but no message', () => {
      const status = 'closed';
      const mapping = {};
      const gitInfo = {};

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixMessage'](status, mapping, gitInfo);

      expect(result).toBe('');
    });

    it('should return existing fixMessage when status is open', () => {
      const status = 'open';
      const mapping = { fixMessage: 'Previous fix' };
      const gitInfo = { message: 'Fix bug' };

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getFixMessage'](status, mapping, gitInfo);

      expect(result).toBe('Previous fix');
    });
  });

  describe('getTestFilePath', () => {
    it('should return provided testFilePath', () => {
      const mapping = {};
      const testFilePath = '/path/to/test.ts';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getTestFilePath'](mapping, testFilePath);

      expect(result).toBe('/path/to/test.ts');
    });

    it('should return existing testFilePath when no new path provided', () => {
      const mapping = { testFilePath: '/existing/path.ts' };
      const testFilePath = '';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getTestFilePath'](mapping, testFilePath);

      expect(result).toBe('/existing/path.ts');
    });

    it('should return empty string when no path available', () => {
      const mapping = {};
      const testFilePath = '';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getTestFilePath'](mapping, testFilePath);

      expect(result).toBe('');
    });
  });

  describe('getTestName', () => {
    it('should return provided testName', () => {
      const mapping = {};
      const testName = 'Test Name';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getTestName'](mapping, testName);

      expect(result).toBe('Test Name');
    });

    it('should return existing testName when no new name provided', () => {
      const mapping = { testName: 'Existing Test' };
      const testName = '';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getTestName'](mapping, testName);

      expect(result).toBe('Existing Test');
    });

    it('should return empty string when no name available', () => {
      const mapping = {};
      const testName = '';

      // @ts-ignore - Accessing private method for testing
      const result = jsonStorage['getTestName'](mapping, testName);

      expect(result).toBe('');
    });
  });
});
