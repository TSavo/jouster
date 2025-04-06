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
   * @param mappingStore The mapping store
   * @param githubClient The GitHub client
   */
  constructor(mappingStore, githubClient) {
    this.mappingStore = mappingStore;
    this.githubClient = githubClient;
    this.templateManager = new TemplateManager();
  }

  /**
   * Processes test results
   *
   * @param testResults The test results
   * @param options Options for processing
   */
  async processTestResults(testResults, options = { createIssues: true, closeIssues: true }) {
    // Process each test file
    for (const result of testResults) {
      await this.processTestFile(result, options);
    }
  }

  /**
   * Processes a test file
   *
   * @param testFile The test file
   * @param options Options for processing
   */
  async processTestFile(testFile, options) {
    const { testFilePath, testResults } = testFile;

    // Skip if no test results
    if (!testResults || testResults.length === 0) {
      return;
    }

    // Get the relative path to the test file
    const relativeFilePath = path.relative(process.cwd(), testFilePath);

    // Process each test result
    for (const test of testResults) {
      // Generate a unique identifier for the test
      const testIdentifier = generateTestIdentifier(relativeFilePath, test.fullName);

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
   * @param testIdentifier The test identifier
   * @param testFilePath The test file path
   * @param test The test result
   */
  async handleFailedTest(testIdentifier, testFilePath, test) {
    // Check if we already have an issue for this test
    const mapping = this.mappingStore.getMapping(testIdentifier);

    if (mapping && mapping.status === 'open') {
      // Issue already exists and is open, update the last failure time
      this.mappingStore.updateMapping(testIdentifier, {
        lastFailure: new Date().toISOString()
      }, {}, testFilePath, test.fullName);
    } else if (mapping && mapping.status === 'closed') {
      // Issue exists but is closed (regression), reopen it
      const comment = this.templateManager.generateReopenComment(test, testFilePath, mapping);
      const result = await this.githubClient.reopenIssue(mapping.issueNumber, comment);

      if (result.success) {
        // Update the mapping
        this.mappingStore.updateMapping(testIdentifier, {
          status: 'open',
          lastFailure: new Date().toISOString()
        }, {}, testFilePath, test.fullName);
      }
    } else {
      // Create a new issue
      const title = `Test Failure: ${getTestDescription(test.fullName)}`;
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
   * @param testIdentifier The test identifier
   * @param testFilePath The test file path
   * @param test The test result
   */
  async handlePassedTest(testIdentifier, testFilePath, test) {
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

  // The generateIssueBody method has been replaced by the template manager
}

module.exports = { IssueManager };
