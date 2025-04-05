import { GitHubClient } from '../github/github-client';
import { IssueManager } from '../issues/issue-manager';
import { MappingStore } from '../storage/mapping-store';
import {
  IssueTrackerOptions,
  TestResult
} from '../types';

/**
 * Jest reporter that tracks test failures and creates/closes GitHub issues
 */
export class IssueTrackerReporter {
  private options: IssueTrackerOptions;
  private issueManager: IssueManager;
  private pendingResults: TestResult[] = [];
  private isGitHubCliAvailable: boolean = false;

  /**
   * Creates a new IssueTrackerReporter instance
   *
   * @param globalConfig Jest global configuration
   * @param reporterOptions Reporter options
   */
  constructor(globalConfig: any, reporterOptions: any) {
    // Parse options from environment variables or Jest command line arguments
    this.options = {
      generateIssues: process.env.GENERATE_ISSUES === 'true' || process.argv.includes('--generate-issues'),
      trackIssues: process.env.TRACK_ISSUES === 'true' || process.argv.includes('--track-issues') || process.env.GENERATE_ISSUES === 'true' || process.argv.includes('--generate-issues'),
      databasePath: reporterOptions?.databasePath
    };

    // Initialize components
    const mappingStore = new MappingStore(this.options.databasePath);
    const githubClient = new GitHubClient();
    this.issueManager = new IssueManager(this.options, githubClient, mappingStore);

    // Check if GitHub CLI is available
    this.checkGitHubCli();
  }

  /**
   * Checks if the GitHub CLI is available
   */
  private async checkGitHubCli(): Promise<void> {
    const githubClient = new GitHubClient();
    this.isGitHubCliAvailable = await githubClient.isGitHubCliAvailable();

    // If GitHub CLI is not available and we need it, show a warning
    this.checkAndWarnAboutGitHubCli();
  }

  /**
   * Check if GitHub CLI is needed and warn if it's not available
   */
  private checkAndWarnAboutGitHubCli(): void {
    const needsGitHubCli = this.options.generateIssues || this.options.trackIssues;
    if (!this.isGitHubCliAvailable && needsGitHubCli) {
      this.warnAboutMissingGitHubCli();
    }
  }

  /**
   * Show warnings about missing GitHub CLI
   */
  private warnAboutMissingGitHubCli(): void {
    this.logWarning('\n[Issue Tracker] GitHub CLI not found. Issue tracking will be disabled.');
    this.logWarning('[Issue Tracker] Please install GitHub CLI: https://cli.github.com/\n');
  }

  /**
   * Log a warning message
   * @param message The message to log
   */
  private logWarning(message: string): void {
    console.warn(message);
  }

  /**
   * Called when a test result is received
   *
   * @param test Test context
   * @param testResult Test result
   */
  onTestResult(test: any, testResult: any): void {
    // Skip if GitHub CLI is not available
    if (!this.isGitHubCliAvailable) {
      return;
    }

    // Process each test result
    if (testResult.testResults) {
      testResult.testResults.forEach((result: any) => {
        // Create a normalized test result
        const testData: TestResult = {
          testFilePath: testResult.testFilePath,
          testSuiteName: result.ancestorTitles.join(' > ') || 'Default Suite',
          testName: result.title,
          status: result.status === 'passed' ? 'passed' : 'failed',
          errorMessage: result.failureMessages?.[0] || undefined,
          errorStack: result.failureDetails?.[0]?.stack || undefined,
          duration: result.duration
        };

        // Add to pending results to process after all tests complete
        this.pendingResults.push(testData);
      });
    }
  }

  /**
   * Called when all tests are complete
   */
  async onRunComplete(): Promise<void> {
    // Skip if GitHub CLI is not available
    if (!this.isGitHubCliAvailable) {
      return;
    }

    // Skip if no tracking options are enabled
    if (!this.options.generateIssues && !this.options.trackIssues) {
      return;
    }

    console.log('\n[Issue Tracker] Processing test results...');

    // Process all pending results
    for (const result of this.pendingResults) {
      await this.issueManager.processTestResult(result);
    }

    // Save changes to the mapping store
    this.issueManager.saveChanges();

    console.log('[Issue Tracker] Done processing test results.');
  }
}

module.exports = IssueTrackerReporter;
