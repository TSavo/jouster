/**
 * Test Failure GitHub Issue Tracking System
 *
 * This module automatically creates GitHub issues for failing tests
 * and closes them when tests pass.
 */

// Export the Jest reporter
export { IssueTrackerReporter } from './jest/issue-tracker-reporter';

// Export factory function
export { createIssueTrackerReporter as createJouster } from './factory';

// Export utilities
export { generateTestIdentifier, parseTestIdentifier, getTestDescription } from './utils/test-identifier';

// Export components for advanced usage
export { MappingStore } from './storage/mapping-store';
export { GitHubClient } from './github/github-client';
export { IssueManager } from './issues/issue-manager';
export { TemplateManager } from './templates/template-manager';
