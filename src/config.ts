import { IGitHubClient } from './github/github-client.interface';
import { IStorageClient } from './storage/storage-client.interface';
import { ITemplateManager } from './templates/template-manager.interface';
import { IssueTrackerPlugin } from './plugins/plugin.interface';
import { IBugTracker } from './trackers/bug-tracker.interface';
import { TemplateDataHook } from './hooks/hook.interface';

/**
 * Issue tracker configuration interface
 */
export interface IssueTrackerConfig {
  /**
   * Whether to generate issues for failing tests
   */
  generateIssues?: boolean;

  /**
   * Whether to track issues for failing tests
   */
  trackIssues?: boolean;

  /**
   * Whether to close issues for passing tests
   */
  closeIssues?: boolean;

  /**
   * Whether to reopen issues for failing tests
   */
  reopenIssues?: boolean;

  /**
   * Path to the database file
   */
  databasePath?: string;

  /**
   * Path to the template directory
   */
  templateDir?: string;

  /**
   * Default labels for issues
   */
  defaultLabels?: string[];

  /**
   * GitHub client
   */
  githubClient?: IGitHubClient;

  /**
   * Storage client
   */
  storageClient?: IStorageClient;

  /**
   * Template manager
   */
  templateManager?: ITemplateManager;

  /**
   * Plugins
   */
  plugins?: IssueTrackerPlugin[];

  /**
   * Bug tracker type
   */
  trackerType?: 'github' | 'file';

  /**
   * Bug tracker
   */
  bugTracker?: IBugTracker;

  /**
   * Path to the bugs directory
   */
  bugsDir?: string;

  /**
   * GitHub labels to apply to issues
   */
  githubLabels?: string[];

  /**
   * Whether to use the REST API instead of the CLI
   */
  githubUseRest?: boolean;

  /**
   * GitHub personal access token (required when using REST API)
   */
  githubToken?: string;

  /**
   * GitHub repository in the format 'owner/repo' (required when using REST API)
   */
  githubRepo?: string;

  /**
   * Test pattern filters
   */
  testFilters?: {
    /**
     * Patterns to include (glob patterns)
     */
    include?: string[];

    /**
     * Patterns to exclude (glob patterns)
     */
    exclude?: string[];
  };

  /**
   * Branch filters for issue creation
   */
  branchFilters?: {
    /**
     * Branches to include (regex patterns)
     */
    include?: string[];

    /**
     * Branches to exclude (regex patterns)
     */
    exclude?: string[];
  };

  /**
   * Template exceptions for specific test types
   */
  templateExceptions?: {
    /**
     * Test patterns to skip issue creation for (glob patterns)
     */
    skipIssueCreation?: string[];

    /**
     * Custom templates for specific test types
     */
    customTemplates?: Array<{
      /**
       * Test pattern (glob pattern)
       */
      pattern: string;

      /**
       * Custom template to use for matching tests
       */
      template: string;
    }>;
  };

  /**
   * Template data hooks
   */
  hooks?: TemplateDataHook[];

  /**
   * Nested configuration (used in tests)
   */
  config?: Partial<IssueTrackerConfig>;
}

/**
 * Config class that provides safe access to configuration properties
 */
export class Config {
  private _config: Partial<IssueTrackerConfig>;

  /**
   * Create a new Config instance
   * @param config Configuration object or undefined
   */
  constructor(config?: Partial<IssueTrackerConfig>) {
    this._config = config || {};
  }

  /**
   * Get the template directory
   */
  get templateDir(): string | undefined {
    return this._config.templateDir;
  }

  /**
   * Get the template manager
   */
  get templateManager(): ITemplateManager | undefined {
    return this._config.templateManager;
  }

  /**
   * Get the hooks array, guaranteed to be an array even if not defined
   */
  get hooks(): TemplateDataHook[] {
    // First check direct hooks
    if (this._config.hooks) {
      return this._config.hooks;
    }

    // Then check nested config hooks
    if (this._config.config?.hooks) {
      return this._config.config.hooks;
    }

    // Return empty array if no hooks found
    return [];
  }

  /**
   * Get the raw config object
   */
  get raw(): Partial<IssueTrackerConfig> {
    return this._config;
  }
}

/**
 * Default configuration
 */
export const defaultConfig: IssueTrackerConfig = {
  generateIssues: false,
  trackIssues: false,
  closeIssues: true,
  reopenIssues: true,
  databasePath: 'test-issue-mapping.json',
  defaultLabels: ['bug', 'test-failure'],
  trackerType: 'github'
};
