"use strict";

const childProcess = require('child_process');
const util = require('util');

// Promisify the exec function
const execAsync = util.promisify(childProcess.exec);

/**
 * Result of a GitHub operation
 */
class GitHubOperationResult {
  constructor(success, error, issueNumber) {
    this.success = success;
    this.error = error;
    this.issueNumber = issueNumber;
  }
}

/**
 * Client for interacting with GitHub via the GitHub CLI
 */
class GitHubClient {
  /**
   * Creates a new GitHub issue
   *
   * @param title The issue title
   * @param body The issue body
   * @param labels Optional labels to apply
   * @returns A promise that resolves to the result of the operation
   */
  async createIssue(
    title,
    body,
    labels = ['bug']
  ) {
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
  formatErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Extract the issue number from a GitHub issue URL
   * @param issueUrl The GitHub issue URL
   * @returns The issue number, or 0 if it couldn't be extracted
   */
  extractIssueNumber(issueUrl) {
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
   * Reopens a GitHub issue
   *
   * @param issueNumber The issue number
   * @param comment Optional comment to add when reopening
   * @returns A promise that resolves to the result of the operation
   */
  async reopenIssue(
    issueNumber,
    comment
  ) {
    try {
      // Create a simplified comment that will fit in the command line
      let shortComment = "Test is failing again. See issue for details.";

      // Build the command
      let command = `gh issue reopen ${issueNumber}`;

      // Add the simplified comment
      command += ` --comment "${shortComment}"`;


      // Execute the command
      await execAsync(command);

      // Now add a detailed comment
      if (comment && comment.length > 0) {
        try {
          // Create a temporary file for the detailed comment
          const tempFile = require('os').tmpdir() + '/detailed-comment-' + Date.now() + '.md';
          require('fs').writeFileSync(tempFile, comment, 'utf8');

          // Add the detailed comment
          const commentCommand = `gh issue comment ${issueNumber} --body-file "${tempFile}"`;
          await execAsync(commentCommand);

          // Clean up the temporary file
          try {
            require('fs').unlinkSync(tempFile);
          } catch (e) {
            // Silently ignore cleanup errors
          }
        } catch (commentError) {
          // Silently continue if comment fails - the issue is still reopened
        }
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
   * @param comment Optional comment to add when closing
   * @returns A promise that resolves to the result of the operation
   */
  async closeIssue(
    issueNumber,
    comment
  ) {
    try {
      // Create a simplified comment that will fit in the command line
      let shortComment = "Test is now passing. See issue for details.";

      // Build the command
      let command = `gh issue close ${issueNumber}`;

      // Add the simplified comment
      command += ` --comment "${shortComment}"`;

      // Execute the command
      await execAsync(command);

      // Now add a detailed comment
      if (comment && comment.length > 0) {
        try {
          // Create a temporary file for the detailed comment
          const tempFile = require('os').tmpdir() + '/detailed-comment-' + Date.now() + '.md';
          require('fs').writeFileSync(tempFile, comment, 'utf8');

          // Add the detailed comment
          const commentCommand = `gh issue comment ${issueNumber} --body-file "${tempFile}"`;
          await execAsync(commentCommand);

          // Clean up the temporary file
          try {
            require('fs').unlinkSync(tempFile);
          } catch (e) {
            // Silently ignore cleanup errors
          }
        } catch (commentError) {
          // Silently continue if comment fails - the issue is still closed
        }
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
   * Checks if the GitHub CLI is available
   *
   * @returns A promise that resolves to true if the GitHub CLI is available, false otherwise
   */
  async isGitHubCliAvailable() {
    try {
      await execAsync('gh --version');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { GitHubClient, GitHubOperationResult };
