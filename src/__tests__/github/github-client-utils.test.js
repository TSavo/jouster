// Import the GitHubClient and GitHubOperationResult
const { GitHubClient, GitHubOperationResult } = require('../../github/github-client');

describe('GitHubClient Utils', () => {
  let client;

  beforeEach(() => {
    // Create a new client instance
    client = new GitHubClient();
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

    it('should handle null and undefined', () => {
      expect(client.formatErrorMessage(null)).toBe('null');
      expect(client.formatErrorMessage(undefined)).toBe('undefined');
    });

    it('should handle objects', () => {
      const error = { message: 'Object error' };
      const result = client.formatErrorMessage(error);
      expect(result).toBe('[object Object]');
    });

    it('should handle numbers', () => {
      const error = 123;
      const result = client.formatErrorMessage(error);
      expect(result).toBe('123');
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

    it('should return 0 if URL is undefined', () => {
      const url = undefined;
      const result = client.extractIssueNumber(url);
      expect(result).toBe(0);
    });

    it('should return 0 if URL is empty string', () => {
      const url = '';
      const result = client.extractIssueNumber(url);
      expect(result).toBe(0);
    });

    it('should extract issue number from any URL with a number at the end', () => {
      const url = 'https://github.com/owner/repo/pull/123';
      const result = client.extractIssueNumber(url);
      expect(result).toBe(123);
    });
  });
});
