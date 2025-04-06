"use strict";

/**
 * Result of a GitHub operation
 */
class GitHubOperationResult {
  constructor(success, error, issueNumber) {
    this.success = success;
    this.error = error;
    this.issueNumber = issueNumber;
  }

  /**
   * Create a successful result
   * @param {number} issueNumber - The issue number
   * @returns {GitHubOperationResult} A successful result
   */
  static success(issueNumber) {
    return new GitHubOperationResult(true, null, issueNumber);
  }

  /**
   * Create a failed result
   * @param {string} error - The error message
   * @param {number} issueNumber - The issue number (optional)
   * @returns {GitHubOperationResult} A failed result
   */
  static failure(error, issueNumber = null) {
    return new GitHubOperationResult(false, error, issueNumber);
  }
}

/**
 * Client for interacting with GitHub via the GitHub CLI
 */
class GitHubClient {
  /**
   * Creates a new GitHubClient with the given dependencies
   *
   * @param {Object} deps - Dependencies
   * @param {Function} deps.execAsync - Promisified exec function
   * @param {Object} deps.fs - File system module
   * @param {Object} deps.os - OS module
   */
  constructor(deps = {}) {
    // Set up dependencies with defaults
    const childProcess = require('child_process');
    const util = require('util');

    this.execAsync = deps.execAsync || util.promisify(childProcess.exec);
    this.fs = deps.fs || require('fs');
    this.os = deps.os || require('os');
  }

  /**
   * Format an error message from an error object
   * @param {Error|string} error - The error object
   * @returns {string} A formatted error message string
   */
  formatErrorMessage(error) {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Extract the issue number from a GitHub issue URL
   * @param {string} issueUrl - The GitHub issue URL
   * @returns {number} The issue number, or 0 if it couldn't be extracted
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
   * Creates a temporary file with the given content
   *
   * @param {string} prefix - Prefix for the temporary file
   * @param {string} content - Content to write to the file
   * @returns {string} Path to the temporary file
   */
  createTempFile(prefix, content) {
    const tempFile = `${this.os.tmpdir()}/${prefix}-${Date.now()}.md`;
    this.fs.writeFileSync(tempFile, content, 'utf8');
    return tempFile;
  }

  /**
   * Deletes a file, ignoring errors
   *
   * @param {string} filePath - Path to the file to delete
   */
  deleteTempFile(filePath) {
    try {
      this.fs.unlinkSync(filePath);
    } catch (e) {
      // Silently ignore cleanup errors
    }
  }

  /**
   * Adds a detailed comment to an issue
   *
   * @param {number} issueNumber - The issue number
   * @param {string} comment - The comment to add
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
  async addDetailedComment(issueNumber, comment) {
    if (!comment || comment.length === 0) {
      return true;
    }

    let tempFile = null;
    try {
      // Create a temporary file for the detailed comment
      tempFile = this.createTempFile('detailed-comment', comment);

      // Add the detailed comment
      const commentCommand = `gh issue comment ${issueNumber} --body-file "${tempFile}"`;
      await this.execAsync(commentCommand);

      return true;
    } catch (error) {
      // Silently continue if comment fails
      return false;
    } finally {
      // Clean up the temporary file
      if (tempFile) {
        this.deleteTempFile(tempFile);
      }
    }
  }

  /**
   * Creates a new GitHub issue
   *
   * @param {string} title - The issue title
   * @param {string} body - The issue body
   * @param {string[]} labels - Optional labels to apply
   * @returns {Promise<GitHubOperationResult>} Result of the operation
   */
  async createIssue(title, body, labels = ['bug']) {
    let tempFile = null;
    try {
      // Create a temporary file for the issue body
      tempFile = this.createTempFile('issue-body', body);

      // Build the command
      const labelsArg = labels.map(label => `--label "${label}"`).join(' ');
      const command = `gh issue create --title "${title}" --body-file "${tempFile}" ${labelsArg}`;

      // Execute the command
      const { stdout } = await this.execAsync(command);

      // Return the result with the issue number extracted from the URL
      return GitHubOperationResult.success(this.extractIssueNumber(stdout.trim()));
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return GitHubOperationResult.failure(errorMessage);
    } finally {
      // Clean up the temporary file
      if (tempFile) {
        this.deleteTempFile(tempFile);
      }
    }
  }

  /**
   * Reopens a GitHub issue
   *
   * @param {number} issueNumber - The issue number
   * @param {string} comment - Optional comment to add when reopening
   * @returns {Promise<GitHubOperationResult>} Result of the operation
   */
  async reopenIssue(issueNumber, comment) {
    try {
      // Create a simplified comment that will fit in the command line
      const shortComment = "Test is failing again. See issue for details.";

      // Build the command
      const command = `gh issue reopen ${issueNumber} --comment "${shortComment}"`;

      // Execute the command
      await this.execAsync(command);

      // Now add a detailed comment if provided
      if (comment && comment.length > 0) {
        await this.addDetailedComment(issueNumber, comment);
      }

      return GitHubOperationResult.success(issueNumber);
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return GitHubOperationResult.failure(errorMessage, issueNumber);
    }
  }

  /**
   * Closes a GitHub issue
   *
   * @param {number} issueNumber - The issue number
   * @param {string} comment - Optional comment to add when closing
   * @returns {Promise<GitHubOperationResult>} Result of the operation
   */
  async closeIssue(issueNumber, comment) {
    try {
      // Create a simplified comment that will fit in the command line
      const shortComment = "Test is now passing. See issue for details.";

      // Build the command
      const command = `gh issue close ${issueNumber} --comment "${shortComment}"`;

      // Execute the command
      await this.execAsync(command);

      // Now add a detailed comment if provided
      if (comment && comment.length > 0) {
        await this.addDetailedComment(issueNumber, comment);
      }

      return GitHubOperationResult.success(issueNumber);
    } catch (error) {
      // Format the error message
      const errorMessage = this.formatErrorMessage(error);

      // Return the error result
      return GitHubOperationResult.failure(errorMessage, issueNumber);
    }
  }

  /**
   * Checks if the GitHub CLI is available
   *
   * @returns {Promise<boolean>} True if the GitHub CLI is available, false otherwise
   */
  async isGitHubCliAvailable() {
    try {
      await this.execAsync('gh --version');
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { GitHubClient, GitHubOperationResult };