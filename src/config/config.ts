import path from 'path';
import { IssueTrackerPlugin } from '../plugins/plugin.interface';
import { IGitHubClient } from '../github/github-client.interface';
import { IStorageClient } from '../storage/storage-client.interface';
import { ITemplateManager } from '../templates/template-manager.interface';

/**
 * Configuration options for the issue tracker
 */
export interface IssueTrackerConfig {
  // GitHub configuration
  githubClient?: IGitHubClient;
  defaultLabels?: string[];
  
  // Storage configuration
  storageClient?: IStorageClient;
  databasePath?: string;
  
  // Template configuration
  templateManager?: ITemplateManager;
  templateDir?: string;
  
  // Reporter configuration
  generateIssues?: boolean;
  trackIssues?: boolean;
  closeIssues?: boolean;
  reopenIssues?: boolean;
  
  // Plugin configuration
  plugins?: IssueTrackerPlugin[];
}

/**
 * Default configuration options
 */
export const defaultConfig: IssueTrackerConfig = {
  defaultLabels: ['bug'],
  databasePath: 'test-issue-mapping.json',
  templateDir: path.join(__dirname, '../../templates'),
  generateIssues: false,
  trackIssues: false,
  closeIssues: true,
  reopenIssues: true,
  plugins: []
};
