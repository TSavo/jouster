// @ts-nocheck
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { FileBugTracker } from '../../../trackers/file/file-bug-tracker';
import { ITemplateManager } from '../../../templates/template-manager.interface';
import { mockFailingTest, mockPassingTest } from '../../mocks/test-results.mock';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn()
}));

describe('FileBugTracker', () => {
  let bugTracker: FileBugTracker;
  let mockTemplateManager: ITemplateManager;
  const baseDir = '/path/to/bugs';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock dependencies
    mockTemplateManager = {
      generateIssueBody: jest.fn().mockReturnValue('Issue body'),
      generateCommentBody: jest.fn().mockReturnValue('Comment body'),
      generateReopenBody: jest.fn().mockReturnValue('Reopen body'),
      extractErrorInfo: jest.fn().mockReturnValue({ message: 'Error message', stack: 'Stack trace', type: 'Error', lineNumber: 10, location: '/path/to/test.ts:10:10' }),
      getGitInfo: jest.fn().mockReturnValue({ branch: 'main', commit: '1234567890abcdef', author: 'Test Author', message: 'Test commit message' })
    };

    bugTracker = new FileBugTracker(baseDir, mockTemplateManager);

    // Mock Date.now() to return a consistent value
    jest.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  describe('initialize', () => {
    it('should create the base directory if it does not exist', async () => {
      fs.existsSync.mockReturnValue(false);
      fs.readdirSync.mockReturnValue([]);

      await bugTracker.initialize();

      expect(fs.existsSync).toHaveBeenCalledWith(baseDir);
      expect(fs.mkdirSync).toHaveBeenCalledWith(baseDir, { recursive: true });
      expect(fs.readdirSync).toHaveBeenCalledWith(baseDir);
    });

    it('should load existing bugs from the base directory', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['test-identifier-1.json', 'test-identifier-2.json', 'not-a-bug.txt']);
      fs.readFileSync.mockImplementation((filePath) => {
        if (filePath === path.join(baseDir, 'test-identifier-1.json')) {
          return JSON.stringify({
            id: '123',
            status: 'open',
            testIdentifier: 'test-identifier-1',
            testFilePath: '/path/to/test1.ts',
            testName: 'Test Suite 1 › test should fail',
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: '2023-01-01T00:00:00.000Z'
          });
        } else if (filePath === path.join(baseDir, 'test-identifier-2.json')) {
          return JSON.stringify({
            id: '456',
            status: 'closed',
            testIdentifier: 'test-identifier-2',
            testFilePath: '/path/to/test2.ts',
            testName: 'Test Suite 2 › test should pass',
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: '2023-01-02T00:00:00.000Z',
            fixedBy: 'Test Author',
            fixCommit: '1234567890abcdef',
            fixMessage: 'Fix test'
          });
        }
        return '';
      });

      await bugTracker.initialize();

      expect(fs.existsSync).toHaveBeenCalledWith(baseDir);
      expect(fs.readdirSync).toHaveBeenCalledWith(baseDir);
      expect(fs.readFileSync).toHaveBeenCalledWith(path.join(baseDir, 'test-identifier-1.json'), 'utf-8');
      expect(fs.readFileSync).toHaveBeenCalledWith(path.join(baseDir, 'test-identifier-2.json'), 'utf-8');
      expect(await bugTracker.getAllBugs()).toEqual({
        'test-identifier-1': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier-1',
          testFilePath: '/path/to/test1.ts',
          testName: 'Test Suite 1 › test should fail',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        },
        'test-identifier-2': {
          id: '456',
          status: 'closed',
          testIdentifier: 'test-identifier-2',
          testFilePath: '/path/to/test2.ts',
          testName: 'Test Suite 2 › test should pass',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-02T00:00:00.000Z',
          fixedBy: 'Test Author',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }
      });
    });
  });

  describe('bugExists', () => {
    it('should check if a bug exists for a test', async () => {
      // Set up the bug in the in-memory cache
      bugTracker['bugs'] = {
        'test-identifier': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier',
          testFilePath: '/path/to/test.ts',
          testName: 'Test Suite › test should fail',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }
      };

      const exists = await bugTracker.bugExists('test-identifier');
      expect(exists).toBe(true);
    });

    it('should return false if no bug exists for a test', async () => {
      // Clear the in-memory cache
      bugTracker['bugs'] = {};

      const exists = await bugTracker.bugExists('test-identifier');
      expect(exists).toBe(false);
    });
  });

  describe('getBug', () => {
    it('should get bug information for a test', async () => {
      // Set up the bug in the in-memory cache
      bugTracker['bugs'] = {
        'test-identifier': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier',
          testFilePath: '/path/to/test.ts',
          testName: 'Test Suite › test should fail',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }
      };

      const bug = await bugTracker.getBug('test-identifier');
      expect(bug).toEqual({
        id: '123',
        status: 'open',
        testIdentifier: 'test-identifier',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should return null if no bug exists for a test', async () => {
      // Clear the in-memory cache
      bugTracker['bugs'] = {};

      const bug = await bugTracker.getBug('test-identifier');
      expect(bug).toBeNull();
    });
  });

  describe('createBug', () => {
    it('should create a new bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      const bug = await bugTracker.createBug(testIdentifier, mockFailingTest, testFilePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(baseDir, `${testIdentifier}.json`),
        expect.any(String)
      );
      expect(bug).toEqual({
        id: '1234567890',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: expect.any(String),
        lastUpdate: expect.any(String)
      });
      expect(bugTracker['bugs'][testIdentifier]).toEqual(bug);
    });
  });

  describe('closeBug', () => {
    it('should close a bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Set up the bug in the in-memory cache
      bugTracker['bugs'] = {
        'test-identifier': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier',
          testFilePath: '/path/to/test.ts',
          testName: mockPassingTest.fullName,
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }
      };

      const bug = await bugTracker.closeBug(testIdentifier, mockPassingTest, testFilePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(baseDir, `${testIdentifier}.json`),
        expect.any(String)
      );
      expect(bug).toEqual({
        id: '123',
        status: 'closed',
        testIdentifier,
        testFilePath,
        testName: mockPassingTest.fullName,
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: expect.any(String),
        fixedBy: 'Test Author',
        fixCommit: '1234567890abcdef',
        fixMessage: 'Test commit message'
      });
      expect(bugTracker['bugs'][testIdentifier]).toEqual(bug);
    });

    it('should throw an error if no bug exists for a test', async () => {
      // Clear the in-memory cache
      bugTracker['bugs'] = {};

      await expect(bugTracker.closeBug('test-identifier', mockPassingTest, '/path/to/test.ts')).rejects.toThrow('No bug found for test');
    });
  });

  describe('reopenBug', () => {
    it('should reopen a bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Set up the bug in the in-memory cache
      bugTracker['bugs'] = {
        'test-identifier': {
          id: '123',
          status: 'closed',
          testIdentifier: 'test-identifier',
          testFilePath: '/path/to/test.ts',
          testName: mockFailingTest.fullName,
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z',
          fixedBy: 'Test Author',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }
      };

      const bug = await bugTracker.reopenBug(testIdentifier, mockFailingTest, testFilePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(baseDir, `${testIdentifier}.json`),
        expect.any(String)
      );
      expect(bug).toEqual({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: expect.any(String),
        lastUpdate: expect.any(String),
        fixedBy: 'Test Author',
        fixCommit: '1234567890abcdef',
        fixMessage: 'Fix test'
      });
      expect(bugTracker['bugs'][testIdentifier]).toEqual(bug);
    });

    it('should throw an error if no bug exists for a test', async () => {
      // Clear the in-memory cache
      bugTracker['bugs'] = {};

      await expect(bugTracker.reopenBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('No bug found for test');
    });
  });

  describe('updateBug', () => {
    it('should update a bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Set up the bug in the in-memory cache
      bugTracker['bugs'] = {
        'test-identifier': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier',
          testFilePath: '/path/to/test.ts',
          testName: mockFailingTest.fullName,
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        }
      };

      const bug = await bugTracker.updateBug(testIdentifier, mockFailingTest, testFilePath);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(baseDir, `${testIdentifier}.json`),
        expect.any(String)
      );
      expect(bug).toEqual({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: expect.any(String),
        lastUpdate: expect.any(String)
      });
      expect(bugTracker['bugs'][testIdentifier]).toEqual(bug);
    });

    it('should throw an error if no bug exists for a test', async () => {
      // Clear the in-memory cache
      bugTracker['bugs'] = {};

      await expect(bugTracker.updateBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('No bug found for test');
    });
  });

  describe('getAllBugs', () => {
    it('should get all bugs', async () => {
      // Set up the bugs in the in-memory cache
      bugTracker['bugs'] = {
        'test-identifier-1': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier-1',
          testFilePath: '/path/to/test1.ts',
          testName: 'Test Suite 1 › test should fail',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        },
        'test-identifier-2': {
          id: '456',
          status: 'closed',
          testIdentifier: 'test-identifier-2',
          testFilePath: '/path/to/test2.ts',
          testName: 'Test Suite 2 › test should pass',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-02T00:00:00.000Z',
          fixedBy: 'Test Author',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }
      };

      const bugs = await bugTracker.getAllBugs();

      expect(bugs).toEqual({
        'test-identifier-1': {
          id: '123',
          status: 'open',
          testIdentifier: 'test-identifier-1',
          testFilePath: '/path/to/test1.ts',
          testName: 'Test Suite 1 › test should fail',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z'
        },
        'test-identifier-2': {
          id: '456',
          status: 'closed',
          testIdentifier: 'test-identifier-2',
          testFilePath: '/path/to/test2.ts',
          testName: 'Test Suite 2 › test should pass',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-02T00:00:00.000Z',
          fixedBy: 'Test Author',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }
      });
    });
  });
});
