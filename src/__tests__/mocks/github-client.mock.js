/**
 * Mock implementation of the GitHubClient class for testing
 */
class MockGitHubClient {
  /**
   * Creates a new issue
   *
   * @param {string} title The issue title
   * @param {string} body The issue body
   * @param {string[]} labels The issue labels
   * @returns {Promise<{success: boolean, error: string, issueNumber: number}>} The result
   */
  async createIssue(title, body, labels) {
    return {
      success: true,
      error: '',
      issueNumber: 123
    };
  }

  /**
   * Reopens an issue
   *
   * @param {number} issueNumber The issue number
   * @param {string} detailedComment Optional detailed comment
   * @returns {Promise<{success: boolean, error: string, issueNumber: number}>} The result
   */
  async reopenIssue(issueNumber, detailedComment) {
    return {
      success: true,
      error: '',
      issueNumber
    };
  }

  /**
   * Closes an issue
   *
   * @param {number} issueNumber The issue number
   * @param {string} detailedComment Optional detailed comment
   * @returns {Promise<{success: boolean, error: string, issueNumber: number}>} The result
   */
  async closeIssue(issueNumber, detailedComment) {
    return {
      success: true,
      error: '',
      issueNumber
    };
  }

  /**
   * Checks if GitHub CLI is available
   *
   * @returns {Promise<boolean>} True if GitHub CLI is available
   */
  async isGitHubCliAvailable() {
    return true;
  }

  /**
   * Formats an error message
   *
   * @param {Error|string} error The error to format
   * @returns {string} The formatted error message
   */
  formatErrorMessage(error) {
    if (error === null) {
      return 'null';
    }
    if (error === undefined) {
      return 'undefined';
    }
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return String(error);
  }

  /**
   * Extracts the issue number from a URL
   *
   * @param {string} url The URL to extract from
   * @returns {number} The issue number
   */
  extractIssueNumber(url) {
    if (!url) {
      return 0;
    }

    const match = url.match(/\/issues\/(\d+)$/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return 0;
  }
}

module.exports = { MockGitHubClient };

// Add a test to prevent Jest from complaining about no tests
describe('MockGitHubClient', () => {
  it('should create a mock GitHub client', () => {
    const client = new MockGitHubClient();
    expect(client).toBeDefined();
  });
});
