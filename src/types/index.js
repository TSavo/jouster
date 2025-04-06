"use strict";

/**
 * Options for the issue tracker
 */
class IssueTrackerOptions {
  constructor() {
    this.generateIssues = false;
    this.trackIssues = false;
    this.databasePath = null;
  }
}

/**
 * Mapping between a test and a GitHub issue
 */
class IssueMapping {
  constructor() {
    this.issueNumber = 0;
    this.status = 'open';
    this.lastFailure = '';
    this.lastUpdate = '';
  }
}

/**
 * Result of a test
 */
class TestResult {
  constructor() {
    this.testFilePath = '';
    this.testResults = [];
  }
}

module.exports = {
  IssueTrackerOptions,
  IssueMapping,
  TestResult
};
