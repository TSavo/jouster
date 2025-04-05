import { TestResult } from '../types';
import { Bug } from './bug.interface';

/**
 * Interface for bug trackers
 */
export interface IBugTracker {
  /**
   * Initialize the bug tracker
   */
  initialize(): Promise<void>;

  /**
   * Check if a bug exists for a test
   *
   * @param testIdentifier Test identifier
   * @returns True if a bug exists, false otherwise
   */
  bugExists(testIdentifier: string): Promise<boolean>;

  /**
   * Get bug information
   *
   * @param testIdentifier Test identifier
   * @returns Bug information or null if not found
   */
  getBug(testIdentifier: string): Promise<Bug | null>;

  /**
   * Create a new bug
   *
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  createBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<Bug>;

  /**
   * Close a bug
   *
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  closeBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<Bug>;

  /**
   * Reopen a bug
   *
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  reopenBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<Bug>;

  /**
   * Update a bug
   *
   * @param testIdentifier Test identifier
   * @param test Test result
   * @param testFilePath Test file path
   * @returns Bug information
   */
  updateBug(testIdentifier: string, test: TestResult, testFilePath: string): Promise<Bug>;

  /**
   * Get all bugs
   *
   * @returns All bugs
   */
  getAllBugs(): Promise<Record<string, Bug>>;
}

/**
 * Bug information
 */
export interface BugInfo extends Bug {

  /**
   * Test name
   */
  testName?: string;

  /**
   * Last failure time
   */
  lastFailure?: string;

  /**
   * Last update time
   */
  lastUpdate?: string;

  /**
   * Fixed by
   */
  fixedBy?: string;

  /**
   * Fix commit
   */
  fixCommit?: string;

  /**
   * Fix message
   */
  fixMessage?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}
