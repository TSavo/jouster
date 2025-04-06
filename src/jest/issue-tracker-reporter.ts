import { IIssueManager } from '../issues/issue-manager.interface';
import { PluginManager } from '../plugins/plugin-manager';
import { IBugTracker } from '../trackers/bug-tracker.interface';

/**
 * Jouster: Jest reporter for tracking test failures as GitHub issues
 * Stick it to your failing tests!
 */
export class IssueTrackerReporter {
  private globalConfig: any;
  private options: any;
  private issueManager: IIssueManager;
  private pluginManager: PluginManager;
  private bugTracker?: IBugTracker;
  private pendingResults: any[];
  private isTrackerAvailable: boolean;

  /**
   * Creates a new issue tracker reporter
   *
   * @param globalConfig Global Jest configuration
   * @param options Reporter options
   * @param issueManager Issue manager
   * @param pluginManager Plugin manager
   * @param bugTracker Bug tracker
   */
  constructor(
    globalConfig: any,
    options: any,
    issueManager: IIssueManager,
    pluginManager: PluginManager,
    bugTracker?: IBugTracker
  ) {
    this.globalConfig = globalConfig;
    this.options = this.initializeOptions(options);
    this.issueManager = issueManager;
    this.pluginManager = pluginManager;
    this.bugTracker = bugTracker;
    this.pendingResults = [];
    this.isTrackerAvailable = false;
  }

  /**
   * Initialize options with defaults
   *
   * @param options Options object or undefined
   * @returns Initialized options object
   */
  private initializeOptions(options: any): any {
    return options || {};
  }

  /**
   * Called when Jest starts running
   */
  public async onRunStart(): Promise<void> {
    console.log('[Jouster] Starting test run');
    console.log('[Jouster] Options:', JSON.stringify(this.options));

    try {
      console.log('[Jouster] Initializing bug tracker');
      await this.initializeBugTracker();
      console.log('[Jouster] Bug tracker initialized, isTrackerAvailable:', this.isTrackerAvailable);
    } catch (error) {
      this.handleInitializationError(error);
    }

    // Warn if bug tracker is needed but not available
    this.checkAndWarnAboutTracker();
  }

  /**
   * Initialize the bug tracker if provided
   */
  private async initializeBugTracker(): Promise<void> {
    if (this.bugTracker) {
      await this.bugTracker.initialize();
      this.isTrackerAvailable = true;
    }
  }

  /**
   * Handle error during bug tracker initialization
   */
  private handleInitializationError(error: unknown): void {
    this.isTrackerAvailable = false;
    const errorMessage = this.formatError(error);
    console.error(`Error initializing bug tracker: ${errorMessage}`);
  }

  /**
   * Called when a test file completes
   *
   * @param test Test result
   */
  public onTestResult(test: any, testResult: any): void {
    // Add the test result to pending results
    this.pendingResults.push({
      test,
      testResult
    });
  }

  /**
   * Called when all tests complete
   */
  public async onRunComplete(): Promise<void> {
    console.log('[Jouster] Test run complete');
    console.log('[Jouster] Pending results:', this.pendingResults.length);
    console.log('[Jouster] isTrackerAvailable:', this.isTrackerAvailable);
    console.log('[Jouster] shouldProcessResults:', this.shouldProcessResults());

    try {
      await this.processTestResults();
    } catch (error) {
      this.handleProcessingError(error);
    }
  }

  /**
   * Process test results if conditions are met
   */
  private async processTestResults(): Promise<void> {
    console.log('[Jouster] Processing test results');

    if (!this.shouldProcessResults()) {
      console.log('[Jouster] Skipping test result processing');
      return;
    }

    console.log('[Jouster] Will process', this.pendingResults.length, 'test results');

    for (const { test, testResult } of this.pendingResults) {
      console.log('[Jouster] Processing test result:', test.path);
      try {
        await this.processTestResult(test, testResult);
        console.log('[Jouster] Successfully processed test result');
      } catch (error) {
        console.error('[Jouster] Error processing test result:', this.formatError(error));
      }
    }

    console.log('[Jouster] Finished processing all test results');
  }

  /**
   * Check if test results should be processed
   */
  private shouldProcessResults(): boolean {
    console.log('[Jouster] Options for processing:', {
      generateIssues: this.options.generateIssues,
      trackIssues: this.options.trackIssues
    });

    // Default to true if options are not explicitly set to false
    const generateIssues = this.options.generateIssues !== false;
    const trackIssues = this.options.trackIssues !== false;

    console.log('[Jouster] Effective options:', {
      generateIssues,
      trackIssues
    });

    return this.isTrackerAvailable && (generateIssues || trackIssues);
  }

  /**
   * Process a single test result
   */
  private async processTestResult(test: any, testResult: any): Promise<void> {
    console.log('[Jouster] Processing test file:', test.path);
    console.log('[Jouster] Test result status:', testResult.numFailingTests > 0 ? 'FAILING' : 'PASSING');

    try {
      await this.issueManager.processTestFile(test.path, testResult, this.options);
      console.log('[Jouster] Successfully processed test file');
    } catch (error) {
      console.error('[Jouster] Error processing test file:', this.formatError(error));
      throw error; // Re-throw to be caught by the caller
    }
  }

  /**
   * Handle error during test result processing
   */
  private handleProcessingError(error: unknown): void {
    const errorMessage = this.formatError(error);
    console.error(`Error processing test results: ${errorMessage}`);
  }

  /**
   * Format an error for logging
   */
  private formatError(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Check if bug tracker is available and warn if needed
   */
  private checkAndWarnAboutTracker(): void {
    console.log('[Jouster] Checking bug tracker availability');
    console.log('[Jouster] Bug tracker:', this.bugTracker ? 'provided' : 'not provided');

    if (!this.isTrackerAvailable && (this.options.generateIssues || this.options.trackIssues)) {
      console.warn(
        'Bug tracker is not available. Issue tracking will be disabled. ' +
        'Please check the configuration and ensure the bug tracker is properly initialized.'
      );
    }
  }
}
