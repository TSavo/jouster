import path from 'path';
import { IssueTrackerConfig, defaultConfig, Config } from './config';
import { GitHubClient } from './github/github-client';
import { GitHubRestClient } from './github/github-rest-client';
import { IGitHubClient } from './github/github-client.interface';
import { JsonStorage } from './storage/json-storage';
import { MappingStore } from './storage/mapping-store';
import { IMappingStore } from './storage/mapping-store.interface';
import { IStorageClient } from './storage/storage-client.interface';
import { TemplateManager } from './templates/template-manager';
import { ITemplateManager } from './templates/template-manager.interface';
import { IssueManager } from './issues/issue-manager';
import { IIssueManager } from './issues/issue-manager.interface';
import { PluginManager } from './plugins/plugin-manager';
import { IssueTrackerReporter } from './jest/issue-tracker-reporter';
import { GitHubBugTracker } from './trackers/github/github-bug-tracker';
import { FileBugTracker } from './trackers/file/file-bug-tracker';
import { IBugTracker } from './trackers/bug-tracker.interface';

/**
 * Create a GitHub client
 *
 * @param config Configuration
 * @returns GitHub client
 */
export function createGitHubClient(config?: Partial<IssueTrackerConfig>): GitHubClient {
  if (config?.githubClient) {
    return config.githubClient as unknown as GitHubClient;
  }

  // Use REST API client if configured
  if (config?.githubUseRest) {
    if (!config.githubToken || !config.githubRepo) {
      throw new Error('GitHub token and repository are required when using REST API');
    }
    return new GitHubRestClient(config.githubToken, config.githubRepo) as unknown as GitHubClient;
  }

  // Default to CLI client
  return new GitHubClient();
}

/**
 * Create a storage client
 *
 * @param config Configuration
 * @returns Storage client
 */
export function createStorageClient(config?: Partial<IssueTrackerConfig>): IStorageClient {
  if (config?.storageClient) {
    return config.storageClient;
  }
  return new JsonStorage(config?.databasePath);
}

/**
 * Create a mapping store
 *
 * @param config Configuration
 * @returns Mapping store
 */
export function createMappingStore(config?: Partial<IssueTrackerConfig>): MappingStore {
  return new MappingStore(config?.databasePath);
}

/**
 * Create a template manager
 *
 * @param rawConfig Configuration
 * @returns Template manager
 */
export function createTemplateManager(rawConfig?: Partial<IssueTrackerConfig>): ITemplateManager {
  // Use the Config class to safely access configuration properties
  const config = new Config(rawConfig);

  // If a template manager is provided, use it
  if (config.templateManager) {
    return config.templateManager;
  }

  // Create template manager with configuration
  const templateManager = new TemplateManager(config.templateDir, config.raw);

  // Register hooks if provided in configuration
  // The Config class guarantees that hooks is always an array
  const hooks = config.hooks;

  // Register all hooks
  for (const hook of hooks) {
    templateManager.registerHook(hook);
  }

  return templateManager;
}

/**
 * Create a plugin manager
 *
 * @param config Configuration
 * @returns Plugin manager
 */
export function createPluginManager(config?: Partial<IssueTrackerConfig>): PluginManager {
  return new PluginManager(config?.plugins);
}

/**
 * Create a bug tracker
 *
 * @param config Configuration
 * @returns Bug tracker
 */
export function createBugTracker(config?: Partial<IssueTrackerConfig>): IBugTracker {
  if (config?.bugTracker) {
    return config.bugTracker;
  }

  const type = config?.trackerType || defaultConfig.trackerType;
  const templateManager = createTemplateManager(config);

  if (type === 'github') {
    const githubClient = createGitHubClient(config);
    const mappingStore = createMappingStore(config);
    return new GitHubBugTracker(githubClient as unknown as IGitHubClient, templateManager, mappingStore as unknown as IMappingStore, config?.defaultLabels);
  } else {
    const baseDir = getBaseDir(config);
    return new FileBugTracker(baseDir, templateManager);
  }
}

/**
 * Get the base directory for file bug tracker
 *
 * @param config Configuration object
 * @returns Base directory path
 */
export function getBaseDir(config?: IssueTrackerConfig): string {
  return config?.bugsDir || path.join(process.cwd(), 'bugs');
}

/**
 * Create an issue manager
 *
 * @param config Configuration
 * @returns Issue manager
 */
export function createIssueManager(config?: Partial<IssueTrackerConfig>): IssueManager {
  const githubClient = createGitHubClient(config);
  const mappingStore = createMappingStore(config);

  return new IssueManager(
    githubClient,
    mappingStore,
    {
      generateIssues: config?.generateIssues,
      trackIssues: config?.trackIssues,
      closeIssues: config?.closeIssues,
      reopenIssues: config?.reopenIssues,
      databasePath: config?.databasePath,
      templateDir: config?.templateDir,
      defaultLabels: config?.defaultLabels,
      githubLabels: config?.githubLabels
    }
  );
}

/**
 * Create an issue tracker reporter
 *
 * @param globalConfig Global Jest configuration
 * @param options Reporter options
 * @returns Issue tracker reporter
 */
export function createIssueTrackerReporter(globalConfig: any, options: any): IssueTrackerReporter {
  return new IssueTrackerReporter(globalConfig, options);
}

// Default export
export default createIssueTrackerReporter;
