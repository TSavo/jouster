/**
 * Core types for the test issue tracker
 */

/**
 * Represents a test result with all necessary information
 */
export interface TestResult {
  /** Full path to the test file */
  testFilePath: string;
  /** Name of the test suite */
  testSuiteName: string;
  /** Name of the individual test */
  testName: string;
  /** Whether the test passed or failed */
  status: 'passed' | 'failed';
  /** Error message if the test failed */
  errorMessage?: string;
  /** Error stack trace if the test failed */
  errorStack?: string;
  /** Duration of the test in milliseconds */
  duration?: number;
}

/**
 * Unique identifier for a test
 */
export type TestIdentifier = string;

/**
 * Status of a GitHub issue
 */
export type IssueStatus = 'open' | 'closed';

/**
 * Entry in the mapping database for a test
 */
export interface TestIssueMapping {
  /** GitHub issue number */
  issueNumber: number;
  /** Current status of the issue */
  status: IssueStatus;
  /** ISO timestamp of the last failure */
  lastFailure: string;
  /** ISO timestamp of the last update to the issue */
  lastUpdate: string;
}

/**
 * Complete mapping database structure
 */
export interface MappingDatabase {
  /** Map of test identifiers to issue information */
  testIdentifiers: Record<TestIdentifier, TestIssueMapping>;
}

/**
 * Options for the issue tracker
 */
export interface IssueTrackerOptions {
  /** Whether to generate new issues for failing tests */
  generateIssues: boolean;
  /** Whether to track and close issues for passing tests */
  trackIssues: boolean;
  /** Path to the mapping database file */
  databasePath?: string;
}

/**
 * Result of a GitHub operation
 */
export interface GitHubOperationResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Issue number if applicable */
  issueNumber?: number;
  /** Error message if the operation failed */
  error?: string;
}
