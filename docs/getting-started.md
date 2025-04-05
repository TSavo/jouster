# Getting Started with Jouster

This guide will help you get up and running with Jouster quickly. Jouster is a powerful tool that automatically creates GitHub issues for failing tests and closes them when tests pass.

> **Tip**: The easiest way to get started is to use our [Setup Wizard](./setup-wizard.md), which automatically configures Jouster for your project:
> ```bash
> npx jouster-setup
> ```

## Installation

You can install Jouster using npm or yarn:

```bash
# Using npm
npm install --save-dev jouster

# Using yarn
yarn add --dev jouster
```

## Quick Start

### 1. Configure Jest

Add Jouster to your Jest configuration in `jest.config.js`:

```javascript
module.exports = {
  // ... your other Jest configuration
  reporters: [
    'default',
    ['jouster', {
      generateIssues: true,
      trackIssues: true
    }]
  ]
};
```

Alternatively, you can create a separate configuration file for running tests with Jouster:

```javascript
// jest.with-tracking.js
const baseConfig = require('./jest.config');

module.exports = {
  ...baseConfig,
  reporters: [
    'default',
    ['jouster', {
      generateIssues: true,
      trackIssues: true
    }]
  ]
};
```

### 2. Add Scripts to package.json

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:with-tracking": "jest --config=jest.with-tracking.js"
  }
}
```

### 3. Ensure GitHub CLI is Installed

Jouster uses the GitHub CLI (`gh`) to interact with GitHub. Make sure it's installed and authenticated:

```bash
# Install GitHub CLI (if not already installed)
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
sudo apt install gh

# Authenticate with GitHub
gh auth login
```

### 4. Run Tests with Tracking

Now you can run your tests with issue tracking:

```bash
npm run test:with-tracking
```

This will:
1. Run your tests
2. Create GitHub issues for any failing tests
3. Close GitHub issues for any tests that are now passing
4. Reopen issues when tests start failing again (regression handling)

## Configuration

Jouster can be configured through the Jest reporter options or environment variables.

### Reporter Options

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    // Whether to generate issues for failing tests
    generateIssues: true,

    // Whether to track issues for failing tests
    trackIssues: true,

    // Whether to close issues for passing tests
    closeIssues: true,

    // Whether to reopen issues for failing tests
    reopenIssues: true,

    // Path to the database file
    databasePath: 'test-issue-mapping.json',

    // Default labels for issues
    defaultLabels: ['bug', 'test-failure'],

    // Bug tracker type ('github' or 'file')
    trackerType: 'github',

    // Path to the bugs directory (for file tracker)
    bugsDir: './bugs',

    // GitHub labels to apply to issues
    githubLabels: ['bug', 'test-failure'],

    // Whether to use the REST API instead of the CLI
    githubUseRest: false,

    // GitHub personal access token (required when using REST API)
    githubToken: process.env.GITHUB_TOKEN,

    // GitHub repository in the format 'owner/repo' (required when using REST API)
    githubRepo: 'owner/repo',

    // Path to the template directory
    templateDir: './templates',

    // Test pattern filters
    testFilters: {
      // Patterns to include (glob patterns)
      include: ['**/*.test.ts'],
      // Patterns to exclude (glob patterns)
      exclude: ['**/*.skip.test.ts']
    },

    // Branch filters for issue creation
    branchFilters: {
      // Branches to include (regex patterns)
      include: ['^feature/', '^bugfix/'],
      // Branches to exclude (regex patterns)
      exclude: ['^dependabot/']
    },

    // Template exceptions for specific test types
    templateExceptions: {
      // Test patterns to skip issue creation for (glob patterns)
      skipIssueCreation: ['**/*.flaky.test.ts'],
      // Custom templates for specific test types
      customTemplates: [
        {
          pattern: '**/*.integration.test.ts',
          template: 'integration-issue-template.hbs'
        }
      ]
    },

    // Template data hooks
    hooks: []
  }]
]
```

### Environment Variables

You can also configure Jouster using environment variables:

```bash
# Whether to generate issues for failing tests
GENERATE_ISSUES=true

# Whether to track issues for failing tests
TRACK_ISSUES=true

# Whether to close issues for passing tests
CLOSE_ISSUES=true

# Whether to reopen issues for failing tests
REOPEN_ISSUES=true

# Path to the database file
DATABASE_PATH=test-issue-mapping.json

# Default labels for issues
DEFAULT_LABELS=bug,test-failure

# Bug tracker type ('github' or 'file')
TRACKER_TYPE=github

# Path to the bugs directory (for file tracker)
BUGS_DIR=./bugs

# GitHub labels to apply to issues
GITHUB_LABELS=bug,test-failure

# Whether to use the REST API instead of the CLI
GITHUB_USE_REST=false

# GitHub personal access token (required when using REST API)
GITHUB_TOKEN=your-token

# GitHub repository in the format 'owner/repo' (required when using REST API)
GITHUB_REPO=owner/repo

# Path to the template directory
TEMPLATE_DIR=./templates
```

## Next Steps

Now that you have Jouster set up, you might want to:

- Learn about [Core Concepts](./core-concepts.md) to understand how Jouster works
- Explore the [Usage Guide](./usage-guide.md) for more advanced usage scenarios
- Customize your issue templates with the [Templating Guide](./templating.md)
- Add custom hooks or plugins with the [Advanced Features Guide](./advanced-features.md)
