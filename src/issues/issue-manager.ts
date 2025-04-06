import { GitHubClient } from '../github/github-client';
import { MappingStore } from '../storage/mapping-store';
import {
  TestResult,
  TestIdentifier,
  IssueTrackerOptions
} from '../types';
import {
  generateTestIdentifier,
  getTestDescription
} from '../utils/test-identifier';

/**
 * Manages the creation and closure of GitHub issues for test failures
 */
export class IssueManager {
  private githubClient: GitHubClient | null = null;
  private mappingStore: MappingStore | null = null;
  private bugTracker: any = null;
  private pluginManager: any = null;
  private options: IssueTrackerOptions;
  // @ts-ignore - Added for testing
  public filterUtils: any = {
    shouldIncludeTest: () => true,
    shouldSkipIssueCreation: () => false,
    shouldCreateIssuesOnCurrentBranch: () => true
  };

  /**
   * Creates a new IssueManager instance
   *
   * @param githubClientOrBugTracker GitHub client or bug tracker instance
   * @param mappingStoreOrPluginManager Mapping store or plugin manager instance
   * @param options Options for the issue tracker
   */
  constructor(
    githubClientOrBugTracker: GitHubClient | any,
    mappingStoreOrPluginManager: MappingStore | any,
    options: IssueTrackerOptions
  ) {
    this.options = this.initializeOptions(options);

    // Check if the first parameter is a GitHubClient
    if (githubClientOrBugTracker && 'createIssue' in githubClientOrBugTracker) {
      // Legacy constructor
      this.githubClient = githubClientOrBugTracker;
      this.mappingStore = mappingStoreOrPluginManager;
    } else {
      // New constructor
      this.bugTracker = githubClientOrBugTracker;
      this.pluginManager = mappingStoreOrPluginManager;
    }
  }

  /**
   * Initializes options with defaults
   *
   * @param options Options to initialize
   * @returns Initialized options
   */
  public initializeOptions(options?: Partial<IssueTrackerOptions>): IssueTrackerOptions {
    if (!options) {
      return {
        generateIssues: false,
        trackIssues: false,
        closeIssues: true,
        reopenIssues: true,
        config: {}
      };
    }

    return {
      generateIssues: options.generateIssues || false,
      trackIssues: options.trackIssues || false,
      closeIssues: options.closeIssues !== false,
      reopenIssues: options.reopenIssues !== false,
      databasePath: options.databasePath,
      templateDir: options.templateDir,
      defaultLabels: options.defaultLabels,
      githubLabels: options.githubLabels,
      config: options.config || {}
    };
  }

  /**
   * Formats an error for logging
   *
   * @param error The error to format
   * @returns Formatted error message
   */
  public formatError(error: any): string {
    if (!error) {
      return 'Unknown error';
    }

    if (error instanceof Error) {
      return error.message || error.toString();
    }

    if (typeof error === 'string') {
      return error;
    }

    return JSON.stringify(error);
  }

  /**
   * Handles an error by logging it
   *
   * @param error The error to handle
   * @param prefix Optional prefix for the error message
   */
  public handleError(error: any, prefix?: string): void {
    const errorMessage = this.formatError(error);
    console.error(`${prefix ? prefix + ': ' : ''}${errorMessage}`);
  }

  /**
   * Processes test results
   *
   * @param testResults The test results to process
   * @param options Optional options
   * @returns A promise that resolves when processing is complete
   */
  public async processTestResults(testResults: any[], options?: any): Promise<void> {
    // Skip if both generateIssues and trackIssues are false
    if (!this.options.generateIssues && !this.options.trackIssues) {
      return;
    }

    // Process each test file
    for (const result of testResults) {
      await this.processTestFile(result, options);
    }
  }

  /**
   * Processes a test file
   *
   * @param testFilePath The test file path
   * @param testFileResults The test file results
   * @param options Optional options
   * @returns A promise that resolves when processing is complete
   */
  public async processTestFile(testFilePath: string, testFileResults: any, options?: any): Promise<void> {
    // Skip if both generateIssues and trackIssues are false
    if (!this.options.generateIssues && !this.options.trackIssues) {
      return;
    }

    // Process each test
    for (const testName in testFileResults.tests) {
      const test = testFileResults.tests[testName];
      const testIdentifier = generateTestIdentifier(testFilePath, test.fullName);

      if (test.status === 'failed') {
        await this.handleFailedTest(testIdentifier, testFilePath, test, options);
      } else if (test.status === 'passed') {
        await this.handlePassedTest(testIdentifier, testFilePath, test, options);
      }
    }
  }

  /**
   * Processes a test result
   *
   * @param testResult The test result to process
   * @returns A promise that resolves when processing is complete
   */
  public async processTestResult(testResult: TestResult): Promise<void> {
    const testIdentifier = generateTestIdentifier(testResult);
    const mapping = this.mappingStore?.getIssueMapping(testIdentifier);
    const testFilePath = testResult.testFilePath || '';

    if (testResult.status === 'failed') {
      await this.handleFailedTest(testIdentifier, testFilePath, testResult);
    } else if (testResult.status === 'passed' && mapping && mapping.status === 'open') {
      await this.handlePassingTest(testIdentifier, testResult, mapping.issueNumber);
    }
  }

  /**
   * Handles a failed test
   *
   * @param testIdentifier The test identifier
   * @param testFilePath The test file path
   * @param test The test result
   * @param options Optional options
   * @returns A promise that resolves when the test has been handled
   */
  public async handleFailedTest(testIdentifier: string, testFilePath: string, test: any, options?: any): Promise<void> {
    // Skip if the test should not be included
    if (this.filterUtils.shouldIncludeTest && !this.filterUtils.shouldIncludeTest(testFilePath)) {
      return;
    }

    // Skip if issue creation should be skipped
    if (this.filterUtils.shouldSkipIssueCreation && this.filterUtils.shouldSkipIssueCreation(test)) {
      return;
    }

    // Skip if issues should not be created on the current branch
    if (this.filterUtils.shouldCreateIssuesOnCurrentBranch && !this.filterUtils.shouldCreateIssuesOnCurrentBranch()) {
      return;
    }

    try {
      // For backward compatibility
      if (this.mappingStore) {
        // Check if we already have an issue for this test
        const mapping = this.mappingStore.getIssueMapping(testIdentifier);

        if (mapping && mapping.status === 'open') {
          // Issue already exists and is open, update the last failure time
          this.mappingStore.updateIssueStatus(testIdentifier, 'open');
          return;
        }

        if (mapping && mapping.status === 'closed') {
          // Issue exists but is closed, reopen it if enabled
          if (this.options.reopenIssues && this.githubClient) {
            try {
              const result = await this.githubClient.reopenIssue(
                mapping.issueNumber,
                `Test is failing again. Latest failure: ${new Date().toISOString()}`
              );

              if (result.success) {
                this.mappingStore.updateIssueStatus(testIdentifier, 'open');
              }
            } catch (error) {
              this.handleError(error, 'Failed to reopen issue');
            }
          }
          return;
        }
      }

      // New implementation using bug tracker
      if (this.bugTracker) {
        // Check if a bug already exists for this test
        const bugExists = await this.bugTracker.bugExists(testIdentifier);

        if (bugExists) {
          // Get the bug
          const bug = await this.bugTracker.getBug(testIdentifier);

          if (!bug) {
            console.error(`Bug exists but could not be retrieved for test: ${testIdentifier}`);
            return;
          }

          if (bug.status === 'open') {
            // Bug is already open, just update it
            await this.bugTracker.updateBug(testIdentifier, test, testFilePath);
          } else if (bug.status === 'closed' && this.options.reopenIssues) {
            // Bug is closed, reopen it if enabled
            if (this.pluginManager) {
              await this.pluginManager.beforeReopenIssue(test, testFilePath, bug.id);
            }
            await this.bugTracker.reopenBug(testIdentifier, test, testFilePath);
            if (this.pluginManager) {
              await this.pluginManager.afterReopenIssue(test, testFilePath, bug.id);
            }
          }
        } else if (this.options.generateIssues) {
          // No bug exists, create one if enabled
          if (this.pluginManager) {
            await this.pluginManager.beforeCreateIssue(test, testFilePath);
          }
          const bug = await this.bugTracker.createBug(testIdentifier, test, testFilePath);
          if (this.pluginManager) {
            await this.pluginManager.afterCreateIssue(test, testFilePath, bug.id);
          }
        }
      }
    } catch (error) {
      this.handleError(error, 'Failed to handle failed test');
    }
  }

  /**
   * Handles a passing test
   *
   * @param testIdentifier The test identifier
   * @param testResult The test result
   * @param issueNumber The GitHub issue number
   */
  private async handlePassingTest(
    testIdentifier: TestIdentifier,
    testResult: TestResult,
    issueNumber: number
  ): Promise<void> {
    // Only close the issue if we're tracking issues and closing issues is enabled
    if (this.options.trackIssues && this.options.closeIssues) {
      try {
        const comment = `Test is now passing: ${getTestDescription(testIdentifier)}`;

        if (this.githubClient) {
          const result = await this.githubClient.closeIssue(issueNumber, comment);

          if (result.success) {
            // Update the mapping
            this.mappingStore?.updateIssueStatus(testIdentifier, 'closed');
          }
        }
      } catch (error) {
        this.handleError(error, 'Failed to close issue');
      }
    }
  }

  /**
   * Handles a passed test
   *
   * @param testIdentifier The test identifier
   * @param testFilePath The test file path
   * @param test The test result
   * @param options Optional options
   * @returns A promise that resolves when the test has been handled
   */
  public async handlePassedTest(testIdentifier: string, testFilePath: string, test: any, options?: any): Promise<void> {
    // Skip if the test should not be included
    if (this.filterUtils.shouldIncludeTest && !this.filterUtils.shouldIncludeTest(testFilePath)) {
      return;
    }

    // Skip if issue creation should be skipped
    if (this.filterUtils.shouldSkipIssueCreation && this.filterUtils.shouldSkipIssueCreation(test)) {
      return;
    }

    // Skip if issues should not be created on the current branch
    if (this.filterUtils.shouldCreateIssuesOnCurrentBranch && !this.filterUtils.shouldCreateIssuesOnCurrentBranch()) {
      return;
    }

    try {
      // For backward compatibility
      if (this.mappingStore) {
        // Check if we have an issue for this test
        const mapping = this.mappingStore.getIssueMapping(testIdentifier);

        if (!mapping || mapping.status === 'closed') {
          // No issue or already closed, nothing to do
          return;
        }

        // Issue exists and is open, close it if enabled
        if (!this.options.closeIssues) {
          return;
        }

        if (this.githubClient) {
          try {
            const comment = `Test is now passing: ${getTestDescription(testIdentifier)}`;

            const result = await this.githubClient.closeIssue(mapping.issueNumber, comment);

            if (result.success) {
              this.mappingStore.updateIssueStatus(testIdentifier, 'closed');
            }
          } catch (error) {
            this.handleError(error, 'Failed to close issue');
          }
        }
      }

      // New implementation using bug tracker
      if (this.bugTracker) {
        // Check if a bug already exists for this test
        const bugExists = await this.bugTracker.bugExists(testIdentifier);

        if (bugExists) {
          // Get the bug
          const bug = await this.bugTracker.getBug(testIdentifier);

          if (!bug) {
            console.error(`Bug exists but could not be retrieved for test: ${testIdentifier}`);
            return;
          }

          if (bug.status === 'open' && this.options.closeIssues) {
            // Bug is open, close it if enabled
            if (this.pluginManager) {
              await this.pluginManager.beforeCloseIssue(test, testFilePath, bug.id);
            }
            await this.bugTracker.closeBug(testIdentifier, test, testFilePath);
            if (this.pluginManager) {
              await this.pluginManager.afterCloseIssue(test, testFilePath, bug.id);
            }
          }
        }
      }
    } catch (error) {
      this.handleError(error, 'Failed to handle passed test');
    }
  }

  /**
   * Generates the body for a GitHub issue
   *
   * @param testIdentifier The test identifier
   * @param testResult The test result
   * @returns The issue body
   */
  private generateIssueBody(testIdentifier: TestIdentifier, testResult: TestResult): string {
    const { filePath, suiteName, testName } = require('../utils/test-identifier').parseTestIdentifier(testIdentifier);

    let body = `## Test Failure Details\n\n`;
    body += `**File**: ${filePath}\n`;
    body += `**Test Suite**: ${suiteName}\n`;
    body += `**Test**: ${testName}\n`;
    body += `**First Failure**: ${new Date().toISOString()}\n\n`;

    if (testResult.errorMessage) {
      body += `### Error Message\n\`\`\`\n${testResult.errorMessage}\n\`\`\`\n\n`;
    }

    if (testResult.errorStack) {
      body += `### Stack Trace\n\`\`\`\n${testResult.errorStack}\n\`\`\`\n`;
    }

    return body;
  }

  /**
   * Saves any changes to the mapping store
   */
  public saveChanges(): void {
    this.mappingStore?.saveDatabase();
  }

  /**
   * Saves the database
   */
  public saveDatabase(): void {
    this.mappingStore?.saveDatabase();
  }
}
