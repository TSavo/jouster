import { IssueTrackerPlugin } from '../plugin.interface';
import { TestResult } from '../../types';
import { IssueTrackerConfig } from '../../config';

/**
 * Example plugin that collects analytics about test failures
 */
export class AnalyticsPlugin implements IssueTrackerPlugin {
  /**
   * Plugin name
   */
  public name = 'AnalyticsPlugin';

  /**
   * Analytics API URL
   */
  private apiUrl: string;

  /**
   * API key
   */
  private apiKey: string;

  /**
   * Project ID
   */
  private projectId: string;

  /**
   * Test failure counts
   */
  private failureCounts: Record<string, number> = {};

  /**
   * Creates a new analytics plugin
   *
   * @param options Plugin options
   */
  constructor(options: { apiUrl: string; apiKey: string; projectId: string }) {
    this.apiUrl = options.apiUrl;
    this.apiKey = options.apiKey;
    this.projectId = options.projectId;
  }

  /**
   * Initialize the plugin
   *
   * @param config Configuration
   */
  public init(config: IssueTrackerConfig): void {
    console.log(`Initializing ${this.name} plugin`);
    console.log(`Analytics API URL: ${this.apiUrl}`);
    console.log(`Project ID: ${this.projectId}`);
  }

  /**
   * Called before creating an issue
   *
   * @param test Test result
   * @param filePath Test file path
   */
  public async beforeCreateIssue(test: TestResult, filePath: string): Promise<void> {
    // Track the failure
    const testId = `${filePath}:${test.fullName}`;
    this.failureCounts[testId] = (this.failureCounts[testId] || 0) + 1;

    // In a real implementation, this would send analytics data
    console.log(`Tracking test failure: ${testId}`);
    console.log(`Failure count: ${this.failureCounts[testId]}`);

    // Example of how to send analytics data
    // const data = {
    //   projectId: this.projectId,
    //   testId,
    //   testName: test.fullName,
    //   filePath,
    //   failureCount: this.failureCounts[testId],
    //   timestamp: new Date().toISOString()
    // };
    //
    // await fetch(this.apiUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${this.apiKey}`
    //   },
    //   body: JSON.stringify(data)
    // });
  }

  /**
   * Called after closing an issue
   *
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async afterCloseIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    // Track the fix
    const testId = `${filePath}:${test.fullName}`;

    // In a real implementation, this would send analytics data
    console.log(`Tracking test fix: ${testId}`);
    console.log(`Issue number: ${issueNumber}`);

    // Example of how to send analytics data
    // const data = {
    //   projectId: this.projectId,
    //   testId,
    //   testName: test.fullName,
    //   filePath,
    //   issueNumber,
    //   fixTimestamp: new Date().toISOString(),
    //   timeToFix: 0 // In a real implementation, calculate time between issue creation and closure
    // };
    //
    // await fetch(`${this.apiUrl}/fixes`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${this.apiKey}`
    //   },
    //   body: JSON.stringify(data)
    // });
  }
}
