import { jest } from '@jest/globals';
import { GitHubClient } from '../../github/github-client';

// Mock child_process module
jest.mock('child_process', () => require('../mocks/child-process.mock'), { virtual: true });
jest.mock('fs', () => require('../mocks/fs.mock'), { virtual: true });

describe('GitHubClient', () => {
  let githubClient: GitHubClient;

  beforeEach(() => {
    githubClient = new GitHubClient(['bug']);
  });

  describe('isGitHubCliAvailable', () => {
    it('should return true if GitHub CLI is available', async () => {
      const result = await githubClient.isGitHubCliAvailable();
      expect(result).toBe(true);
    });

    it('should return false if GitHub CLI is not available', async () => {
      const { exec } = require('child_process');
      exec.mockImplementationOnce((command: string, callback: Function) => {
        callback(new Error('Command not found: gh'));
      });

      const result = await githubClient.isGitHubCliAvailable();
      expect(result).toBe(false);
    });
  });

  describe('createIssue', () => {
    it('should create an issue successfully', async () => {
      const result = await githubClient.createIssue('Test Issue', 'Test Body', ['bug']);

      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);

      const { exec } = require('child_process');
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('gh issue create --title "Test Issue"'),
        expect.any(Function)
      );
    });

    it('should use default labels if none are provided', async () => {
      await githubClient.createIssue('Test Issue', 'Test Body');

      const { exec } = require('child_process');
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('--label "bug"'),
        expect.any(Function)
      );
    });

    it('should handle errors when creating an issue', async () => {
      const { exec } = require('child_process');
      exec.mockImplementationOnce((command: string, callback: Function) => {
        callback(new Error('Failed to create issue'));
      });

      const result = await githubClient.createIssue('Test Issue', 'Test Body');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create issue');
    });
  });

  describe('reopenIssue', () => {
    it('should reopen an issue successfully', async () => {
      const result = await githubClient.reopenIssue(123, 'Test Comment');

      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);

      const { exec } = require('child_process');
      expect(exec).toHaveBeenCalledWith(
        'gh issue reopen 123',
        expect.any(Function)
      );
      expect(exec).toHaveBeenCalledWith(
        expect.stringContaining('gh issue comment 123 --body-file'),
        expect.any(Function)
      );
    });

    it('should handle errors when reopening an issue', async () => {
      const { exec } = require('child_process');
      exec.mockImplementationOnce((command: string, callback: Function) => {
        callback(new Error('Failed to reopen issue'));
      });

      const result = await githubClient.reopenIssue(123, 'Test Comment');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to reopen issue');
    });
  });

  describe('closeIssue', () => {
    it('should close an issue successfully', async () => {
      const result = await githubClient.closeIssue(123, 'Test Comment');

      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);

      const { exec } = require('child_process');
      expect(exec).toHaveBeenCalledWith(
        'gh issue close 123 --comment "Test Comment"',
        expect.any(Function)
      );
    });

    it('should handle errors when closing an issue', async () => {
      const { exec } = require('child_process');
      exec.mockImplementationOnce((command: string, callback: Function) => {
        callback(new Error('Failed to close issue'));
      });

      const result = await githubClient.closeIssue(123, 'Test Comment');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to close issue');
    });
  });

  describe('extractIssueNumber', () => {
    it('should extract issue number from URL', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['extractIssueNumber']('https://github.com/owner/repo/issues/123');
      expect(result).toBe(123);
    });

    it('should handle invalid URLs', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['extractIssueNumber']('invalid-url');
      expect(result).toBe(0);
    });

    it('should handle URLs with non-numeric issue numbers', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['extractIssueNumber']('https://github.com/owner/repo/issues/abc');
      expect(result).toBe(0);
    });

    it('should handle errors during extraction', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['extractIssueNumber'](null as any);
      expect(result).toBe(0);
    });

    it('should handle errors thrown by parseIssueNumber', () => {
      // Mock parseIssueNumber to throw an error
      // @ts-ignore - Accessing private method for testing
      const originalMethod = githubClient['parseIssueNumber'];
      // @ts-ignore - Mocking private method
      githubClient['parseIssueNumber'] = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      // Call the method that should catch the error
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['extractIssueNumber']('https://github.com/owner/repo/issues/123');

      // Verify that it returns 0 when an error is thrown
      expect(result).toBe(0);

      // Restore the original method
      // @ts-ignore - Restoring private method
      githubClient['parseIssueNumber'] = originalMethod;
    });
  });

  describe('parseIssueNumber', () => {
    it('should parse the issue number from a GitHub issue URL', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['parseIssueNumber']('https://github.com/owner/repo/issues/123');
      expect(result).toBe(123);
    });

    it('should return 0 if the issue number is not a number', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['parseIssueNumber']('https://github.com/owner/repo/issues/abc');
      expect(result).toBe(0);
    });

    it('should return 0 if the URL has no parts', () => {
      // @ts-ignore - Accessing private method for testing
      const result = githubClient['parseIssueNumber']('');
      expect(result).toBe(0);
    });
  });

  describe('formatErrorMessage', () => {
    it('should format Error objects', () => {
      const error = new Error('Test error');

      // @ts-ignore - Accessing private method for testing
      const result = githubClient['formatErrorMessage'](error);

      expect(result).toBe('Test error');
    });

    it('should format non-Error objects', () => {
      const error = 'String error';

      // @ts-ignore - Accessing private method for testing
      const result = githubClient['formatErrorMessage'](error);

      expect(result).toBe('String error');
    });

    it('should handle null and undefined', () => {
      // @ts-ignore - Accessing private method for testing
      const result1 = githubClient['formatErrorMessage'](null);
      // @ts-ignore - Accessing private method for testing
      const result2 = githubClient['formatErrorMessage'](undefined);

      expect(result1).toBe('null');
      expect(result2).toBe('undefined');
    });
  });
});
