"use strict";

const { IssueManager } = require('../issues/issue-manager');
const { MappingStore } = require('../storage/mapping-store');
const { GitHubClient } = require('../github/github-client');

/**
 * Jest reporter that tracks test failures and creates/closes GitHub issues
 */
class IssueTrackerReporter {
  /**
   * Creates a new IssueTrackerReporter instance
   *
   * @param {Object} globalConfig - Jest global configuration
   * @param {Object} reporterOptions - Reporter options
   * @param {Object} deps - Dependencies (optional)
   * @param {Function} deps.createIssueManager - Function to create an issue manager
   * @param {Function} deps.createMappingStore - Function to create a mapping store
   * @param {Function} deps.createGitHubClient - Function to create a GitHub client
   * @param {Function} deps.getEnv - Function to get environment variables
   * @param {Array} deps.getArgv - Function to get command line arguments
   * @param {Function} deps.logger - Logger for output
   */
  constructor(globalConfig, reporterOptions, deps = {}) {
    // Set up dependencies with defaults
    this.createIssueManager = deps.createIssueManager || this._defaultCreateIssueManager.bind(this);
    this.createMappingStore = deps.createMappingStore || this._defaultCreateMappingStore.bind(this);
    this.createGitHubClient = deps.createGitHubClient || this._defaultCreateGitHubClient.bind(this);
    this.getEnv = deps.getEnv || (() => process.env);
    this.getArgv = deps.getArgv || (() => process.argv);
    this.logger = deps.logger || console;

    // Parse options from environment variables or Jest command line arguments
    const env = this.getEnv();
    const argv = this.getArgv();

    this.options = {
      generateIssues: env.GENERATE_ISSUES === 'true' || argv.includes('--generate-issues'),
      trackIssues: env.TRACK_ISSUES === 'true' || argv.includes('--track-issues') ||
                  env.GENERATE_ISSUES === 'true' || argv.includes('--generate-issues'),
      databasePath: reporterOptions?.databasePath
    };

    // Initialize components
    this.mappingStore = this.createMappingStore(this.options.databasePath);
    this.githubClient = this.createGitHubClient();
    this.issueManager = this.createIssueManager(this.mappingStore, this.githubClient);
    this.pendingResults = [];
    this.isGitHubCliAvailable = false;
  }

  /**
   * Default implementation to create a mapping store
   *
   * @param {string} databasePath - Path to the database
   * @returns {Object} A mapping store instance
   */
  _defaultCreateMappingStore(databasePath) {
    return new MappingStore(databasePath);
  }

  /**
   * Default implementation to create a GitHub client
   *
   * @returns {Object} A GitHub client instance
   */
  _defaultCreateGitHubClient() {
    return new GitHubClient();
  }

  /**
   * Default implementation to create an issue manager
   *
   * @param {Object} mappingStore - The mapping store
   * @param {Object} githubClient - The GitHub client
   * @returns {Object} An issue manager instance
   */
  _defaultCreateIssueManager(mappingStore, githubClient) {
    return new IssueManager({
      mappingStore,
      githubClient
    });
  }

  /**
   * Checks if the GitHub CLI is available
   *
   * @returns {Promise<boolean>} True if GitHub CLI is available, false otherwise
   */
  async checkGitHubCli() {
    try {
      this.isGitHubCliAvailable = await this.githubClient.isGitHubCliAvailable();

      // Check if GitHub CLI is needed and warn if it's not available
      this.checkAndWarnAboutGitHubCli();

      return this.isGitHubCliAvailable;
    } catch (error) {
      this.logger.error('[Issue Tracker] Error checking GitHub CLI availability:', error);
      this.isGitHubCliAvailable = false;
      return false;
    }
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
   *
   * @param {string} message - The message to log
   */
  logWarning(message) {
    this.logger.warn(message);
  }

  /**
   * Called when the test run starts
   *
   * @returns {Promise<void>}
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
   *
   * @param {Object} test - The test context
   * @param {Object} testResult - The test result
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
   *
   * @returns {Promise<void>}
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
        this.logger.error('[Issue Tracker] Error processing test results:', error);
      }
    }
  }
}

module.exports = IssueTrackerReporter;
