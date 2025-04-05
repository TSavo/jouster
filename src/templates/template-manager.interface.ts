import { TestResult, ErrorInfo, GitInfo } from '../types';

/**
 * Interface for template manager
 */
export interface ITemplateManager {
  /**
   * Generate issue body from test result
   *
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Issue body
   */
  generateIssueBody(test: TestResult, testFilePath: string): Promise<string> | string;

  /**
   * Generate comment body from test result
   *
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Comment body
   */
  generateCommentBody(test: TestResult, testFilePath: string): Promise<string> | string;

  /**
   * Generate reopen body from test result
   *
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Reopen body
   */
  generateReopenBody(test: TestResult, testFilePath: string): Promise<string> | string;

  /**
   * Extract error information from failure messages
   *
   * @param failureMessages Failure messages
   * @returns Error information
   */
  extractErrorInfo(failureMessages: string[]): ErrorInfo;

  /**
   * Get git information
   *
   * @returns Git information
   */
  getGitInfo(): GitInfo;

  /**
   * Register a template data hook
   *
   * @param hook Hook to register
   */
  registerHook?(hook: any): void;
}
