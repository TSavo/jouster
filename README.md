# Jouster: Stick it to your failing tests

<p align="center">
  <strong>Automatically track and manage your failing tests with GitHub issues</strong>
</p>

<p align="center">
  <!-- Package Information -->
  <a href="https://www.npmjs.com/package/jouster"><img src="https://img.shields.io/npm/v/jouster.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/jouster"><img src="https://img.shields.io/npm/dm/jouster.svg" alt="npm downloads"></a>
  <a href="https://bundlephobia.com/package/jouster"><img src="https://img.shields.io/bundlephobia/min/jouster" alt="Bundle Size"></a>
  <a href="https://libraries.io/npm/jouster"><img src="https://img.shields.io/librariesio/release/npm/jouster" alt="Dependencies"></a>
  <br/>
  <!-- Build & Test Status -->
  <a href="https://github.com/TSavo/jouster/actions"><img src="https://github.com/TSavo/jouster/workflows/CI/badge.svg" alt="CI Status"></a>
  <a href="https://codecov.io/gh/TSavo/jouster"><img src="https://codecov.io/gh/TSavo/jouster/branch/main/graph/badge.svg" alt="Coverage Status"></a>
  <a href="https://github.com/TSavo/jouster/blob/main/LICENSE"><img src="https://img.shields.io/github/license/TSavo/jouster.svg" alt="License"></a>
  <a href="https://img.shields.io/maintenance/yes/2025"><img src="https://img.shields.io/maintenance/yes/2025" alt="Maintenance"></a>
  <br/>
  <!-- Community & Support -->
  <a href="https://github.com/TSavo/jouster/issues"><img src="https://img.shields.io/github/issues/TSavo/jouster" alt="GitHub Issues"></a>
  <a href="https://github.com/TSavo/jouster/pulls"><img src="https://img.shields.io/github/issues-pr/TSavo/jouster" alt="GitHub Pull Requests"></a>
  <a href="https://github.com/TSavo/jouster/stargazers"><img src="https://img.shields.io/github/stars/TSavo/jouster" alt="GitHub Stars"></a>
  <br/>
  <!-- Jouster-Specific -->
  <a href="https://github.com/TSavo/jouster/issues?q=is%3Aissue+label%3Atest-failure"><img src="https://img.shields.io/github/issues/TSavo/jouster/test-failure?label=tests%20tracked" alt="Tests Tracked"></a>
  <a href="https://github.com/TSavo/jouster"><img src="https://img.shields.io/badge/github-integrated-blue" alt="GitHub Integration"></a>
  <a href="https://github.com/TSavo/jouster"><img src="https://img.shields.io/badge/jest-reporter-red" alt="Jest Reporter"></a>
</p>

## Overview

Jouster is a powerful Jest reporter that automatically creates GitHub issues for failing tests and closes them when tests pass. It helps you keep track of test failures, maintain a clear history of issues, and streamline your testing workflow.

## Features

- 🚀 **Automated Issue Management**: Creates GitHub issues for failing tests and closes them when tests pass
- 🔄 **Regression Detection**: Reopens issues when tests start failing again
- 📊 **Detailed Reporting**: Provides rich, detailed information about test failures
- 🔍 **Smart Tracking**: Maintains a local mapping between tests and GitHub issues
- ⚡ **Performance Optimized**: Minimizes GitHub API calls for better performance
- 🎨 **Customizable Templates**: Uses Handlebars templates for rich, customizable issue content
- 🧩 **Extensible**: Supports hooks and plugins to extend functionality
- 🔌 **Easy Integration**: Integrates with Jest as a custom reporter
- 🛠️ **Debugging Support**: Includes debugging commands and tips for fixing issues
- 📝 **Comprehensive Information**: Includes detailed test, environment, and git information

## Installation

```bash
# Using npm
npm install --save-dev jouster

# Using yarn
yarn add --dev jouster
```

### Quick Setup with Wizard

The easiest way to get started is to use our setup wizard, which automatically configures Jouster for your project:

```bash
# Run the wizard in non-interactive mode
npx jouster-setup

# Run the wizard in interactive mode
npx jouster-setup --interactive
```

The wizard:
- Scans your environment and Jest configuration
- Detects GitHub CLI or tokens
- Sets up Jouster with sensible defaults
- Adds npm scripts to your package.json

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

### 2. Add Scripts to package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:with-tracking": "jest --reporters=default --reporters=jouster"
  }
}
```

### 3. Run Tests with Tracking

```bash
# Run tests with automatic issue tracking
npm run test:with-tracking
```

This single command will:
1. Run your tests
2. Create GitHub issues for any failing tests that don't already have issues
3. Close GitHub issues for any tests that are now passing
4. Reopen issues when tests start failing again (regression handling)

You can also run specific tests with issue tracking:

```bash
npm run test:with-tracking -- path/to/test.ts
```

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

    // Path to the template directory
    templateDir: './templates'
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
```

## Templating System

Jouster uses Handlebars templates to generate rich, detailed content for GitHub issues and comments. The templates include:

- `issue-template.hbs`: Template for creating new issues
- `close-comment-template.hbs`: Template for comments when closing issues
- `reopen-comment-template.hbs`: Template for comments when reopening issues

The templates provide detailed information about:

- 🔄 **Reproduction Instructions**: Commands to run the test
- 🛠️ **Debugging Tips**: Commands and tips for troubleshooting
- 📊 **Test Details**: Name, file path, duration, suite
- 🧪 **Jest Information**: Matcher details, expected vs. actual values
- ❌ **Error Information**: Error messages and stack traces
- 🔄 **Git Information**: Branch, commit, author
- 💻 **Environment Information**: Node version, OS
- 📝 **Code Snippets**: From the failing test with line numbers
- 🔍 **Analysis**: Possible causes of the failure
- 📜 **History**: Previous failures and fixes

You can customize these templates to include additional information or change the formatting. See the [Templating Guide](./docs/templating.md) for more details.

## Architecture

Jouster consists of several modular components:

1. **Jest Reporter**: Captures test results and coordinates the issue management process
2. **Template Manager**: Generates rich, detailed content for GitHub issues and comments
3. **GitHub Client**: Interacts with GitHub to create, close, and reopen issues
4. **Issue Manager**: Manages the creation, closure, and reopening of GitHub issues
5. **Mapping Store**: Manages the local mapping database that associates tests with issues
6. **Bug Tracker**: Abstraction layer that supports different bug tracking systems
7. **Hooks and Plugins**: Extend Jouster's functionality and customize its behavior

## Documentation

For more detailed documentation, see the [Jouster Documentation](./docs/README.md).

## Project Status

Jouster uses shields (badges) to provide at-a-glance information about the project:

### Package Information
- **Version**: The current npm package version
- **Downloads**: Monthly downloads from npm
- **Bundle Size**: Minified package size
- **Dependencies**: Status of dependencies

### Build & Test Status
- **CI Status**: Status of continuous integration builds
- **Coverage**: Test coverage percentage
- **License**: Project license
- **Maintenance**: Active maintenance status

### Community & Support
- **Issues**: Number of open issues
- **Pull Requests**: Number of open pull requests
- **Stars**: Number of GitHub stars

### Jouster-Specific
- **Tests Tracked**: Number of tests being tracked with the test-failure label
- **GitHub Integration**: Indicates GitHub integration capability
- **Jest Reporter**: Indicates that Jouster is a Jest reporter

## License

MIT

## Contributing

Contributions are welcome! See the [Contributing Guide](./docs/contributing.md) for more details.
