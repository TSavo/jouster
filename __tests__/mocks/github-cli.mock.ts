/**
 * Mock for GitHub CLI commands
 */

import { GitHubOperationResult } from '../../types';

describe('GitHub CLI Mocks', () => {
  it('should provide mock implementations', () => {
    // This test is just to prevent the "Your test suite must contain at least one test" error
    expect(mockGitHubCliAvailable).toBeDefined();
    expect(mockGitHubCliUnavailable).toBeDefined();
    expect(mockCreateIssueSuccess).toBeDefined();
    expect(mockCreateIssueFailure).toBeDefined();
    expect(mockCloseIssueSuccess).toBeDefined();
    expect(mockCloseIssueFailure).toBeDefined();
  });
});

// Mock for successful GitHub CLI availability check
export const mockGitHubCliAvailable = jest.fn().mockResolvedValue(true);

// Mock for failed GitHub CLI availability check
export const mockGitHubCliUnavailable = jest.fn().mockResolvedValue(false);

// Mock for successful issue creation
export const mockCreateIssueSuccess = jest.fn().mockImplementation(
  (title: string, body: string, labels: string[] = []): Promise<GitHubOperationResult> => {
    return Promise.resolve({
      success: true,
      issueNumber: 123
    });
  }
);

// Mock for failed issue creation
export const mockCreateIssueFailure = jest.fn().mockImplementation(
  (title: string, body: string, labels: string[] = []): Promise<GitHubOperationResult> => {
    return Promise.resolve({
      success: false,
      error: 'Failed to create issue'
    });
  }
);

// Mock for successful issue closure
export const mockCloseIssueSuccess = jest.fn().mockImplementation(
  (issueNumber: number, comment?: string): Promise<GitHubOperationResult> => {
    return Promise.resolve({
      success: true,
      issueNumber
    });
  }
);

// Mock for failed issue closure
export const mockCloseIssueFailure = jest.fn().mockImplementation(
  (issueNumber: number, comment?: string): Promise<GitHubOperationResult> => {
    return Promise.resolve({
      success: false,
      issueNumber,
      error: 'Failed to close issue'
    });
  }
);

// Reset all mocks
export const resetGitHubCliMocks = (): void => {
  mockGitHubCliAvailable.mockClear();
  mockGitHubCliUnavailable.mockClear();
  mockCreateIssueSuccess.mockClear();
  mockCreateIssueFailure.mockClear();
  mockCloseIssueSuccess.mockClear();
  mockCloseIssueFailure.mockClear();
};
