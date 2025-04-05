// @ts-nocheck
import { jest } from '@jest/globals';
import { GitHubBugTracker } from '../../../trackers/github/github-bug-tracker';
import { IGitHubClient } from '../../../github/github-client.interface';
import { ITemplateManager } from '../../../templates/template-manager.interface';
import { IMappingStore } from '../../../storage/mapping-store.interface';
import { mockFailingTest, mockPassingTest } from '../../mocks/test-results.mock';

describe('GitHubBugTracker', () => {
  let bugTracker: GitHubBugTracker;
  let mockGithubClient: IGitHubClient;
  let mockTemplateManager: ITemplateManager;
  let mockMappingStore: IMappingStore;

  beforeEach(() => {
    // Create mock dependencies
    mockGithubClient = {
      isGitHubCliAvailable: jest.fn().mockResolvedValue(true),
      createIssue: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 }),
      reopenIssue: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 }),
      closeIssue: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 })
    };

    mockTemplateManager = {
      generateIssueBody: jest.fn().mockReturnValue('Issue body'),
      generateCommentBody: jest.fn().mockReturnValue('Comment body'),
      generateReopenBody: jest.fn().mockReturnValue('Reopen body'),
      extractErrorInfo: jest.fn().mockReturnValue({ message: 'Error message', stack: 'Stack trace', type: 'Error', lineNumber: 10, location: '/path/to/test.ts:10:10' }),
      getGitInfo: jest.fn().mockReturnValue({ branch: 'main', commit: '1234567890abcdef', author: 'Test Author', message: 'Test commit message' })
    };

    mockMappingStore = {
      getMapping: jest.fn(),
      setMapping: jest.fn(),
      updateMapping: jest.fn(),
      getAllMappings: jest.fn().mockReturnValue({})
    };

    bugTracker = new GitHubBugTracker(
      mockGithubClient,
      mockTemplateManager,
      mockMappingStore,
      ['bug', 'test-failure']
    );
  });

  describe('initialize', () => {
    it('should check if GitHub CLI is available', async () => {
      await bugTracker.initialize();
      expect(mockGithubClient.isGitHubCliAvailable).toHaveBeenCalled();
    });

    it('should throw an error if GitHub CLI is not available', async () => {
      mockGithubClient.isGitHubCliAvailable.mockResolvedValue(false);
      await expect(bugTracker.initialize()).rejects.toThrow('GitHub CLI is not available');
    });
  });

  describe('bugExists', () => {
    it('should check if a bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue({ issueNumber: 123, status: 'open' });
      const exists = await bugTracker.bugExists('test-identifier');
      expect(exists).toBe(true);
      expect(mockMappingStore.getMapping).toHaveBeenCalledWith('test-identifier');
    });

    it('should return false if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      const exists = await bugTracker.bugExists('test-identifier');
      expect(exists).toBe(false);
      expect(mockMappingStore.getMapping).toHaveBeenCalledWith('test-identifier');
    });
  });

  describe('getBug', () => {
    it('should get bug information for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

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
      expect(mockMappingStore.getMapping).toHaveBeenCalledWith('test-identifier');
    });

    it('should return null if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      const bug = await bugTracker.getBug('test-identifier');
      expect(bug).toBeNull();
      expect(mockMappingStore.getMapping).toHaveBeenCalledWith('test-identifier');
    });
  });

  describe('createBug', () => {
    it('should create a new bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      const bug = await bugTracker.createBug(testIdentifier, mockFailingTest, testFilePath);

      expect(mockTemplateManager.generateIssueBody).toHaveBeenCalledWith(mockFailingTest, testFilePath);
      expect(mockGithubClient.createIssue).toHaveBeenCalledWith(
        expect.stringContaining('Test Failure:'),
        'Issue body',
        ['bug', 'test-failure']
      );
      expect(mockTemplateManager.getGitInfo).toHaveBeenCalled();
      expect(mockMappingStore.setMapping).toHaveBeenCalledWith(
        testIdentifier,
        123,
        'open',
        expect.any(Object),
        testFilePath,
        mockFailingTest.fullName
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
    });

    it('should throw an error if creating the issue fails', async () => {
      mockGithubClient.createIssue.mockResolvedValue({ success: false, error: 'Failed to create issue' });
      await expect(bugTracker.createBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('Failed to create issue');
    });
  });

  describe('closeBug', () => {
    it('should close a bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath,
        testName: mockPassingTest.fullName
      });

      const bug = await bugTracker.closeBug(testIdentifier, mockPassingTest, testFilePath);

      expect(mockTemplateManager.generateCommentBody).toHaveBeenCalledWith(mockPassingTest, testFilePath);
      expect(mockGithubClient.closeIssue).toHaveBeenCalledWith(123, 'Comment body');
      expect(mockTemplateManager.getGitInfo).toHaveBeenCalled();
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        testIdentifier,
        { status: 'closed' },
        expect.any(Object),
        testFilePath,
        mockPassingTest.fullName
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
    });

    it('should throw an error if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      await expect(bugTracker.closeBug('test-identifier', mockPassingTest, '/path/to/test.ts')).rejects.toThrow('No issue found for test');
    });

    it('should throw an error if closing the issue fails', async () => {
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });
      mockGithubClient.closeIssue.mockResolvedValue({ success: false, error: 'Failed to close issue' });
      await expect(bugTracker.closeBug('test-identifier', mockPassingTest, '/path/to/test.ts')).rejects.toThrow('Failed to close issue');
    });
  });

  describe('reopenBug', () => {
    it('should reopen a bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'closed',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath,
        testName: mockFailingTest.fullName
      });

      const bug = await bugTracker.reopenBug(testIdentifier, mockFailingTest, testFilePath);

      expect(mockTemplateManager.generateReopenBody).toHaveBeenCalledWith(mockFailingTest, testFilePath);
      expect(mockGithubClient.reopenIssue).toHaveBeenCalledWith(123, 'Reopen body');
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        testIdentifier,
        {
          status: 'open',
          lastFailure: expect.any(String)
        },
        {},
        testFilePath,
        mockFailingTest.fullName
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
    });

    it('should throw an error if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      await expect(bugTracker.reopenBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('No issue found for test');
    });

    it('should throw an error if reopening the issue fails', async () => {
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'closed',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });
      mockGithubClient.reopenIssue.mockResolvedValue({ success: false, error: 'Failed to reopen issue' });
      await expect(bugTracker.reopenBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('Failed to reopen issue');
    });
  });

  describe('updateBug', () => {
    it('should update a bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath,
        testName: mockFailingTest.fullName
      });

      const bug = await bugTracker.updateBug(testIdentifier, mockFailingTest, testFilePath);

      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        testIdentifier,
        {
          lastFailure: expect.any(String)
        },
        {},
        testFilePath,
        mockFailingTest.fullName
      );
      expect(bug).toEqual({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastFailure: expect.any(String),
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should throw an error if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      await expect(bugTracker.updateBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('No issue found for test');
    });
  });

  describe('getAllBugs', () => {
    it('should get all bugs', async () => {
      mockMappingStore.getAllMappings.mockReturnValue({
        'test-identifier-1': {
          issueNumber: 123,
          status: 'open',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-01T00:00:00.000Z',
          testFilePath: '/path/to/test1.ts',
          testName: 'Test Suite 1 › test should fail'
        },
        'test-identifier-2': {
          issueNumber: 456,
          status: 'closed',
          lastFailure: '2023-01-01T00:00:00.000Z',
          lastUpdate: '2023-01-02T00:00:00.000Z',
          testFilePath: '/path/to/test2.ts',
          testName: 'Test Suite 2 › test should pass',
          fixedBy: 'Test Author',
          fixCommit: '1234567890abcdef',
          fixMessage: 'Fix test'
        }
      });

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
      expect(mockMappingStore.getAllMappings).toHaveBeenCalled();
    });
  });
});
