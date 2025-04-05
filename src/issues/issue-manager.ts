import { IIssueManager } from './issue-manager.interface';
import { IBugTracker } from '../trackers/bug-tracker.interface';
import { PluginManager } from '../plugins/plugin-manager';
import { TestResult } from '../types';
import { generateTestIdentifier } from '../utils/test-identifier';
import { FilterUtils } from '../utils/filter-utils';
import { IssueTrackerConfig } from '../config';

/**
 * Issue manager implementation
 */
export class IssueManager implements IIssueManager {
  private bugTracker: IBugTracker;
  private pluginManager: PluginManager;
  private generateIssues: boolean;
  private trackIssues: boolean;
  private closeIssues: boolean;
  private reopenIssues: boolean;
  private filterUtils: FilterUtils;
  private config: Partial<IssueTrackerConfig>;

  /**
   * Creates a new issue manager
   *
   * @param bugTracker Bug tracker
   * @param pluginManager Plugin manager
   * @param options Options
   */
  constructor(
    bugTracker: IBugTracker,
    pluginManager: PluginManager,
    options?: {
      generateIssues?: boolean;
      trackIssues?: boolean;
      closeIssues?: boolean;
      reopenIssues?: boolean;
      config?: Partial<IssueTrackerConfig>;
    }
  ) {
    this.bugTracker = bugTracker;
    this.pluginManager = pluginManager;

    // Initialize options with defaults
    const defaultedOptions = this.initializeOptions(options);

    this.generateIssues = defaultedOptions.generateIssues;
    this.trackIssues = defaultedOptions.trackIssues;
    this.closeIssues = defaultedOptions.closeIssues;
    this.reopenIssues = defaultedOptions.reopenIssues;

    // Config is guaranteed to be initialized in initializeOptions
    this.config = defaultedOptions.config;

    // Initialize filter utils
    this.filterUtils = new FilterUtils(this.config);
  }

  /**
   * Initialize options with defaults
   *
   * @param options Options object or undefined
   * @returns Options with defaults applied
   */
  private initializeOptions(options?: any): {
    generateIssues: boolean;
    trackIssues: boolean;
    closeIssues: boolean;
    reopenIssues: boolean;
    config: Partial<IssueTrackerConfig>;
  } {
    const defaultOptions = {
      generateIssues: false,
      trackIssues: false,
      closeIssues: true,
      reopenIssues: true,
      config: {}
    };

    if (!options) {
      return defaultOptions;
    }

    // Ensure config is always an object
    // Using nullish coalescing operator to handle undefined and null
    const config = options.config ?? {};

    // Create a new object with default values
    const result = { ...defaultOptions };

    // Override with provided values if they exist
    if (options.generateIssues !== undefined) result.generateIssues = options.generateIssues;
    if (options.trackIssues !== undefined) result.trackIssues = options.trackIssues;
    if (options.closeIssues !== undefined) result.closeIssues = options.closeIssues;
    if (options.reopenIssues !== undefined) result.reopenIssues = options.reopenIssues;

    // Set the config
    result.config = config;

    return result;
  }

  /**
   * Process test results
   *
   * @param results Test results
   * @param options Reporter options
   */
  public async processTestResults(results: any, options?: any): Promise<void> {
    const mergedOptions = { ...options };

    // Skip processing if both generateIssues and trackIssues are false
    if (!this.generateIssues && !this.trackIssues && !mergedOptions.generateIssues && !mergedOptions.trackIssues) {
      return;
    }

    // Process each test file
    if (results.testResults) {
      for (const testFileResult of results.testResults) {
        await this.processTestFile(testFileResult.testFilePath, testFileResult, mergedOptions);
      }
    }
  }

  /**
   * Process a test file
   *
   * @param testFilePath Test file path
   * @param testFileResult Test file result
   * @param options Reporter options
   */
  public async processTestFile(
    testFilePath: string,
    testFileResult: any,
    options?: any
  ): Promise<void> {
    const mergedOptions = { ...options };

    // Skip processing if both generateIssues and trackIssues are false
    if (!this.generateIssues && !this.trackIssues && !mergedOptions.generateIssues && !mergedOptions.trackIssues) {
      return;
    }

    // Process each test
    if (testFileResult.testResults) {
      for (const test of testFileResult.testResults) {
        // Generate a unique identifier for the test
        const testIdentifier = generateTestIdentifier(testFilePath, test.fullName);

        // Handle the test based on its status
        if (test.status === 'failed') {
          await this.handleFailedTest(testIdentifier, testFilePath, test, mergedOptions);
        } else if (test.status === 'passed') {
          await this.handlePassedTest(testIdentifier, testFilePath, test, mergedOptions);
        }
      }
    }
  }

  /**
   * Handle a failed test
   *
   * @param testIdentifier Test identifier
   * @param testFilePath Test file path
   * @param test Test result
   * @param options Reporter options
   */
  public async handleFailedTest(
    testIdentifier: string,
    testFilePath: string,
    test: TestResult,
    options?: any
  ): Promise<void> {
    try {
      // Skip if test file should not be included based on test filters
      if (!this.filterUtils.shouldIncludeTest(testFilePath)) {
        return;
      }

      // Skip if issue creation should be skipped for this test file
      if (this.filterUtils.shouldSkipIssueCreation(testFilePath)) {
        return;
      }

      // Skip if issues should not be created on the current branch
      if (!this.filterUtils.shouldCreateIssuesOnCurrentBranch()) {
        return;
      }

      const mergedOptions = {
        generateIssues: this.generateIssues,
        trackIssues: this.trackIssues,
        closeIssues: this.closeIssues,
        reopenIssues: this.reopenIssues,
        ...options
      };

      // Check if a bug exists for this test
      const bugExists = await this.bugTracker.bugExists(testIdentifier);

      if (bugExists) {
        // Get the bug
        const bug = await this.bugTracker.getBug(testIdentifier);

        if (!bug) {
          throw new Error(`Bug exists but could not be retrieved: ${testIdentifier}`);
        }

        if (bug.status === 'open') {
          // Update the bug
          await this.bugTracker.updateBug(testIdentifier, test, testFilePath);
        } else if (bug.status === 'closed' && mergedOptions.reopenIssues) {
          // Call plugin hooks
          await this.pluginManager.beforeReopenIssue(test, testFilePath, parseInt(bug.id, 10));

          // Reopen the bug
          await this.bugTracker.reopenBug(testIdentifier, test, testFilePath);

          // Call plugin hooks
          await this.pluginManager.afterReopenIssue(test, testFilePath, parseInt(bug.id, 10));
        }
      } else if (mergedOptions.generateIssues) {
        // Call plugin hooks
        await this.pluginManager.beforeCreateIssue(test, testFilePath);

        // Create a new bug
        const bug = await this.bugTracker.createBug(testIdentifier, test, testFilePath);

        // Call plugin hooks
        await this.pluginManager.afterCreateIssue(test, testFilePath, parseInt(bug.id, 10));
      }
    } catch (error) {
      this.handleError(error, 'Error handling failed test');
    }
  }

  /**
   * Handle a passed test
   *
   * @param testIdentifier Test identifier
   * @param testFilePath Test file path
   * @param test Test result
   * @param options Reporter options
   */
  public async handlePassedTest(
    testIdentifier: string,
    testFilePath: string,
    test: TestResult,
    options?: any
  ): Promise<void> {
    try {
      // Skip if test file should not be included based on test filters
      if (!this.filterUtils.shouldIncludeTest(testFilePath)) {
        return;
      }

      // Skip if issue creation should be skipped for this test file
      if (this.filterUtils.shouldSkipIssueCreation(testFilePath)) {
        return;
      }

      // Skip if issues should not be created on the current branch
      if (!this.filterUtils.shouldCreateIssuesOnCurrentBranch()) {
        return;
      }

      const mergedOptions = {
        generateIssues: this.generateIssues,
        trackIssues: this.trackIssues,
        closeIssues: this.closeIssues,
        reopenIssues: this.reopenIssues,
        ...options
      };

      // Check if a bug exists for this test
      const bugExists = await this.bugTracker.bugExists(testIdentifier);

      if (bugExists && mergedOptions.closeIssues) {
        // Get the bug
        const bug = await this.bugTracker.getBug(testIdentifier);

        if (!bug) {
          throw new Error(`Bug exists but could not be retrieved: ${testIdentifier}`);
        }

        if (bug.status === 'open') {
          // Call plugin hooks
          await this.pluginManager.beforeCloseIssue(test, testFilePath, parseInt(bug.id, 10));

          // Close the bug
          await this.bugTracker.closeBug(testIdentifier, test, testFilePath);

          // Call plugin hooks
          await this.pluginManager.afterCloseIssue(test, testFilePath, parseInt(bug.id, 10));
        }
      }
    } catch (error) {
      this.handleError(error, 'Error handling passed test');
    }
  }

  /**
   * Handle an error
   *
   * @param error The error
   * @param prefix Error message prefix
   */
  private handleError(error: unknown, prefix: string): void {
    const errorMessage = this.formatError(error);
    console.error(`${prefix}: ${errorMessage}`);
  }

  /**
   * Format an error for logging
   *
   * @param error The error
   * @returns Formatted error message
   */
  private formatError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
