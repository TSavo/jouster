import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import { IGitHubClient, IssueResult } from './github-client.interface';

// Export for testing
export const execAsync = promisify(exec);

/**
 * Client for interacting with GitHub via the CLI
 */
export class GitHubClient implements IGitHubClient {
  private defaultLabels: string[];

  /**
   * Creates a new GitHub client
   *
   * @param defaultLabels Default labels to apply to issues
   */
  constructor(defaultLabels: string[] = ['bug']) {
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
    labels: string[] = this.defaultLabels
  ): Promise<IssueResult> {
    try {
      // Create a temporary file for the issue body
      const tempFile = os.tmpdir() + '/issue-body-' + Date.now() + '.md';
      fs.writeFileSync(tempFile, body, 'utf8');

      // Build the command
      // Only include labels that are not empty
      const validLabels = labels.filter(label => label && label.trim() !== '');
      console.log('[Jouster] Using labels:', validLabels);

      let command = `gh issue create --title "${title}" --body-file "${tempFile}"`;

      // Add labels if there are any valid ones
      if (validLabels.length > 0) {
        const labelsArg = validLabels.map(label => `--label "${label}"`).join(' ');
        command += ` ${labelsArg}`;
      }

      // Execute the command
      const { stdout } = await execAsync(command);

      // Clean up the temporary file
      fs.unlinkSync(tempFile);

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
   * Reopens a GitHub issue
   *
   * @param issueNumber The issue number
   * @param comment Comment to add when reopening
   * @returns A promise that resolves to the result of the operation
   */
  public async reopenIssue(
    issueNumber: number,
    comment: string
  ): Promise<IssueResult> {
    try {
      // First reopen the issue
      await execAsync(`gh issue reopen ${issueNumber}`);

      // Then add a comment if provided
      if (comment) {
        // Create a temporary file for the comment body
        const tempFile = os.tmpdir() + '/comment-body-' + Date.now() + '.md';
        fs.writeFileSync(tempFile, comment, 'utf8');

        // Add the comment
        await execAsync(`gh issue comment ${issueNumber} --body-file "${tempFile}"`);

        // Clean up the temporary file
        fs.unlinkSync(tempFile);
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
        issueNumber,
        error: errorMessage
      };
    }
  }

  /**
   * Closes a GitHub issue
   *
   * @param issueNumber The issue number
   * @param comment Comment to add when closing
   * @returns A promise that resolves to the result of the operation
   */
  public async closeIssue(
    issueNumber: number,
    comment: string
  ): Promise<IssueResult> {
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
   * Format an error message from an error object
   * @param error The error object
   * @returns A formatted error message string
   */
  private formatErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Extract the issue number from a GitHub issue URL
   * @param issueUrl The GitHub issue URL
   * @returns The issue number, or 0 if it couldn't be extracted
   */
  private extractIssueNumber(issueUrl: string): number {
    if (!issueUrl) {
      return 0;
    }

    try {
      return this.parseIssueNumber(issueUrl);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Parse the issue number from a GitHub issue URL
   * @param issueUrl The GitHub issue URL
   * @returns The issue number
   */
  private parseIssueNumber(issueUrl: string): number {
    const parts = issueUrl.split('/');
    const lastPart = parts.pop() || '0';
    const issueNumber = parseInt(lastPart, 10);
    return isNaN(issueNumber) ? 0 : issueNumber;
  }
}
