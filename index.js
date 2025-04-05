"use strict";

// Export all components
const { IssueTrackerReporter } = require('./jest/issue-tracker-reporter');
const { MappingStore } = require('./storage/mapping-store');
const { GitHubClient } = require('./github/github-client');
const { IssueManager } = require('./issues/issue-manager');
const { generateTestIdentifier, parseTestIdentifier, getTestDescription } = require('./utils');
const { IssueTrackerOptions, IssueMapping, TestResult } = require('./types');

module.exports = {
  IssueTrackerReporter,
  MappingStore,
  GitHubClient,
  IssueManager,
  generateTestIdentifier,
  parseTestIdentifier,
  getTestDescription,
  IssueTrackerOptions,
  IssueMapping,
  TestResult
};
