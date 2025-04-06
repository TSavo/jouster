/**
 * Git information
 */
export interface GitInfo {
  author?: string;
  commit?: string;
  branch?: string;
  message?: string;
}

/**
 * Issue status
 */
export type IssueStatus = 'open' | 'closed';

/**
 * Test identifier
 */
export type TestIdentifier = string;

/**
 * GitHub operation result
 */
export interface GitHubOperationResult {
  success: boolean;
  issueNumber?: number;
  error?: string;
}

/**
 * Issue tracker options
 */
export interface IssueTrackerOptions {
  generateIssues?: boolean;
  trackIssues?: boolean;
  closeIssues?: boolean;
  reopenIssues?: boolean;
  databasePath?: string;
  templateDir?: string;
  defaultLabels?: string[];
  githubLabels?: string[];
}

/**
 * Mapping database
 */
export interface MappingDatabase {
  testIdentifiers: {
    [key: string]: IssueMapping;
  };
}

/**
 * Issue mapping
 */
export interface IssueMapping {
  issueNumber: number;
  status: string;
  lastFailure?: string;
  lastUpdate?: string;
  fixedBy?: string;
  fixCommit?: string;
  fixMessage?: string;
  testFilePath?: string;
  testName?: string;
}

/**
 * Test issue mapping
 */
export type TestIssueMapping = IssueMapping;

/**
 * Error information
 */
export interface ErrorInfo {
  message: string;
  stack: string;
  type: string;
  lineNumber: number;
  location: string;
}

/**
 * Test result
 */
export interface TestResult {
  ancestorTitles: string[];
  duration: number;
  failureMessages: string[];
  fullName: string;
  location: string;
  numPassingAsserts: number;
  status: string;
  title: string;
  testFilePath?: string;
  testName?: string;
  testSuiteName?: string;
  errorMessage?: string;
  errorStack?: string;
}

/**
 * Jest reporter options
 */
export interface ReporterOptions {
  generateIssues?: boolean;
  trackIssues?: boolean;
  closeIssues?: boolean;
  reopenIssues?: boolean;
  databasePath?: string;
  templateDir?: string;
  defaultLabels?: string[];
}
