import { execSync } from 'child_process';

/**
 * Git information
 */
export interface GitInfo {
  branch: string;
  commit: string;
  message: string;
  author: string;
}

/**
 * Utility functions for Git operations
 */
export class GitUtils {
  /**
   * Gets the current branch name
   * 
   * @returns The branch name or 'unknown' if not available
   */
  public static getBranchName(): string {
    try {
      // Different syntax for Windows vs Unix
      if (process.platform === 'win32') {
        return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
      } else {
        return execSync('git branch --show-current').toString().trim();
      }
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Gets the current commit hash
   * 
   * @returns The commit hash or 'unknown' if not available
   */
  public static getCommitHash(): string {
    try {
      return execSync('git log -1 --pretty=format:%H').toString().trim();
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Gets the current commit author
   * 
   * @returns The commit author or 'unknown' if not available
   */
  public static getCommitAuthor(): string {
    try {
      return execSync('git log -1 --pretty=format:%an').toString().trim();
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Gets the current commit message
   * 
   * @returns The commit message or 'unknown' if not available
   */
  public static getCommitMessage(): string {
    try {
      return execSync('git log -1 --pretty=format:%s').toString().trim();
    } catch (e) {
      return 'unknown';
    }
  }

  /**
   * Checks if Git is available
   * 
   * @returns True if Git is available, false otherwise
   */
  public static isGitAvailable(): boolean {
    try {
      execSync('git --version').toString().trim();
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Gets Git information
   * 
   * @returns Git information
   */
  public static getGitInfo(): GitInfo {
    // Default values in case git commands fail
    const defaultInfo: GitInfo = {
      branch: 'unknown',
      commit: 'unknown',
      message: 'unknown',
      author: 'unknown'
    };

    try {
      // Check if git is available
      if (!GitUtils.isGitAvailable()) {
        return defaultInfo;
      }

      return {
        branch: GitUtils.getBranchName(),
        commit: GitUtils.getCommitHash(),
        author: GitUtils.getCommitAuthor(),
        message: GitUtils.getCommitMessage()
      };
    } catch (error) {
      return defaultInfo;
    }
  }
}
