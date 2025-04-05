import { IssueTrackerPlugin } from '../plugin.interface';
import { TestResult } from '../../types';
import { IssueTrackerConfig } from '../../config';

/**
 * Example plugin that sends notifications to Slack when issues are created or closed
 */
export class SlackNotificationPlugin implements IssueTrackerPlugin {
  /**
   * Plugin name
   */
  public name = 'SlackNotificationPlugin';

  /**
   * Slack webhook URL
   */
  private webhookUrl: string;

  /**
   * Slack channel
   */
  private channel: string;

  /**
   * Creates a new Slack notification plugin
   * 
   * @param options Plugin options
   */
  constructor(options: { webhookUrl: string; channel: string }) {
    this.webhookUrl = options.webhookUrl;
    this.channel = options.channel;
  }

  /**
   * Initialize the plugin
   * 
   * @param config Configuration
   */
  public init(config: IssueTrackerConfig): void {
    console.log(`Initializing ${this.name} plugin`);
    console.log(`Slack webhook URL: ${this.webhookUrl}`);
    console.log(`Slack channel: ${this.channel}`);
  }

  /**
   * Called after creating an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async afterCreateIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    // In a real implementation, this would send a message to Slack
    console.log(`Sending Slack notification for new issue #${issueNumber}`);
    console.log(`Test: ${test.fullName}`);
    console.log(`File: ${filePath}`);
    console.log(`Channel: ${this.channel}`);

    // Example of how to send a message to Slack
    // const message = {
    //   channel: this.channel,
    //   text: `New test failure: ${test.fullName}`,
    //   attachments: [
    //     {
    //       title: `Issue #${issueNumber}`,
    //       title_link: `https://github.com/owner/repo/issues/${issueNumber}`,
    //       text: `Test ${test.fullName} failed in ${filePath}`,
    //       color: 'danger'
    //     }
    //   ]
    // };
    //
    // await fetch(this.webhookUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(message)
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
    // In a real implementation, this would send a message to Slack
    console.log(`Sending Slack notification for closed issue #${issueNumber}`);
    console.log(`Test: ${test.fullName}`);
    console.log(`File: ${filePath}`);
    console.log(`Channel: ${this.channel}`);

    // Example of how to send a message to Slack
    // const message = {
    //   channel: this.channel,
    //   text: `Test fixed: ${test.fullName}`,
    //   attachments: [
    //     {
    //       title: `Issue #${issueNumber} closed`,
    //       title_link: `https://github.com/owner/repo/issues/${issueNumber}`,
    //       text: `Test ${test.fullName} in ${filePath} is now passing`,
    //       color: 'good'
    //     }
    //   ]
    // };
    //
    // await fetch(this.webhookUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(message)
    // });
  }
}
