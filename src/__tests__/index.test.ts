import * as index from '../index';
import { createIssueTrackerReporter } from '../factory';

describe('index', () => {
  it('should export all public APIs', () => {
    // Check that all expected exports are defined
    expect(index.createGitHubClient).toBeDefined();
    expect(index.createStorageClient).toBeDefined();
    expect(index.createMappingStore).toBeDefined();
    expect(index.createTemplateManager).toBeDefined();
    expect(index.createPluginManager).toBeDefined();
    expect(index.createIssueManager).toBeDefined();
    expect(index.createIssueTrackerReporter).toBeDefined();

    // Check that all component interfaces are exported
    // These are now exported as types, so we can't check them directly
    // Instead, check that the implementations are exported
    expect(index.GitHubClient).toBeDefined();
    expect(index.JsonStorage).toBeDefined();
    expect(index.MappingStore).toBeDefined();
    expect(index.TemplateManager).toBeDefined();
    expect(index.IssueManager).toBeDefined();

    // Check that the bug tracker implementations are exported
    expect(index.GitHubBugTracker).toBeDefined();
    expect(index.FileBugTracker).toBeDefined();

    // Check that other component implementations are exported
    expect(index.PluginManager).toBeDefined();
    expect(index.IssueTrackerReporter).toBeDefined();

    // Check that all utility functions are exported
    expect(index.generateTestIdentifier).toBeDefined();
    expect(index.parseTestIdentifier).toBeDefined();
    expect(index.getTestDescription).toBeDefined();

    // Check that all example plugins are exported
    expect(index.SlackNotificationPlugin).toBeDefined();
    expect(index.AnalyticsPlugin).toBeDefined();
  });

  it('should export createIssueTrackerReporter as default', () => {
    expect(index.default).toBe(createIssueTrackerReporter);
  });
});
