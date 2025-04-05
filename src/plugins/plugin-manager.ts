import { IssueTrackerPlugin } from './plugin.interface';
import { TestResult } from '../types';

/**
 * Plugin manager
 */
export class PluginManager {
  private plugins: IssueTrackerPlugin[];

  /**
   * Creates a new plugin manager
   * 
   * @param plugins Plugins
   */
  constructor(plugins: IssueTrackerPlugin[] = []) {
    this.plugins = plugins;
  }

  /**
   * Register a plugin
   * 
   * @param plugin Plugin
   */
  public registerPlugin(plugin: IssueTrackerPlugin): void {
    this.plugins.push(plugin);
  }

  /**
   * Called before creating an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   */
  public async beforeCreateIssue(test: TestResult, filePath: string): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.beforeCreateIssue) {
        await plugin.beforeCreateIssue(test, filePath);
      }
    }
  }

  /**
   * Called after creating an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async afterCreateIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.afterCreateIssue) {
        await plugin.afterCreateIssue(test, filePath, issueNumber);
      }
    }
  }

  /**
   * Called before closing an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async beforeCloseIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.beforeCloseIssue) {
        await plugin.beforeCloseIssue(test, filePath, issueNumber);
      }
    }
  }

  /**
   * Called after closing an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async afterCloseIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.afterCloseIssue) {
        await plugin.afterCloseIssue(test, filePath, issueNumber);
      }
    }
  }

  /**
   * Called before reopening an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async beforeReopenIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.beforeReopenIssue) {
        await plugin.beforeReopenIssue(test, filePath, issueNumber);
      }
    }
  }

  /**
   * Called after reopening an issue
   * 
   * @param test Test result
   * @param filePath Test file path
   * @param issueNumber Issue number
   */
  public async afterReopenIssue(test: TestResult, filePath: string, issueNumber: number): Promise<void> {
    for (const plugin of this.plugins) {
      if (plugin.afterReopenIssue) {
        await plugin.afterReopenIssue(test, filePath, issueNumber);
      }
    }
  }
}
