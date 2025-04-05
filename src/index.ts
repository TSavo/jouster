/**
 * Jouster: Stick it to your failing tests
 * A Jest reporter that tracks test failures as GitHub issues
 */

// Export all public APIs

// Export configuration
export * from './config';

// Export GitHub client
export { GitHubClient } from './github/github-client';
export { IGitHubClient, IssueResult as GitHubResult } from './github/github-client.interface';

// Export storage
export { JsonStorage } from './storage/json-storage';
export { MappingStore } from './storage/mapping-store';
export { IMappingStore } from './storage/mapping-store.interface';
export { IStorageClient } from './storage/storage-client.interface';
// For backward compatibility
// Already exported above

// Export templates
export { TemplateManager } from './templates/template-manager';
export { ITemplateManager } from './templates/template-manager.interface';
// For backward compatibility
// Already exported above

// Export issues
export { IssueManager } from './issues/issue-manager';
export { IIssueManager } from './issues/issue-manager.interface';
// For backward compatibility
// Already exported above

// Export plugins
export { PluginManager } from './plugins/plugin-manager';
export { IssueTrackerPlugin } from './plugins/plugin.interface';
export { SlackNotificationPlugin, AnalyticsPlugin } from './plugins/examples';
// For backward compatibility
// Already exported above

// Export Jest reporter
export { IssueTrackerReporter } from './jest/issue-tracker-reporter';

// Export utilities
export { generateTestIdentifier, parseTestIdentifier, getTestDescription } from './utils/test-identifier';

// Export types
export * from './types';

// Export trackers
export { IBugTracker, BugInfo } from './trackers/bug-tracker.interface';
export { GitHubBugTracker } from './trackers/github/github-bug-tracker';
export { FileBugTracker } from './trackers/file/file-bug-tracker';

// Export factory functions
export * from './factory';

// Export wizard
export { SetupWizard } from './wizard';

// Export the reporter factory function as default
import { createIssueTrackerReporter } from './factory';
export default createIssueTrackerReporter;
