// @ts-nocheck
import { jest } from '@jest/globals';
import { GitHubRestClient } from '../../github/github-rest-client';

// Mock fetch
global.fetch = jest.fn();

describe('GitHubRestClient', () => {
  let githubClient: GitHubRestClient;
  const mockToken = 'mock-token';
  const mockRepo = 'owner/repo';

  beforeEach(() => {
    jest.clearAllMocks();
    githubClient = new GitHubRestClient(mockToken, mockRepo);
  });

  describe('isGitHubCliAvailable', () => {
    it('should always return true since REST API does not depend on CLI', async () => {
      const result = await githubClient.isGitHubCliAvailable();
      expect(result).toBe(true);
    });
  });

  describe('createIssue', () => {
    it('should create an issue using the GitHub REST API', async () => {
      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ number: 123 })
      });

      const result = await githubClient.createIssue(
        'Test Issue',
        'This is a test issue',
        ['bug']
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);
      expect(result.error).toBeUndefined();

      // Verify the fetch call
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/issues',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token mock-token',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            title: 'Test Issue',
            body: 'This is a test issue',
            labels: ['bug']
          })
        }
      );
    });

    it('should handle errors when creating an issue', async () => {
      // Mock error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({ message: 'Validation failed' })
      });

      const result = await githubClient.createIssue(
        'Test Issue',
        'This is a test issue',
        ['bug']
      );

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error creating issue: Validation failed (422 Unprocessable Entity)');
    });

    it('should handle network errors', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await githubClient.createIssue(
        'Test Issue',
        'This is a test issue',
        ['bug']
      );

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error creating issue: Network error');
    });

    it('should handle non-Error objects in catch block', async () => {
      // Mock a non-Error object rejection
      global.fetch.mockRejectedValueOnce('String error');

      const result = await githubClient.createIssue(
        'Test Issue',
        'This is a test issue',
        ['bug']
      );

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error creating issue: String error');
    });
  });

  describe('reopenIssue', () => {
    it('should reopen an issue using the GitHub REST API', async () => {
      // Mock successful response for updating the issue
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ number: 123, state: 'open' })
      });

      // Mock successful response for adding a comment
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 456 })
      });

      const result = await githubClient.reopenIssue(123, 'Reopening issue');

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);
      expect(result.error).toBeUndefined();

      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // First call should update the issue state
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.github.com/repos/owner/repo/issues/123',
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'token mock-token',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            state: 'open'
          })
        }
      );

      // Second call should add a comment
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.github.com/repos/owner/repo/issues/123/comments',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token mock-token',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            body: 'Reopening issue'
          })
        }
      );
    });

    it('should handle errors when reopening an issue', async () => {
      // Mock error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Issue not found' })
      });

      const result = await githubClient.reopenIssue(123, 'Reopening issue');

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error reopening issue: Issue not found (404 Not Found)');
    });

    it('should handle network errors when reopening an issue', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await githubClient.reopenIssue(123, 'Reopening issue');

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error reopening issue: Network error');
    });

    it('should handle non-Error objects in catch block when reopening an issue', async () => {
      // Mock a non-Error object rejection
      global.fetch.mockRejectedValueOnce('String error');

      const result = await githubClient.reopenIssue(123, 'Reopening issue');

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error reopening issue: String error');
    });
  });

  describe('closeIssue', () => {
    it('should close an issue using the GitHub REST API', async () => {
      // Mock successful response for updating the issue
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ number: 123, state: 'closed' })
      });

      // Mock successful response for adding a comment
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 456 })
      });

      const result = await githubClient.closeIssue(123, 'Closing issue');

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.issueNumber).toBe(123);
      expect(result.error).toBeUndefined();

      // Verify the fetch calls
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // First call should update the issue state
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        'https://api.github.com/repos/owner/repo/issues/123',
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'token mock-token',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            state: 'closed'
          })
        }
      );

      // Second call should add a comment
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        'https://api.github.com/repos/owner/repo/issues/123/comments',
        {
          method: 'POST',
          headers: {
            'Authorization': 'token mock-token',
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            body: 'Closing issue'
          })
        }
      );
    });

    it('should handle errors when closing an issue', async () => {
      // Mock error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Issue not found' })
      });

      const result = await githubClient.closeIssue(123, 'Closing issue');

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error closing issue: Issue not found (404 Not Found)');
    });

    it('should handle network errors when closing an issue', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await githubClient.closeIssue(123, 'Closing issue');

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error closing issue: Network error');
    });

    it('should handle non-Error objects in catch block when closing an issue', async () => {
      // Mock a non-Error object rejection
      global.fetch.mockRejectedValueOnce('String error');

      const result = await githubClient.closeIssue(123, 'Closing issue');

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.issueNumber).toBeUndefined();
      expect(result.error).toBe('Error closing issue: String error');
    });
  });

  describe('checkIssueStatus', () => {
    it('should check the status of an issue using the GitHub REST API', async () => {
      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          state: 'open',
          number: 123
        })
      });

      const result = await githubClient.checkIssueStatus(123);

      // Verify the API call
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/owner/repo/issues/123',
        {
          method: 'GET',
          headers: {
            'Authorization': 'token mock-token',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          }
        }
      );

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.status).toBe('open');
    });

    it('should handle closed issues when checking status', async () => {
      // Mock successful response with closed state
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          state: 'closed',
          number: 123
        })
      });

      const result = await githubClient.checkIssueStatus(123);

      // Verify the result
      expect(result.success).toBe(true);
      expect(result.status).toBe('closed');
    });

    it('should handle API errors when checking issue status', async () => {
      // Mock error response
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: jest.fn().mockResolvedValue({
          message: 'Issue not found'
        })
      });

      const result = await githubClient.checkIssueStatus(123);

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.status).toBeUndefined();
      expect(result.error).toBe('Error checking issue status: Issue not found (404 Not Found)');
    });

    it('should handle network errors when checking issue status', async () => {
      // Mock network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await githubClient.checkIssueStatus(123);

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.status).toBeUndefined();
      expect(result.error).toBe('Error checking issue status: Network error');
    });

    it('should handle non-Error objects in catch block when checking issue status', async () => {
      // Mock a non-Error object rejection
      global.fetch.mockRejectedValueOnce('String error');

      const result = await githubClient.checkIssueStatus(123);

      // Verify the result
      expect(result.success).toBe(false);
      expect(result.status).toBeUndefined();
      expect(result.error).toBe('Error checking issue status: String error');
    });
  });
});
