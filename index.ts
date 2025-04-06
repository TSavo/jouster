/**
 * Test Failure GitHub Issue Tracking System
 *
 * This module automatically creates GitHub issues for failing tests
 * and closes them when tests pass.
 */

// Export the Jest reporter
export { IssueTrackerReporter } from './src/jest/issue-tracker-reporter';

// Export utilities
export { generateTestIdentifier, parseTestIdentifier, getTestDescription } from './src/utils/test-identifier';

// Export components for advanced usage
export { MappingStore } from './src/storage/mapping-store';
export { GitHubClient } from './src/github/github-client';
export { IssueManager } from './src/issues/issue-manager';
export { TemplateManager } from './src/templates/template-manager';
