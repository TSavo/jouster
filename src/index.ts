/**
 * Test Failure GitHub Issue Tracking System
 *
 * This module automatically creates GitHub issues for failing tests
 * and closes them when tests pass.
 */

// Export the Jest reporter
export { IssueTrackerReporter } from './jest/issue-tracker-reporter';

// Export factory functions
export { createIssueTrackerReporter as createJouster } from './factory';
export {
  createGitHubClient,
  createStorageClient,
  createMappingStore,
  createTemplateManager,
  createPluginManager,
  createIssueManager,
  createIssueTrackerReporter
} from './factory';

// Export utilities
export { generateTestIdentifier, parseTestIdentifier, getTestDescription } from './utils/test-identifier';

// Export components for advanced usage
export { MappingStore } from './storage/mapping-store';
export { GitHubClient } from './github/github-client';
export { JsonStorage } from './storage/json-storage';
export { IssueManager } from './issues/issue-manager';
export { TemplateManager } from './templates/template-manager';
export { PluginManager } from './plugins/plugin-manager';

// Export bug tracker implementations
export { GitHubBugTracker } from './trackers/github/github-bug-tracker';
export { FileBugTracker } from './trackers/file/file-bug-tracker';

// Export example plugins
export { SlackNotificationPlugin } from './plugins/examples/slack-notification-plugin';
export { AnalyticsPlugin } from './plugins/examples/analytics-plugin';

// Export default
export { createIssueTrackerReporter as default } from './factory';
