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
