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
    console.log('[Jouster] Processing test results');
    const mergedOptions = { ...options };
    console.log('[Jouster] Options for processing:', options);

    // Default to true if options are not explicitly set to false
    const generateIssues = this.generateIssues !== false;
    const trackIssues = this.trackIssues !== false;
    const mergedGenerateIssues = mergedOptions.generateIssues !== false;
    const mergedTrackIssues = mergedOptions.trackIssues !== false;

    console.log('[Jouster] Effective options:', {
      generateIssues: generateIssues || mergedGenerateIssues,
      trackIssues: trackIssues || mergedTrackIssues
    });

    // Skip processing if both generateIssues and trackIssues are false
    const shouldProcessResults = (generateIssues || trackIssues || mergedGenerateIssues || mergedTrackIssues);
    console.log('[Jouster] shouldProcessResults:', shouldProcessResults);

    if (!shouldProcessResults) {
      console.log('[Jouster] Skipping test results processing');
      return;
    }

    // Process each test file
    if (results.testResults) {
      console.log('[Jouster] Will process', results.testResults.length, 'test results');
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
    console.log('[Jouster] Processing test file:', testFilePath);
    console.log('[Jouster] Test file result status:', testFileResult.status);
    console.log('[Jouster] Options:', options);

    const mergedOptions = { ...options };
    console.log('[Jouster] Merged options:', mergedOptions);

    // Skip processing if both generateIssues and trackIssues are false
    // Default to true if options are not explicitly set to false
    const generateIssues = this.generateIssues !== false;
    const trackIssues = this.trackIssues !== false;
    const mergedGenerateIssues = mergedOptions.generateIssues !== false;
    const mergedTrackIssues = mergedOptions.trackIssues !== false;

    const shouldProcess = generateIssues || trackIssues || mergedGenerateIssues || mergedTrackIssues;
    console.log('[Jouster] Should process test file:', shouldProcess);
    console.log('[Jouster] Generate issues:', generateIssues, 'Track issues:', trackIssues);
    console.log('[Jouster] Merged generate issues:', mergedGenerateIssues, 'Merged track issues:', mergedTrackIssues);

    if (!shouldProcess) {
      console.log('[Jouster] Skipping test file processing');
      return;
    }

    // Process each test
    if (testFileResult.testResults) {
      console.log('[Jouster] Processing', testFileResult.testResults.length, 'tests');

      for (const test of testFileResult.testResults) {
        console.log('[Jouster] Processing test:', test.fullName);
        console.log('[Jouster] Test status:', test.status);

        // Generate a unique identifier for the test
        const testIdentifier = generateTestIdentifier(testFilePath, test.fullName);
        console.log('[Jouster] Test identifier:', testIdentifier);

        // Handle the test based on its status
        if (test.status === 'failed') {
          console.log('[Jouster] Test failed, handling failure');
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
    console.log('[Jouster] Handling failed test:', testIdentifier);

    try {
      // Skip if test file should not be included based on test filters
      const shouldIncludeTest = this.filterUtils.shouldIncludeTest(testFilePath);
      console.log('[Jouster] Should include test based on filters:', shouldIncludeTest);

      if (!shouldIncludeTest) {
        console.log('[Jouster] Skipping test due to filter rules');
        return;
      }

      // Skip if issue creation should be skipped for this test file
      const shouldSkipIssueCreation = this.filterUtils.shouldSkipIssueCreation(testFilePath);
      console.log('[Jouster] Should skip issue creation:', shouldSkipIssueCreation);

      if (shouldSkipIssueCreation) {
        console.log('[Jouster] Skipping issue creation for this test file');
        return;
      }

      // Skip if issues should not be created on the current branch
      const shouldCreateIssuesOnCurrentBranch = this.filterUtils.shouldCreateIssuesOnCurrentBranch();
      console.log('[Jouster] Should create issues on current branch:', shouldCreateIssuesOnCurrentBranch);

      if (!shouldCreateIssuesOnCurrentBranch) {
        console.log('[Jouster] Skipping issue creation on current branch');
        return;
      }

      // Default to true if options are not explicitly set to false
      const generateIssues = this.generateIssues !== false;
      const trackIssues = this.trackIssues !== false;
      const closeIssues = this.closeIssues !== false;
      const reopenIssues = this.reopenIssues !== false;

      // Get options from the reporter options
      const optionsGenerateIssues = options?.generateIssues !== false;
      const optionsTrackIssues = options?.trackIssues !== false;
      const optionsCloseIssues = options?.closeIssues !== false;
      const optionsReopenIssues = options?.reopenIssues !== false;

      const mergedOptions = {
        generateIssues: generateIssues || optionsGenerateIssues,
        trackIssues: trackIssues || optionsTrackIssues,
        closeIssues: closeIssues || optionsCloseIssues,
        reopenIssues: reopenIssues || optionsReopenIssues
      };

      console.log('[Jouster] Instance options:', { generateIssues, trackIssues, closeIssues, reopenIssues });
      console.log('[Jouster] Reporter options:', { optionsGenerateIssues, optionsTrackIssues, optionsCloseIssues, optionsReopenIssues });
      console.log('[Jouster] Merged options for handling failed test:', mergedOptions);

      // Check if a bug exists for this test
      console.log('[Jouster] Checking if bug exists for test:', testIdentifier);
      const bugExists = await this.bugTracker.bugExists(testIdentifier);
      console.log('[Jouster] Bug exists:', bugExists);

      if (bugExists) {
        // Get the bug
        console.log('[Jouster] Getting bug details for:', testIdentifier);
        const bug = await this.bugTracker.getBug(testIdentifier);
        console.log('[Jouster] Bug details:', bug);

        if (!bug) {
          console.error('[Jouster] Bug exists but could not be retrieved:', testIdentifier);
          throw new Error(`Bug exists but could not be retrieved: ${testIdentifier}`);
        }

        if (bug.status === 'open') {
          console.log('[Jouster] Bug is already open, updating it');
          // Update the bug
          await this.bugTracker.updateBug(testIdentifier, test, testFilePath);
          console.log('[Jouster] Bug updated successfully');
        } else if (bug.status === 'closed' && mergedOptions.reopenIssues) {
          console.log('[Jouster] Bug is closed, reopening it');

          // Call plugin hooks
          console.log('[Jouster] Calling plugin hooks before reopening issue');
          await this.pluginManager.beforeReopenIssue(test, testFilePath, parseInt(bug.id, 10));

          // Reopen the bug
          console.log('[Jouster] Reopening bug:', testIdentifier);
          await this.bugTracker.reopenBug(testIdentifier, test, testFilePath);
          console.log('[Jouster] Bug reopened successfully');

          // Call plugin hooks
          console.log('[Jouster] Calling plugin hooks after reopening issue');
          await this.pluginManager.afterReopenIssue(test, testFilePath, parseInt(bug.id, 10));
          console.log('[Jouster] Plugin hooks called successfully');
        } else {
          console.log('[Jouster] Bug is closed but reopenIssues is false, not reopening');
        }
      } else if (mergedOptions.generateIssues) {
        console.log('[Jouster] Bug does not exist, creating new bug');

        // Call plugin hooks
        console.log('[Jouster] Calling plugin hooks before creating issue');
        await this.pluginManager.beforeCreateIssue(test, testFilePath);

        // Create a new bug
        console.log('[Jouster] Creating new bug for test:', testIdentifier);
        const bug = await this.bugTracker.createBug(testIdentifier, test, testFilePath);
        console.log('[Jouster] Bug created successfully:', bug);

        // Call plugin hooks
        console.log('[Jouster] Calling plugin hooks after creating issue');
        await this.pluginManager.afterCreateIssue(test, testFilePath, parseInt(bug.id, 10));
        console.log('[Jouster] Plugin hooks called successfully');
      } else {
        console.log('[Jouster] Bug does not exist but generateIssues is false, not creating bug');
      }
    } catch (error) {
      console.error('[Jouster] Error handling failed test:', error);
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
    console.log('[Jouster] Handling passed test:', testIdentifier);
    console.log('[Jouster] Test file path:', testFilePath);
    console.log('[Jouster] Test name:', test.fullName);

    try {
      // Skip if test file should not be included based on test filters
      const shouldIncludeTest = this.filterUtils.shouldIncludeTest(testFilePath);
      console.log('[Jouster] Should include test based on filters:', shouldIncludeTest);

      if (!shouldIncludeTest) {
        console.log('[Jouster] Skipping test due to filter rules');
        return;
      }

      // Skip if issue creation should be skipped for this test file
      const shouldSkipIssueCreation = this.filterUtils.shouldSkipIssueCreation(testFilePath);
      console.log('[Jouster] Should skip issue creation:', shouldSkipIssueCreation);

      if (shouldSkipIssueCreation) {
        console.log('[Jouster] Skipping issue creation for this test file');
        return;
      }

      // Skip if issues should not be created on the current branch
      const shouldCreateIssuesOnCurrentBranch = this.filterUtils.shouldCreateIssuesOnCurrentBranch();
      console.log('[Jouster] Should create issues on current branch:', shouldCreateIssuesOnCurrentBranch);

      if (!shouldCreateIssuesOnCurrentBranch) {
        console.log('[Jouster] Skipping issue creation on current branch');
        return;
      }

      // Default to true if options are not explicitly set to false
      const generateIssues = this.generateIssues !== false;
      const trackIssues = this.trackIssues !== false;
      const closeIssues = this.closeIssues !== false;
      const reopenIssues = this.reopenIssues !== false;

      // Get options from the reporter options
      const optionsGenerateIssues = options?.generateIssues !== false;
      const optionsTrackIssues = options?.trackIssues !== false;
      const optionsCloseIssues = options?.closeIssues !== false;
      const optionsReopenIssues = options?.reopenIssues !== false;

      const mergedOptions = {
        generateIssues: generateIssues || optionsGenerateIssues,
        trackIssues: trackIssues || optionsTrackIssues,
        closeIssues: closeIssues || optionsCloseIssues,
        reopenIssues: reopenIssues || optionsReopenIssues
      };

      console.log('[Jouster] Instance options:', { generateIssues, trackIssues, closeIssues, reopenIssues });
      console.log('[Jouster] Reporter options:', { optionsGenerateIssues, optionsTrackIssues, optionsCloseIssues, optionsReopenIssues });
      console.log('[Jouster] Merged options for handling passed test:', mergedOptions);

      // Check if a bug exists for this test
      console.log('[Jouster] Checking if bug exists for test:', testIdentifier);
      const bugExists = await this.bugTracker.bugExists(testIdentifier);
      console.log('[Jouster] Bug exists:', bugExists);

      if (bugExists) {
        // Get the bug - this will also sync the status with GitHub
        console.log('[Jouster] Getting bug details for:', testIdentifier);
        const bug = await this.bugTracker.getBug(testIdentifier);
        console.log('[Jouster] Bug details:', bug);

        if (!bug) {
          console.error('[Jouster] Bug exists but could not be retrieved:', testIdentifier);
          throw new Error(`Bug exists but could not be retrieved: ${testIdentifier}`);
        }

        // Check if we should close the issue
        const shouldCloseIssue = mergedOptions.closeIssues && bug.status === 'open';
        console.log('[Jouster] Should close issue:', shouldCloseIssue, 'Current status:', bug.status);

        if (shouldCloseIssue) {
          console.log('[Jouster] Bug is open and closeIssues is true, closing bug');

          // Call plugin hooks
          console.log('[Jouster] Calling plugin hooks before closing issue');
          await this.pluginManager.beforeCloseIssue(test, testFilePath, parseInt(bug.id, 10));

          // Close the bug
          console.log('[Jouster] Closing bug:', testIdentifier);
          await this.bugTracker.closeBug(testIdentifier, test, testFilePath);
          console.log('[Jouster] Bug closed successfully');

          // Call plugin hooks
          console.log('[Jouster] Calling plugin hooks after closing issue');
          await this.pluginManager.afterCloseIssue(test, testFilePath, parseInt(bug.id, 10));
          console.log('[Jouster] Plugin hooks called successfully');
        } else if (bug.status === 'open' && !mergedOptions.closeIssues) {
          console.log('[Jouster] Bug is open but closeIssues is false, not closing bug');
        } else {
          console.log('[Jouster] Bug is already closed, no action needed');
        }
      } else {
        console.log('[Jouster] No bug exists for this test, nothing to close');
      }
    } catch (error) {
      console.error('[Jouster] Error handling passed test:', error);
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
