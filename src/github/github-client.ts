import { exec } from 'child_process';
import { promisify } from 'util';
import { GitHubOperationResult } from '../types';

// Export for testing
export const execAsync = promisify(exec);

/**
 * Client for interacting with GitHub via the CLI
 */
export class GitHubClient {
  private defaultLabels: string[];

  /**
   * Creates a new GitHubClient
   *
   * @param defaultLabels Optional default labels to apply to issues
   */
  constructor(defaultLabels: string[] = ['test-failure']) {
    this.defaultLabels = defaultLabels;
  }
  /**
   * Checks if the GitHub CLI is available
   *
   * @returns A promise that resolves to true if the CLI is available
   */
  public async isGitHubCliAvailable(): Promise<boolean> {
    try {
      await execAsync('gh --version');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates a new GitHub issue
   *
   * @param title The issue title
   * @param body The issue body
   * @param labels Optional labels to apply
   * @returns A promise that resolves to the result of the operation
   */
  public async createIssue(
    title: string,
    body: string,
    labels?: string[]
  ): Promise<GitHubOperationResult> {
    // Use provided labels or default labels
    const issueLabels = labels || this.defaultLabels;
    try {
      // Create a temporary file for the issue body
      const tempFile = require('os').tmpdir() + '/issue-body-' + Date.now() + '.md';
      require('fs').writeFileSync(tempFile, body, 'utf8');

      // Build the command
      const labelsArg = issueLabels.map(label => `--label "${label}"`).join(' ');
      const command = `gh issue create --title "${title}" --body-file "${tempFile}" ${labelsArg}`;

      // Execute the command
      const { stdout } = await execAsync(command);

      // Clean up the temporary file
      require('fs').unlinkSync(tempFile);

      // Return the result with the issue number extracted from the URL
      return {
        success: true,
        issueNumber: this.extractIssueNumber(stdout.trim())
      };
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Format an error message from an error object
   * @param error The error object
   * @returns A formatted error message string
   */
  public formatErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }



  /**
   * Closes a GitHub issue
   *
   * @param issueNumber The issue number
   * @param comment Optional comment to add when closing
   * @returns A promise that resolves to the result of the operation
   */
  public async closeIssue(
    issueNumber: number,
    comment?: string
  ): Promise<GitHubOperationResult> {
    try {
      // Build the command
      let command = `gh issue close ${issueNumber}`;
      if (comment) {
        command += ` --comment "${comment}"`;
      }

      // Execute the command
      await execAsync(command);

      return {
        success: true,
        issueNumber
      };
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return {
        success: false,
        issueNumber,
        error: errorMessage
      };
    }
  }

  /**
   * Adds a comment to a GitHub issue
   *
   * @param issueNumber The issue number
   * @param comment The comment text
   * @returns A promise that resolves to the result of the operation
   */
  public async addComment(
    issueNumber: number,
    comment: string
  ): Promise<GitHubOperationResult> {
    try {
      // Build the command
      const command = `gh issue comment ${issueNumber} --body "${comment}"`;

      // Execute the command
      await execAsync(command);

      return {
        success: true,
        issueNumber
      };
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return {
        success: false,
        issueNumber,
        error: errorMessage
      };
    }
  }

  /**
   * Reopens a closed GitHub issue
   *
   * @param issueNumber The issue number
   * @param comment Optional comment to add when reopening
   * @returns A promise that resolves to the result of the operation
   */
  public async reopenIssue(
    issueNumber: number,
    comment?: string
  ): Promise<GitHubOperationResult> {
    try {
      // Build the command
      let command = `gh issue reopen ${issueNumber}`;

      // Execute the command
      await execAsync(command);

      // Add a comment if provided
      if (comment) {
        await this.addComment(issueNumber, comment);
      }

      return {
        success: true,
        issueNumber
      };
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Checks the status of a GitHub issue
   *
   * @param issueNumber The issue number
   * @returns A promise that resolves to the result of the operation with the issue status
   */
  public async checkIssueStatus(issueNumber: number): Promise<{ success: boolean; status?: 'open' | 'closed'; error?: string }> {
    try {
      // Execute the command to get issue details in JSON format
      const { stdout } = await execAsync(`gh issue view ${issueNumber} --json state`);

      // Parse the JSON response
      const response = JSON.parse(stdout);

      // Map GitHub's state to our status format
      const status = response.state === 'OPEN' ? 'open' : 'closed';

      return {
        success: true,
        status
      };
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Parses the issue number from a GitHub issue URL
   *
   * @param url The GitHub issue URL
   * @returns The issue number or 0 if not found
   */
  public parseIssueNumber(url: string): number {
    if (!url) {
      return 0;
    }

    // Extract the issue number from the URL
    const parts = url.split('/');
    if (parts.length === 0) {
      return 0;
    }

    const lastPart = parts[parts.length - 1];
    const issueNumber = parseInt(lastPart, 10);

    return isNaN(issueNumber) ? 0 : issueNumber;
  }

  /**
   * Extracts the issue number from a GitHub issue URL
   *
   * @param url The GitHub issue URL
   * @returns The issue number or 0 if not found
   */
  public extractIssueNumber(url: string): number {
    try {
      return this.parseIssueNumber(url);
    } catch (error) {
      return 0;
    }
  }
}
