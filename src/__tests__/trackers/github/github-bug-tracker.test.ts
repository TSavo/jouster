// @ts-nocheck
import { jest } from '@jest/globals';
import { GitHubBugTracker } from '../../../trackers/github/github-bug-tracker';
import { IGitHubClient } from '../../../github/github-client.interface';
import { ITemplateManager } from '../../../templates/template-manager.interface';
import { IMappingStore } from '../../../storage/mapping-store.interface';
import { ILogger } from '../../../utils/logger.interface';
import { mockFailingTest, mockPassingTest } from '../../mocks/test-results.mock';

describe('GitHubBugTracker', () => {
  let bugTracker: GitHubBugTracker;
  let mockGithubClient: IGitHubClient;
  let mockTemplateManager: ITemplateManager;
  let mockMappingStore: IMappingStore;
  let mockLogger: ILogger;

  beforeEach(() => {
    // Create mock dependencies
    mockGithubClient = {
      isGitHubCliAvailable: jest.fn().mockResolvedValue(true),
      createIssue: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 }),
      reopenIssue: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 }),
      closeIssue: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 }),
      checkIssueStatus: jest.fn().mockResolvedValue({ success: true, status: 'open' }),
      addComment: jest.fn().mockResolvedValue({ success: true, issueNumber: 123 })
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

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    };

    bugTracker = new GitHubBugTracker(
      mockGithubClient,
      mockTemplateManager,
      mockMappingStore,
      ['bug', 'test-failure'],
      mockLogger
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

    it('should return null if mapping is not found after syncing issue status', async () => {
      // Mock getMapping to return a mapping initially, but undefined after syncing
      mockMappingStore.getMapping.mockImplementation((identifier) => {
        // Return a mapping on first call, undefined on second call
        if (mockMappingStore.getMapping.mock.calls.length === 1) {
          return {
            issueNumber: 123,
            status: 'open',
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: '2023-01-01T00:00:00.000Z',
            testFilePath: '/path/to/test.ts',
            testName: 'Test Suite › test should fail'
          };
        }
        return undefined;
      });

      // Mock syncIssueStatus to return true (successful sync)
      jest.spyOn(bugTracker, 'syncIssueStatus').mockResolvedValue(true);

      const bug = await bugTracker.getBug('test-identifier');

      // Verify that syncIssueStatus was called
      expect(bugTracker.syncIssueStatus).toHaveBeenCalledWith('test-identifier', 123);

      // Verify that getMapping was called twice
      expect(mockMappingStore.getMapping).toHaveBeenCalledTimes(2);

      // Verify that null was returned
      expect(bug).toBeNull();
    });

    it('should return null if an error occurs during getBug', async () => {
      // Mock getMapping to return a mapping
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

      // Mock syncIssueStatus to throw an error
      jest.spyOn(bugTracker, 'syncIssueStatus').mockImplementation(() => {
        throw new Error('Test error');
      });

      // Spy on the logger to verify error logging
      const errorSpy = jest.spyOn(bugTracker.logger, 'error');

      const bug = await bugTracker.getBug('test-identifier');

      // Verify that syncIssueStatus was called
      expect(bugTracker.syncIssueStatus).toHaveBeenCalledWith('test-identifier', 123);

      // Verify that the error was logged
      expect(errorSpy).toHaveBeenCalledWith('Error getting bug information:', expect.any(Error));

      // Verify that null was returned
      expect(bug).toBeNull();

      // Clean up
      errorSpy.mockRestore();
    });
  });

  describe('createBug', () => {
    it('should create a new bug for a test', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Reset the mock to ensure it's clean
      mockMappingStore.getMapping.mockReset();

      // Mock getMapping to return undefined initially (no existing mapping)
      // and then return a valid mapping after setMapping is called
      mockMappingStore.getMapping.mockImplementation((identifier) => {
        // Return undefined on first call, then a mapping on subsequent calls
        if (mockMappingStore.getMapping.mock.calls.length === 1) {
          return undefined;
        }
        return {
          issueNumber: 123,
          status: 'open',
          testFilePath: '/path/to/test.ts',
          testName: 'Test Suite › test should fail',
          lastFailure: '2025-04-06T09:22:03.307Z',
          lastUpdate: '2025-04-06T09:22:03.308Z'
        };
      });

      // Spy on the logger to verify log messages
      const logSpy = jest.spyOn(bugTracker.logger, 'log');

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

      // Verify that the success log message was called
      expect(logSpy).toHaveBeenCalledWith('Bug created successfully:', expect.objectContaining({
        id: '123',
        status: 'open',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName
      }));

      // Clean up
      logSpy.mockRestore();
    });

    it('should throw an error if creating the issue fails', async () => {
      mockGithubClient.createIssue.mockResolvedValue({ success: false, error: 'Failed to create issue' });
      await expect(bugTracker.createBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('Failed to create issue');
    });

    it('should update an existing bug instead of creating a new one', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Reset the mock to ensure it's clean
      mockMappingStore.getMapping.mockReset();

      // Mock getMapping to return an existing mapping
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

      // Spy on the updateBug method
      const updateBugSpy = jest.spyOn(bugTracker, 'updateBug');
      updateBugSpy.mockResolvedValue({
        id: '123',
        status: 'open',
        testIdentifier: 'test-identifier',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: expect.any(String)
      });

      // Call the method
      await bugTracker.createBug(testIdentifier, mockFailingTest, testFilePath);

      // Verify that updateBug was called instead of creating a new issue
      expect(updateBugSpy).toHaveBeenCalledWith(testIdentifier, mockFailingTest, testFilePath);
      expect(mockGithubClient.createIssue).not.toHaveBeenCalled();

      // Clean up
      updateBugSpy.mockRestore();
    });

    it('should throw an error if mapping is not found after creating issue', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Reset the mock to ensure it's clean
      mockMappingStore.getMapping.mockReset();

      // Mock getMapping to return undefined initially (no existing mapping)
      // and then return undefined again after setMapping is called
      mockMappingStore.getMapping.mockImplementation((identifier) => {
        // Return undefined on first call (checking if bug exists)
        // and also on second call (after creating the issue)
        return undefined;
      });

      // Mock GitHub client to return success
      mockGithubClient.createIssue.mockResolvedValue({ success: true, issueNumber: 123 });

      // Call the method and expect it to throw
      await expect(bugTracker.createBug(testIdentifier, mockFailingTest, testFilePath))
        .rejects.toThrow('Failed to get mapping after creating issue');

      // Verify that GitHub client was called
      expect(mockGithubClient.createIssue).toHaveBeenCalled();

      // Verify that setMapping was called
      expect(mockMappingStore.setMapping).toHaveBeenCalled();
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
        expect.objectContaining({
          status: 'closed',
          fixedBy: expect.any(String),
          fixCommit: expect.any(String),
          fixMessage: expect.any(String),
          lastUpdate: expect.any(String)
        }),
        expect.any(Object),
        testFilePath,
        mockPassingTest.fullName
      );
      expect(bug).toEqual(expect.objectContaining({
        id: '123',
        testIdentifier,
        testFilePath,
        testName: mockPassingTest.fullName,
        lastUpdate: expect.any(String)
      }));
    });

    it('should throw an error if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      await expect(bugTracker.closeBug('test-identifier', mockPassingTest, '/path/to/test.ts')).rejects.toThrow('No mapping found for test');
    });

    it('should throw an error if mapping is not found after closing issue', async () => {
      // Mock the mapping store to return a mapping initially, but undefined after updating
      mockMappingStore.getMapping.mockImplementation((identifier) => {
        // Return a mapping on first call, undefined on second call
        if (mockMappingStore.getMapping.mock.calls.length === 1) {
          return {
            issueNumber: 123,
            status: 'open',
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: '2023-01-01T00:00:00.000Z',
            testFilePath: '/path/to/test.ts',
            testName: 'Test Suite › test should fail'
          };
        }
        return undefined;
      });

      // Mock GitHub client to return success
      mockGithubClient.closeIssue.mockResolvedValue({ success: true, issueNumber: 123 });

      // Call the method and expect it to throw
      await expect(bugTracker.closeBug('test-identifier', mockPassingTest, '/path/to/test.ts'))
        .rejects.toThrow('Failed to get mapping after closing issue');
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
        expect.objectContaining({
          status: 'open',
          lastFailure: expect.any(String),
          lastUpdate: expect.any(String)
        }),
        expect.any(Object),
        testFilePath,
        mockFailingTest.fullName
      );
      expect(bug).toEqual(expect.objectContaining({
        id: '123',
        testIdentifier,
        testFilePath,
        testName: mockFailingTest.fullName,
        lastUpdate: expect.any(String)
      }));
    });

    it('should throw an error if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      await expect(bugTracker.reopenBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('No mapping found for test');
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

    it('should throw an error if mapping is not found after reopening issue', async () => {
      // Mock the mapping store to return a mapping initially, but undefined after updating
      mockMappingStore.getMapping.mockImplementation((identifier) => {
        // Return a mapping on first call, undefined on second call
        if (mockMappingStore.getMapping.mock.calls.length === 1) {
          return {
            issueNumber: 123,
            status: 'closed',
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: '2023-01-01T00:00:00.000Z',
            testFilePath: '/path/to/test.ts',
            testName: 'Test Suite › test should fail'
          };
        }
        return undefined;
      });

      // Mock GitHub client to return success
      mockGithubClient.reopenIssue.mockResolvedValue({ success: true, issueNumber: 123 });

      // Call the method and expect it to throw
      await expect(bugTracker.reopenBug('test-identifier', mockFailingTest, '/path/to/test.ts'))
        .rejects.toThrow('Failed to get mapping after reopening issue');
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
        expect.objectContaining({
          lastUpdate: expect.any(String)
        }),
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
        lastUpdate: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should throw an error if adding a comment fails', async () => {
      const testIdentifier = 'test-identifier';
      const testFilePath = '/path/to/test.ts';

      // Mock the mapping store to return a mapping
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath,
        testName: mockFailingTest.fullName
      });

      // Mock GitHub client to return failure when adding a comment
      mockGithubClient.createIssue.mockResolvedValue({ success: false, error: 'Failed to add comment to issue' });

      // Call the method and expect it to throw
      await expect(bugTracker.updateBug(testIdentifier, mockFailingTest, testFilePath))
        .rejects.toThrow('Failed to add comment to issue');
    });

    it('should throw an error if no bug exists for a test', async () => {
      mockMappingStore.getMapping.mockReturnValue(undefined);
      await expect(bugTracker.updateBug('test-identifier', mockFailingTest, '/path/to/test.ts')).rejects.toThrow('No mapping found for test');
    });

    it('should throw an error if mapping is not found after updating issue', async () => {
      // Mock the mapping store to return a mapping initially, but undefined after updating
      mockMappingStore.getMapping.mockImplementation((identifier) => {
        // Return a mapping on first call, undefined on second call
        if (mockMappingStore.getMapping.mock.calls.length === 1) {
          return {
            issueNumber: 123,
            status: 'open',
            lastFailure: '2023-01-01T00:00:00.000Z',
            lastUpdate: '2023-01-01T00:00:00.000Z',
            testFilePath: '/path/to/test.ts',
            testName: 'Test Suite › test should fail'
          };
        }
        return undefined;
      });

      // Call the method and expect it to throw
      await expect(bugTracker.updateBug('test-identifier', mockFailingTest, '/path/to/test.ts'))
        .rejects.toThrow('Failed to get mapping after updating issue');
    });
  });

  describe('syncIssueStatus', () => {
    it('should sync issue status from GitHub', async () => {
      // Mock the mapping store to return a mapping
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

      // Mock GitHub client to return a different status
      mockGithubClient.checkIssueStatus.mockResolvedValue({ success: true, status: 'closed' });

      // Call the method
      const result = await bugTracker.syncIssueStatus('test-identifier');

      // Verify the result and that the mapping was updated
      expect(result).toBe(true);
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        'test-identifier',
        { status: 'closed' },
        expect.objectContaining({
          author: 'Test Author',
          commit: '1234567890abcdef',
          message: 'Test commit message'
        }),
        '/path/to/test.ts',
        'Test Suite › test should fail'
      );
    });

    it('should handle missing testFilePath and testName in mapping', async () => {
      // Mock the mapping store to return a mapping without testFilePath and testName
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z'
        // testFilePath and testName are intentionally missing
      });

      // Mock GitHub client to return a different status
      mockGithubClient.checkIssueStatus.mockResolvedValue({ success: true, status: 'closed' });

      // Call the method
      const result = await bugTracker.syncIssueStatus('test-identifier');

      // Verify the result and that the mapping was updated with empty strings for missing fields
      expect(result).toBe(true);
      expect(mockMappingStore.updateMapping).toHaveBeenCalledWith(
        'test-identifier',
        { status: 'closed' },
        expect.objectContaining({
          author: 'Test Author',
          commit: '1234567890abcdef',
          message: 'Test commit message'
        }),
        '', // Empty string for missing testFilePath
        ''  // Empty string for missing testName
      );
    });

    it('should handle errors when checking issue status', async () => {
      // Mock the mapping store to return a mapping
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

      // Mock GitHub client to return an error
      mockGithubClient.checkIssueStatus.mockResolvedValue({ success: false, error: 'Failed to check issue status' });

      // Call the method and expect it to return false
      const result = await bugTracker.syncIssueStatus('test-identifier');
      expect(result).toBe(false);
    });

    it('should return false if no mapping exists', async () => {
      // Mock the mapping store to return undefined
      mockMappingStore.getMapping.mockReturnValue(undefined);

      // Call the method and expect it to return false
      const result = await bugTracker.syncIssueStatus('test-identifier');
      expect(result).toBe(false);
    });

    it('should not update mapping if status is already in sync', async () => {
      // Mock the mapping store to return a mapping with the same status as GitHub
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

      // Mock GitHub client to return the same status
      mockGithubClient.checkIssueStatus.mockResolvedValue({ success: true, status: 'open' });

      // Call the method
      const result = await bugTracker.syncIssueStatus('test-identifier');

      // Verify the result and that the mapping was not updated
      expect(result).toBe(true);
      expect(mockMappingStore.updateMapping).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors during sync', async () => {
      // Mock the mapping store to return a mapping
      mockMappingStore.getMapping.mockReturnValue({
        issueNumber: 123,
        status: 'open',
        lastFailure: '2023-01-01T00:00:00.000Z',
        lastUpdate: '2023-01-01T00:00:00.000Z',
        testFilePath: '/path/to/test.ts',
        testName: 'Test Suite › test should fail'
      });

      // Mock GitHub client to throw an exception
      mockGithubClient.checkIssueStatus.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Call the method
      const result = await bugTracker.syncIssueStatus('test-identifier');

      // Verify the result
      expect(result).toBe(false);
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

    it('should handle errors when getting all bugs', async () => {
      // Mock the mapping store to throw an error
      mockMappingStore.getAllMappings.mockImplementation(() => {
        throw new Error('Failed to get mappings');
      });

      // Call the method and expect it to return an empty object
      const bugs = await bugTracker.getAllBugs();
      expect(bugs).toEqual({});
    });
  });
});
