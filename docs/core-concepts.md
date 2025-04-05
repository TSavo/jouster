# Core Concepts

This document explains the core concepts behind Jouster and how it works.

## How Jouster Works

Jouster is a Jest reporter that captures test results and manages GitHub issues based on those results. Here's a high-level overview of how it works:

1. **Test Execution**: Jouster runs as a Jest reporter during test execution, capturing the results of each test.

2. **Test Identification**: Each test is assigned a unique identifier based on its file path, suite name, and test name.

3. **Mapping Database**: Jouster maintains a local mapping database that associates test identifiers with GitHub issue numbers.

4. **Issue Management**: Based on the test results and the mapping database, Jouster creates, closes, or reopens GitHub issues as needed.

5. **Templating**: Jouster uses Handlebars templates to generate rich, detailed content for GitHub issues and comments.

6. **Hooks and Plugins**: Jouster supports hooks and plugins to extend its functionality and customize its behavior.

## Test Identification

Jouster identifies tests using a unique identifier that combines the test file path, suite name, and test name. This identifier is used to track the test across multiple runs and associate it with a GitHub issue.

The test identifier format is:

```
path/to/test.test.ts:TestSuiteName:testName
```

For example:

```
src/__tests__/utils/test-identifier.test.ts:TestIdentifier:should generate a unique identifier for a test
```

This identifier is used as the key in the mapping database to associate the test with a GitHub issue.

## Issue Lifecycle

Jouster manages the lifecycle of GitHub issues based on test results:

### Issue Creation

When a test fails and doesn't have an associated GitHub issue, Jouster creates a new issue with detailed information about the failure. This includes:

- Test name and file path
- Error message and stack trace
- Expected and actual values
- Code snippets
- Reproduction instructions
- Debugging tips

### Issue Closure

When a test passes and has an associated open GitHub issue, Jouster closes the issue with a comment indicating that the test is now passing. This includes:

- Verification instructions
- Resolution information
- Duration the test was failing

### Issue Reopening

When a test fails and has an associated closed GitHub issue, Jouster reopens the issue with a comment indicating that the test is failing again. This includes:

- Regression information
- Current error details
- Diff since last fix
- Possible causes

## Mapping Database

Jouster maintains a local mapping database that associates test identifiers with GitHub issue numbers. This database is stored as a JSON file and is used to track the status of each test across multiple runs.

The mapping database structure is:

```json
{
  "testIdentifiers": {
    "path/to/test.test.ts:TestSuiteName:testName": {
      "issueNumber": 123,
      "status": "open",
      "lastFailure": "2023-06-15T10:30:00Z",
      "lastUpdate": "2023-06-16T09:15:00Z"
    }
  }
}
```

The mapping database is used to:

- Determine if a test already has an associated GitHub issue
- Track the status of each test (open, closed)
- Avoid unnecessary GitHub API calls
- Handle test regressions (reopening closed issues)

## Components

Jouster consists of several modular components:

### 1. Jest Reporter

The Jest reporter is the entry point for Jouster. It captures test results and coordinates the issue management process.

```javascript
// Example Jest configuration
reporters: [
  'default',
  ['jouster', {
    generateIssues: true,
    trackIssues: true
  }]
]
```

### 2. Template Manager

The template manager is responsible for generating rich, detailed content for GitHub issues and comments using Handlebars templates.

```javascript
// Example template usage
const templateManager = new TemplateManager('./templates');
const issueBody = templateManager.generateIssueBody(testResult);
```

### 3. GitHub Client

The GitHub client is responsible for interacting with GitHub to create, close, and reopen issues. It uses either the GitHub CLI or the GitHub REST API.

```javascript
// Example GitHub client usage
const githubClient = new GitHubClient();
const issueNumber = await githubClient.createIssue(title, body, labels);
```

### 4. Issue Manager

The issue manager coordinates the creation, closure, and reopening of GitHub issues based on test results and the mapping database.

```javascript
// Example issue manager usage
const issueManager = new IssueManager(mappingStore, githubClient);
await issueManager.handleFailedTest(testResult);
```

### 5. Mapping Store

The mapping store manages the local mapping database that associates test identifiers with GitHub issue numbers.

```javascript
// Example mapping store usage
const mappingStore = new MappingStore('./test-issue-mapping.json');
const issueNumber = mappingStore.getIssueNumber(testIdentifier);
```

### 6. Bug Tracker

The bug tracker is an abstraction layer that supports different bug tracking systems. Currently, Jouster supports GitHub and file-based bug tracking.

```javascript
// Example bug tracker usage
const bugTracker = createBugTracker(config);
await bugTracker.createBug(testResult);
```

### 7. Hooks and Plugins

Hooks and plugins extend Jouster's functionality and customize its behavior.

```javascript
// Example hook usage
const hook = {
  name: 'coverageHook',
  priority: 10,
  processIssueData: (data) => {
    data.coverage = getCoverageData();
    return data;
  }
};

// Example plugin usage
const plugin = new SlackNotificationPlugin({
  webhookUrl: 'https://hooks.slack.com/services/...'
});
```

## Next Steps

Now that you understand the core concepts behind Jouster, you might want to:

- Learn how to use Jouster in the [Usage Guide](./usage-guide.md)
- Customize your issue templates with the [Templating Guide](./templating.md)
- Extend Jouster with the [Advanced Features Guide](./advanced-features.md)
