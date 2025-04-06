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
  private githubClient: GitHubClient;
  private mappingStore: MappingStore;
  private options: IssueTrackerOptions;

  /**
   * Creates a new IssueManager instance
   *
   * @param options Options for the issue tracker
   * @param githubClient GitHub client instance
   * @param mappingStore Mapping store instance
   */
  constructor(
    githubClient: GitHubClient,
    mappingStore: MappingStore,
    options: IssueTrackerOptions
  ) {
    this.options = options;
    this.githubClient = githubClient;
    this.mappingStore = mappingStore;
  }

  /**
   * Processes a test result
   *
   * @param testResult The test result to process
   * @returns A promise that resolves when processing is complete
   */
  public async processTestResult(testResult: TestResult): Promise<void> {
    const testIdentifier = generateTestIdentifier(testResult);
    const mapping = this.mappingStore.getIssueMapping(testIdentifier);

    if (testResult.status === 'failed') {
      await this.handleFailingTest(testIdentifier, testResult, mapping !== undefined);
    } else if (testResult.status === 'passed' && mapping && mapping.status === 'open') {
      await this.handlePassingTest(testIdentifier, testResult, mapping.issueNumber);
    }
  }

  /**
   * Handles a failing test
   *
   * @param testIdentifier The test identifier
   * @param testResult The test result
   * @param hasExistingIssue Whether the test already has an issue
   */
  private async handleFailingTest(
    testIdentifier: TestIdentifier,
    testResult: TestResult,
    hasExistingIssue: boolean
  ): Promise<void> {
    // Only create a new issue if:
    // 1. We're generating issues
    // 2. The test doesn't already have an issue
    if (this.options.generateIssues && !hasExistingIssue) {
      const title = `Test Failure: ${testResult.testName} in ${testResult.testSuiteName}`;
      const body = this.generateIssueBody(testIdentifier, testResult);

      const result = await this.githubClient.createIssue(title, body);

      if (result.success && result.issueNumber) {
        // Store the mapping
        this.mappingStore.setIssueMapping(testIdentifier, {
          issueNumber: result.issueNumber,
          status: 'open',
          lastFailure: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        });
      }
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
    // Only close the issue if we're tracking issues
    if (this.options.trackIssues) {
      const comment = `Test is now passing: ${getTestDescription(testIdentifier)}`;

      const result = await this.githubClient.closeIssue(issueNumber, comment);

      if (result.success) {
        // Update the mapping
        this.mappingStore.updateIssueStatus(testIdentifier, 'closed');
      }
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
    this.mappingStore.saveDatabase();
  }
}
