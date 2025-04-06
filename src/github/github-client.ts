import { exec } from 'child_process';
import { promisify } from 'util';
import { GitHubOperationResult } from '../types';

// Export for testing
export const execAsync = promisify(exec);

/**
 * Client for interacting with GitHub via the CLI
 */
export class GitHubClient {
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
    labels: string[] = ['test-failure']
  ): Promise<GitHubOperationResult> {
    try {
      // Create a temporary file for the issue body
      const tempFile = require('os').tmpdir() + '/issue-body-' + Date.now() + '.md';
      require('fs').writeFileSync(tempFile, body, 'utf8');

      // Build the command
      const labelsArg = labels.map(label => `--label "${label}"`).join(' ');
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
   * Extract the issue number from a GitHub issue URL
   * @param issueUrl The GitHub issue URL
   * @returns The issue number, or 0 if it couldn't be extracted
   */
  public extractIssueNumber(issueUrl: string): number {
    try {
      const parts = issueUrl.split('/');
      const lastPart = parts.pop() || '0';
      const issueNumber = parseInt(lastPart, 10);
      return isNaN(issueNumber) ? 0 : issueNumber;
    } catch (error) {
      return 0;
    }
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
}
