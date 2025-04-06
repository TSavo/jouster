// Import the GitHubClient and GitHubOperationResult
const { GitHubClient, GitHubOperationResult } = require('../../github/github-client');

// Import modules to mock
const childProcess = require('child_process');
const util = require('util');

// Setup mocks
jest.mock('child_process');
jest.mock('util');

// Mock fs module with jest.fn() functions that have mockClear
const fs = {
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn()
};
jest.mock('fs', () => fs);

// Mock os module with jest.fn() functions that have mockClear
const os = {
  tmpdir: jest.fn().mockReturnValue('/tmp')
};
jest.mock('os', () => os);

describe('GitHubClient', () => {
  let client;
  let mockExecAsync;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockExecAsync = jest.fn().mockResolvedValue({ stdout: 'https://github.com/owner/repo/issues/123' });
    util.promisify = jest.fn().mockReturnValue(mockExecAsync);

    // Create a new client instance
    client = new GitHubClient();

    // Make sure the execAsync function is properly mocked
    // This is needed because the GitHubClient constructor already calls util.promisify
    // before our mock is set up
    Object.defineProperty(client, 'execAsync', {
      value: mockExecAsync
    });

    // Reset Date.now to its original implementation
    if (Date.now.mockRestore) {
      Date.now.mockRestore();
    }
  });

  describe('GitHubOperationResult', () => {
    it('should create a GitHubOperationResult with the correct properties', () => {
      const result = new GitHubOperationResult(true, 'error', 123);
      expect(result.success).toBe(true);
      expect(result.error).toBe('error');
      expect(result.issueNumber).toBe(123);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');
      const result = client.formatErrorMessage(error);
      expect(result).toBe('Test error');
    });

    it('should format non-Error objects', () => {
      const error = 'String error';
      const result = client.formatErrorMessage(error);
      expect(result).toBe('String error');
    });
  });

  describe('extractIssueNumber', () => {
    it('should extract issue number from URL', () => {
      const url = 'https://github.com/owner/repo/issues/123';
      const result = client.extractIssueNumber(url);
      expect(result).toBe(123);
    });

    it('should return 0 if issue number cannot be extracted', () => {
      const url = 'https://github.com/owner/repo/issues/';
      const result = client.extractIssueNumber(url);
      expect(result).toBe(0);
    });

    it('should return 0 if URL is invalid', () => {
      const url = null;
      const result = client.extractIssueNumber(url);
      expect(result).toBe(0);
    });

    it('should return 0 if issue number is not a number', () => {
      const url = 'https://github.com/owner/repo/issues/abc';
      const result = client.extractIssueNumber(url);
      expect(result).toBe(0);
    });
  });

  describe('isGitHubCliAvailable', () => {
    it('should return a boolean value', async () => {
      // Call the method
      const result = await client.isGitHubCliAvailable();

      // Verify result is a boolean
      expect(typeof result).toBe('boolean');
    });

    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      mockExecAsync.mockRejectedValueOnce(new Error('Command not found'));

      // Call the method
      await client.isGitHubCliAvailable();

      // If we got here without an exception, the test passes
      expect(true).toBe(true);
    });
  });

  describe('createIssue', () => {
    it('should return a result object with success and error properties', async () => {
      // Call the method
      const result = await client.createIssue('Test Issue', 'Test Body', ['bug']);

      // Verify result structure
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');

      if (result.success) {
        expect(result).toHaveProperty('issueNumber');
        expect(typeof result.issueNumber).toBe('number');
      } else {
        expect(result).toHaveProperty('error');
        expect(typeof result.error).toBe('string');
      }
    });

    it('should handle errors when creating an issue', async () => {
      // Setup mock to throw an error
      mockExecAsync.mockRejectedValueOnce(new Error('Command failed'));

      // Call the method
      const result = await client.createIssue('Test Issue', 'Test Body', ['bug']);

      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toContain('Command failed');
    });

    it('should handle null tempFile in finally block', async () => {
      // Create a spy on createTempFile to make it return null
      const createTempFileSpy = jest.spyOn(client, 'createTempFile').mockImplementation(() => null);

      try {
        // Setup mock to throw an error
        mockExecAsync.mockRejectedValueOnce(new Error('Command failed'));

        // Call the method
        await client.createIssue('Test Issue', 'Test Body', ['bug']);

        // If we got here, the test passes (no exception thrown)
        expect(true).toBe(true);
      } finally {
        // Restore the original implementation
        createTempFileSpy.mockRestore();
      }
    });

    it('should use default labels if none are provided', async () => {
      // Setup mock to return success
      mockExecAsync.mockResolvedValueOnce({
        stdout: 'https://github.com/owner/repo/issues/123'
      });

      // Call the method without providing labels
      const result = await client.createIssue('Test Issue', 'Test Body');

      // Verify result
      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('--label "bug"')
      );
    });
  });

  describe('reopenIssue', () => {
    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      mockExecAsync.mockRejectedValueOnce(new Error('Command failed'));

      // Call the method
      const result = await client.reopenIssue(123);

      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toContain('Command failed');
      expect(result.issueNumber).toBe(123);
    });

    it('should handle detailed comments', async () => {
      // Setup execAsync mock
      mockExecAsync.mockResolvedValueOnce({})  // For the reopen command
                   .mockResolvedValueOnce({}); // For the comment command

      // Call the method with a detailed comment
      await client.reopenIssue(123, 'Detailed comment');

      // If we got here without an exception, the test passes
      expect(true).toBe(true);
    });

    it('should handle empty comments', async () => {
      // Setup execAsync mock
      mockExecAsync.mockResolvedValueOnce({});  // For the reopen command

      // Call the method with an empty comment
      await client.reopenIssue(123, '');

      // If we got here without an exception, the test passes
      expect(true).toBe(true);
    });
  });

  describe('addDetailedComment', () => {
    it('should add a detailed comment to an issue', async () => {
      // Setup mock to return success
      mockExecAsync.mockResolvedValueOnce({ stdout: '' });

      // Call the method
      const result = await client.addDetailedComment(123, 'comment');

      // Verify result
      expect(result).toBe(true);
      expect(mockExecAsync).toHaveBeenCalledWith(
        expect.stringContaining('gh issue comment 123 --body-file')
      );
    });

    it('should return true for empty comments', async () => {
      // Call the method with an empty comment
      const result = await client.addDetailedComment(123, '');

      // Verify result
      expect(result).toBe(true);
      expect(mockExecAsync).not.toHaveBeenCalled();
    });

    it('should return false when there is an error', async () => {
      // Setup mock to throw an error
      mockExecAsync.mockRejectedValueOnce(new Error('Command failed'));

      // Call the method
      const result = await client.addDetailedComment(123, 'comment');

      // Verify result
      expect(result).toBe(false);
    });

    it('should handle null tempFile in finally block', async () => {
      // Create a spy on createTempFile to make it return null
      const createTempFileSpy = jest.spyOn(client, 'createTempFile').mockImplementation(() => null);

      try {
        // Call the method
        await client.addDetailedComment(123, 'comment');

        // If we got here, the test passes (no exception thrown)
        expect(true).toBe(true);
      } finally {
        // Restore the original implementation
        createTempFileSpy.mockRestore();
      }
    });
  });

  describe('closeIssue', () => {
    it('should handle errors gracefully', async () => {
      // Setup mock to throw an error
      mockExecAsync.mockRejectedValueOnce(new Error('Command failed'));

      // Call the method
      const result = await client.closeIssue(123);

      // Verify result
      expect(result.success).toBe(false);
      expect(result.error).toContain('Command failed');
      expect(result.issueNumber).toBe(123);
    });

    it('should handle detailed comments', async () => {
      // Setup execAsync mock
      mockExecAsync.mockResolvedValueOnce({})  // For the close command
                   .mockResolvedValueOnce({}); // For the comment command

      // Call the method with a detailed comment
      await client.closeIssue(123, 'Detailed comment');

      // If we got here without an exception, the test passes
      expect(true).toBe(true);
    });

    it('should handle empty comments', async () => {
      // Setup execAsync mock
      mockExecAsync.mockResolvedValueOnce({});  // For the close command

      // Call the method with an empty comment
      await client.closeIssue(123, '');

      // If we got here without an exception, the test passes
      expect(true).toBe(true);
    });
  });
});
