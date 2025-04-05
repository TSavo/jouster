"use strict";

const GitHubClient = require('../github/github-client').GitHubClient;
const IssueManager = require('../issues/issue-manager').IssueManager;
const MappingStore = require('../storage/mapping-store').MappingStore;

/**
 * Jest reporter that tracks test failures and creates/closes GitHub issues
 */
class IssueTrackerReporter {
  /**
   * Creates a new IssueTrackerReporter instance
   *
   * @param globalConfig Jest global configuration
   * @param reporterOptions Reporter options
   */
  constructor(globalConfig, reporterOptions) {
    // Parse options from environment variables or Jest command line arguments
    this.options = {
      generateIssues: process.env.GENERATE_ISSUES === 'true' || process.argv.includes('--generate-issues'),
      trackIssues: process.env.TRACK_ISSUES === 'true' || process.argv.includes('--track-issues') || process.env.GENERATE_ISSUES === 'true' || process.argv.includes('--generate-issues'),
      databasePath: reporterOptions?.databasePath
    };

    // Initialize components
    const mappingStore = new MappingStore(this.options.databasePath);
    const githubClient = new GitHubClient();
    this.issueManager = new IssueManager(mappingStore, githubClient);
    this.pendingResults = [];
    this.isGitHubCliAvailable = false;

    // We need to initialize synchronously, but we'll check GitHub CLI availability
    // in the onRunStart method
  }

  /**
   * Checks if the GitHub CLI is available
   */
  async checkGitHubCli() {
    const githubClient = new GitHubClient();
    this.isGitHubCliAvailable = await githubClient.isGitHubCliAvailable();

    // Check if GitHub CLI is needed and warn if it's not available
    this.checkAndWarnAboutGitHubCli();
  }

  /**
   * Check if GitHub CLI is needed and warn if it's not available
   */
  checkAndWarnAboutGitHubCli() {
    const needsGitHubCli = this.options.generateIssues || this.options.trackIssues;
    if (!this.isGitHubCliAvailable && needsGitHubCli) {
      this.warnAboutMissingGitHubCli();
    }
  }

  /**
   * Show warnings about missing GitHub CLI
   */
  warnAboutMissingGitHubCli() {
    this.logWarning('\n[Issue Tracker] GitHub CLI not found. Issue tracking will be disabled.');
    this.logWarning('[Issue Tracker] Please install GitHub CLI: https://cli.github.com/\n');
  }

  /**
   * Log a warning message
   * @param message The message to log
   */
  logWarning(message) {
    console.warn(message);
  }

  /**
   * Called when the test run starts
   */
  async onRunStart() {
    // Check if GitHub CLI is available
    await this.checkGitHubCli();
  }

  /**
   * Called when a test starts
   */
  onTestStart() {
    // Not used
  }

  /**
   * Called when a test completes
   * @param test The test result
   */
  onTestResult(test, testResult) {
    // Store the test result for processing later
    this.pendingResults.push({
      testFilePath: testResult.testFilePath,
      testResults: testResult.testResults
    });
  }

  /**
   * Called when all tests complete
   */
  async onRunComplete() {
    // Skip if GitHub CLI is not available
    if (!this.isGitHubCliAvailable) {
      return;
    }

    // Process all test results
    if (this.options.generateIssues || this.options.trackIssues) {
      try {
        await this.issueManager.processTestResults(this.pendingResults, {
          createIssues: this.options.generateIssues,
          closeIssues: this.options.trackIssues
        });
      } catch (error) {
        // Silently continue if processing fails
      }
    }
  }
}

module.exports = IssueTrackerReporter;
