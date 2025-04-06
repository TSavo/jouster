import { IGitHubClient, IssueResult } from './github-client.interface';

/**
 * GitHub client implementation using the REST API
 */
export class GitHubRestClient implements IGitHubClient {
  private token: string;
  private repo: string;
  private baseUrl: string;

  /**
   * Creates a new GitHub REST client
   *
   * @param token GitHub personal access token
   * @param repo GitHub repository in the format 'owner/repo'
   * @param baseUrl Base URL for the GitHub API (default: 'https://api.github.com')
   */
  constructor(token: string, repo: string, baseUrl = 'https://api.github.com') {
    this.token = token;
    this.repo = repo;
    this.baseUrl = baseUrl;
  }

  /**
   * Check if GitHub CLI is available
   *
   * Note: This method always returns true for the REST client since it doesn't depend on the CLI
   */
  public async isGitHubCliAvailable(): Promise<boolean> {
    // The REST client doesn't use the CLI, so it's always available
    return true;
  }

  /**
   * Create a new GitHub issue
   *
   * @param title Issue title
   * @param body Issue body
   * @param labels Optional labels to apply to the issue
   */
  public async createIssue(title: string, body: string, labels?: string[]): Promise<IssueResult> {
    try {
      const url = `${this.baseUrl}/repos/${this.repo}/issues`;
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title,
          body,
          labels
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error creating issue: ${errorData.message} (${response.status} ${response.statusText})`
        };
      }

      const data = await response.json();
      return {
        success: true,
        issueNumber: data.number
      };
    } catch (error) {
      return {
        success: false,
        error: `Error creating issue: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Reopen an existing GitHub issue
   *
   * @param issueNumber Issue number
   * @param comment Comment to add when reopening the issue
   */
  public async reopenIssue(issueNumber: number, comment: string): Promise<IssueResult> {
    try {
      // First, update the issue state to open
      const updateUrl = `${this.baseUrl}/repos/${this.repo}/issues/${issueNumber}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          state: 'open'
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return {
          success: false,
          error: `Error reopening issue: ${errorData.message} (${updateResponse.status} ${updateResponse.statusText})`
        };
      }

      // Then, add a comment
      await this.addComment(issueNumber, comment);

      const data = await updateResponse.json();
      return {
        success: true,
        issueNumber: data.number
      };
    } catch (error) {
      return {
        success: false,
        error: `Error reopening issue: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Close an existing GitHub issue
   *
   * @param issueNumber Issue number
   * @param comment Comment to add when closing the issue
   */
  public async closeIssue(issueNumber: number, comment: string): Promise<IssueResult> {
    try {
      // First, update the issue state to closed
      const updateUrl = `${this.baseUrl}/repos/${this.repo}/issues/${issueNumber}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          state: 'closed'
        })
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        return {
          success: false,
          error: `Error closing issue: ${errorData.message} (${updateResponse.status} ${updateResponse.statusText})`
        };
      }

      // Then, add a comment
      await this.addComment(issueNumber, comment);

      const data = await updateResponse.json();
      return {
        success: true,
        issueNumber: data.number
      };
    } catch (error) {
      return {
        success: false,
        error: `Error closing issue: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Add a comment to an issue
   *
   * @param issueNumber Issue number
   * @param comment Comment text
   */
  private async addComment(issueNumber: number, comment: string): Promise<void> {
    const commentUrl = `${this.baseUrl}/repos/${this.repo}/issues/${issueNumber}/comments`;
    await fetch(commentUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        body: comment
      })
    });
  }

  /**
   * Check the status of a GitHub issue
   *
   * @param issueNumber Issue number
   * @returns Promise resolving to an object with success flag and status if successful
   */
  public async checkIssueStatus(issueNumber: number): Promise<{ success: boolean; status?: 'open' | 'closed'; error?: string }> {
    try {
      const url = `${this.baseUrl}/repos/${this.repo}/issues/${issueNumber}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: `Error checking issue status: ${errorData.message} (${response.status} ${response.statusText})`
        };
      }

      const data = await response.json();
      const status = data.state === 'open' ? 'open' : 'closed';

      return {
        success: true,
        status
      };
    } catch (error) {
      return {
        success: false,
        error: `Error checking issue status: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  /**
   * Get headers for GitHub API requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `token ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    };
  }
}
