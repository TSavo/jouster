# Usage Guide

This guide covers the various ways you can use Jouster to track test failures and manage GitHub issues.

## Basic Usage

The simplest way to use Jouster is to run your tests with the `test:with-tracking` script:

```bash
npm run test:with-tracking
```

This will:
1. Run your tests
2. Create GitHub issues for any failing tests
3. Close GitHub issues for any tests that are now passing
4. Reopen issues when tests start failing again (regression handling)

## Command Line Options

Jouster supports several command line options that can be passed to Jest:

### Running Specific Tests

You can run specific tests with issue tracking:

```bash
npm run test:with-tracking -- path/to/test.ts
```

### Generating Issues Only

If you want to generate issues for failing tests but not close issues for passing tests:

```bash
GENERATE_ISSUES=true TRACK_ISSUES=false npm test
```

### Tracking Issues Only

If you want to close issues for passing tests but not generate new issues for failing tests:

```bash
GENERATE_ISSUES=false TRACK_ISSUES=true npm test
```

### Using a Custom Database Path

You can specify a custom path for the mapping database:

```bash
DATABASE_PATH=custom-mapping.json npm run test:with-tracking
```

### Using a Custom Template Directory

You can specify a custom directory for templates:

```bash
TEMPLATE_DIR=./custom-templates npm run test:with-tracking
```

## Environment Variables

Jouster can be configured using environment variables:

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

## Integration with CI/CD

Jouster can be integrated with CI/CD pipelines to automatically track test failures and manage GitHub issues.

### GitHub Actions

Here's an example GitHub Actions workflow that uses Jouster:

```yaml
name: Test with Jouster

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Setup GitHub CLI
      run: |
        sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-key C99B11DEB97541F0
        sudo apt-add-repository https://cli.github.com/packages
        sudo apt update
        sudo apt install gh
        
    - name: Authenticate GitHub CLI
      run: echo "${{ secrets.GITHUB_TOKEN }}" | gh auth login --with-token
      
    - name: Run tests with Jouster
      run: npm run test:with-tracking
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### CircleCI

Here's an example CircleCI configuration that uses Jouster:

```yaml
version: 2.1

jobs:
  test:
    docker:
      - image: cimg/node:16.13
    steps:
      - checkout
      
      - run:
          name: Install dependencies
          command: npm ci
          
      - run:
          name: Setup GitHub CLI
          command: |
            curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
            sudo apt update
            sudo apt install gh
            
      - run:
          name: Authenticate GitHub CLI
          command: echo "$GITHUB_TOKEN" | gh auth login --with-token
          
      - run:
          name: Run tests with Jouster
          command: npm run test:with-tracking
          environment:
            GITHUB_TOKEN: $GITHUB_TOKEN

workflows:
  version: 2
  test:
    jobs:
      - test
```

### Travis CI

Here's an example Travis CI configuration that uses Jouster:

```yaml
language: node_js
node_js:
  - 16

before_install:
  - curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  - echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  - sudo apt update
  - sudo apt install gh
  - echo "$GITHUB_TOKEN" | gh auth login --with-token

script:
  - npm run test:with-tracking

env:
  global:
    - secure: "encrypted-github-token"
```

## Advanced Usage

### Using the REST API Instead of the CLI

By default, Jouster uses the GitHub CLI to interact with GitHub. However, you can also use the GitHub REST API:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    githubUseRest: true,
    githubToken: process.env.GITHUB_TOKEN,
    githubRepo: 'owner/repo'
  }]
]
```

### Using File-Based Bug Tracking

Jouster also supports file-based bug tracking, which creates local files instead of GitHub issues:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    trackerType: 'file',
    bugsDir: './bugs'
  }]
]
```

### Filtering Tests

You can filter which tests are tracked by Jouster:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    testFilters: {
      include: ['**/*.test.ts'],
      exclude: ['**/*.skip.test.ts']
    }
  }]
]
```

### Filtering Branches

You can filter which branches are tracked by Jouster:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    branchFilters: {
      include: ['^feature/', '^bugfix/'],
      exclude: ['^dependabot/']
    }
  }]
]
```

### Using Custom Templates for Specific Tests

You can use custom templates for specific tests:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    templateExceptions: {
      customTemplates: [
        {
          pattern: '**/*.integration.test.ts',
          template: 'integration-issue-template.hbs'
        }
      ]
    }
  }]
]
```

### Skipping Issue Creation for Specific Tests

You can skip issue creation for specific tests:

```javascript
// In your Jest configuration
reporters: [
  'default',
  ['jouster', {
    templateExceptions: {
      skipIssueCreation: ['**/*.flaky.test.ts']
    }
  }]
]
```

## Next Steps

Now that you know how to use Jouster, you might want to:

- Customize your issue templates with the [Templating Guide](./templating.md)
- Extend Jouster with the [Advanced Features Guide](./advanced-features.md)
- Learn about the [API Reference](./api-reference.md)
