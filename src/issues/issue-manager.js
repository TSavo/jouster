"use strict";

const path = require('path');
const { generateTestIdentifier, getTestDescription } = require('../utils');
const { TemplateManager } = require('../templates/template-manager');

/**
 * Manager for creating and closing GitHub issues for test failures
 */
class IssueManager {
  /**
   * Creates a new IssueManager instance
   *
   * @param {Object} deps - Dependencies
   * @param {Object} deps.mappingStore - The mapping store
   * @param {Object} deps.githubClient - The GitHub client
   * @param {Object} deps.templateManager - The template manager (optional)
   * @param {Function} deps.pathRelative - Function to get relative path (optional)
   * @param {Function} deps.getCurrentDate - Function to get current date (optional)
   * @param {Function} deps.generateTestId - Function to generate test ID (optional)
   * @param {Function} deps.getTestDesc - Function to get test description (optional)
   */
  constructor(deps) {
    // For backward compatibility
    if (arguments.length === 2) {
      const mappingStore = arguments[0];
      const githubClient = arguments[1];
      deps = { mappingStore, githubClient };
    }

    if (!deps || !deps.mappingStore || !deps.githubClient) {
      throw new Error('Missing required dependencies: mappingStore and githubClient are required');
    }

    this.mappingStore = deps.mappingStore;
    this.githubClient = deps.githubClient;
    this.templateManager = deps.templateManager || new TemplateManager();

    // Dependency injection for easier testing
    this.pathRelative = deps.pathRelative || ((from, to) => path.relative(from, to));
    this.getCurrentDate = deps.getCurrentDate || (() => new Date().toISOString());
    this.generateTestId = deps.generateTestId || generateTestIdentifier;
    this.getTestDesc = deps.getTestDesc || getTestDescription;
  }

  /**
   * Processes test results
   *
   * @param {Array} testResults - The test results
   * @param {Object} options - Options for processing
   * @param {boolean} options.createIssues - Whether to create issues for failures
   * @param {boolean} options.closeIssues - Whether to close issues for passes
   * @returns {Promise<void>}
   */
  async processTestResults(testResults, options = { createIssues: true, closeIssues: true }) {
    if (!testResults || !Array.isArray(testResults)) {
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
   * @param {Object} testFile - The test file
   * @param {Object} options - Options for processing
   * @returns {Promise<void>}
   */
  async processTestFile(testFile, options) {
    if (!testFile) {
      return;
    }

    const { testFilePath, testResults } = testFile;

    // Skip if no test results or no file path
    if (!testResults || testResults.length === 0 || !testFilePath) {
      return;
    }

    // Get the relative path to the test file
    const relativeFilePath = this.pathRelative(process.cwd(), testFilePath);

    // Process each test result
    for (const test of testResults) {
      if (!test || !test.fullName) {
        continue;
      }

      // Generate a unique identifier for the test
      const testIdentifier = this.generateTestId(relativeFilePath, test.fullName);

      // Process the test result
      if (test.status === 'failed') {
        // Test failed, create an issue if needed
        if (options.createIssues) {
          await this.handleFailedTest(testIdentifier, relativeFilePath, test);
        }
      } else if (test.status === 'passed') {
        // Test passed, close the issue if needed
        if (options.closeIssues) {
          await this.handlePassedTest(testIdentifier, relativeFilePath, test);
        }
      }
    }
  }

  /**
   * Handles a failed test
   *
   * @param {string} testIdentifier - The test identifier
   * @param {string} testFilePath - The test file path
   * @param {Object} test - The test result
   * @returns {Promise<void>}
   */
  async handleFailedTest(testIdentifier, testFilePath, test) {
    if (!testIdentifier || !testFilePath || !test) {
      return;
    }

    // Check if we already have an issue for this test
    const mapping = this.mappingStore.getMapping(testIdentifier);

    if (mapping && mapping.status === 'open') {
      // Issue already exists and is open, update the last failure time
      this.mappingStore.updateMapping(testIdentifier, {
        lastFailure: this.getCurrentDate()
      }, {}, testFilePath, test.fullName);
    } else if (mapping && mapping.status === 'closed') {
      // Issue exists but is closed (regression), reopen it
      const comment = this.templateManager.generateReopenComment(test, testFilePath, mapping);
      const result = await this.githubClient.reopenIssue(mapping.issueNumber, comment);

      if (result.success) {
        // Update the mapping
        this.mappingStore.updateMapping(testIdentifier, {
          status: 'open',
          lastFailure: this.getCurrentDate()
        }, {}, testFilePath, test.fullName);
      }
    } else {
      // Create a new issue
      const title = `Test Failure: ${this.getTestDesc(test.fullName)}`;
      const body = this.templateManager.generateIssueBody(test, testFilePath);

      const result = await this.githubClient.createIssue(title, body, ['bug']);

      if (result.success) {
        // Get git information
        const gitInfo = this.templateManager.getGitInfo();

        // Store the mapping with git information and test file path
        this.mappingStore.setMapping(testIdentifier, result.issueNumber, 'open', gitInfo, testFilePath, test.fullName);
      }
    }
  }

  /**
   * Handles a passed test
   *
   * @param {string} testIdentifier - The test identifier
   * @param {string} testFilePath - The test file path
   * @param {Object} test - The test result
   * @returns {Promise<void>}
   */
  async handlePassedTest(testIdentifier, testFilePath, test) {
    if (!testIdentifier || !testFilePath || !test) {
      return;
    }

    // Check if we have an issue for this test
    const mapping = this.mappingStore.getMapping(testIdentifier);

    if (mapping && mapping.status === 'open') {
      // Issue exists and is open, close it
      const comment = this.templateManager.generateCloseComment(test, testFilePath, mapping);
      const result = await this.githubClient.closeIssue(mapping.issueNumber, comment);

      if (result.success) {
        // Get git information
        const gitInfo = this.templateManager.getGitInfo();

        // Update the mapping with git information about the fix
        this.mappingStore.updateMapping(testIdentifier, {
          status: 'closed'
        }, gitInfo, testFilePath, test.fullName);
      }
    }
  }
}

module.exports = { IssueManager };
