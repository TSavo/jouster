/**
 * Result of a GitHub issue operation
 */
export interface IssueResult {
  success: boolean;
  issueNumber?: number;
  error?: string;
}

/**
 * Interface for GitHub client
 */
export interface IGitHubClient {
  /**
   * Check if GitHub CLI is available
   */
  isGitHubCliAvailable(): Promise<boolean>;
  
  /**
   * Create a new GitHub issue
   * 
   * @param title Issue title
   * @param body Issue body
   * @param labels Optional labels to apply to the issue
   */
  createIssue(title: string, body: string, labels?: string[]): Promise<IssueResult>;
  
  /**
   * Reopen an existing GitHub issue
   * 
   * @param issueNumber Issue number
   * @param comment Comment to add when reopening the issue
   */
  reopenIssue(issueNumber: number, comment: string): Promise<IssueResult>;
  
  /**
   * Close an existing GitHub issue
   * 
   * @param issueNumber Issue number
   * @param comment Comment to add when closing the issue
   */
  closeIssue(issueNumber: number, comment: string): Promise<IssueResult>;
}
