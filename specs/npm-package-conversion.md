# Test Issue Tracker NPM Package Conversion Specification

## Overview

This document outlines the plan to convert the Test Issue Tracker into a pluggable NPM package that can be easily integrated into any Jest-based testing workflow. The package will track test failures as GitHub issues (or other issue tracking systems) and provide a robust framework for managing test failures.

## Goals

1. Create a standalone NPM package that can be installed in any Jest project
2. Make the solution pluggable with clear interfaces for each component
3. Support multiple storage backends (JSON, SQLite, MongoDB, etc.)
4. Support multiple issue trackers (GitHub, GitLab, Jira, etc.)
5. Provide comprehensive documentation and examples
6. Implement a plugin system for extending functionality
7. Ensure high test coverage and code quality

## Project Structure

```
jest-issue-tracker/
├── dist/                  # Compiled JavaScript files
├── src/                   # TypeScript source files
│   ├── config/            # Configuration system
│   │   ├── config.ts      # Configuration interface and defaults
│   │   └── index.ts       # Configuration exports
│   ├── github/            # GitHub integration
│   │   ├── github-client.interface.ts  # GitHub client interface
│   │   ├── github-client.ts            # GitHub client implementation
│   │   └── index.ts                    # GitHub exports
│   ├── issues/            # Issue management
│   │   ├── issue-client.interface.ts   # Issue client interface
│   │   ├── issue-manager.interface.ts  # Issue manager interface
│   │   ├── issue-manager.ts            # Issue manager implementation
│   │   └── index.ts                    # Issue exports
│   ├── jest/              # Jest reporter
│   │   ├── issue-tracker-reporter.ts   # Jest reporter implementation
│   │   └── index.ts                    # Jest exports
│   ├── plugins/           # Plugin system
│   │   ├── plugin.interface.ts         # Plugin interface
│   │   ├── plugin-manager.ts           # Plugin manager
│   │   └── index.ts                    # Plugin exports
│   ├── storage/           # Storage mechanisms
│   │   ├── storage-client.interface.ts # Storage client interface
│   │   ├── json-storage.ts             # JSON storage implementation
│   │   ├── sqlite-storage.ts           # SQLite storage implementation
│   │   ├── mongodb-storage.ts          # MongoDB storage implementation
│   │   ├── mapping-store.interface.ts  # Mapping store interface
│   │   ├── mapping-store.ts            # Mapping store implementation
│   │   └── index.ts                    # Storage exports
│   ├── templates/         # Template handling
│   │   ├── template-manager.interface.ts # Template manager interface
│   │   ├── template-manager.ts           # Template manager implementation
│   │   └── index.ts                      # Template exports
│   ├── utils/             # Utility functions
│   │   ├── test-utils.ts               # Test utilities
│   │   ├── git-utils.ts                # Git utilities
│   │   └── index.ts                    # Utility exports
│   ├── types.ts           # Common type definitions
│   ├── factory.ts         # Factory functions
│   └── index.ts           # Main entry point
├── templates/             # Handlebars templates
│   ├── issue-template.hbs             # Issue template
│   ├── comment-template.hbs           # Comment template
│   └── reopen-template.hbs            # Reopen template
├── __tests__/             # Tests
│   ├── github/            # GitHub tests
│   ├── issues/            # Issue tests
│   ├── jest/              # Jest tests
│   ├── plugins/           # Plugin tests
│   ├── storage/           # Storage tests
│   ├── templates/         # Template tests
│   ├── utils/             # Utility tests
│   ├── e2e/               # End-to-end tests
│   └── mocks/             # Test mocks
├── examples/              # Example configurations
│   ├── basic/             # Basic configuration
│   ├── custom-storage/    # Custom storage configuration
│   ├── custom-templates/  # Custom templates configuration
│   └── plugins/           # Plugin examples
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── jest.config.js         # Jest configuration
├── .github/               # GitHub workflows
│   └── workflows/         # GitHub Actions workflows
├── README.md              # Documentation
├── CONTRIBUTING.md        # Contribution guidelines
└── LICENSE                # License file
```

## Component Interfaces

### Configuration Interface

```typescript
// src/config/config.ts
export interface IssueTrackerConfig {
  // GitHub configuration
  githubClient?: IGitHubClient;
  defaultLabels?: string[];
  
  // Storage configuration
  storageClient?: IStorageClient;
  databasePath?: string;
  
  // Template configuration
  templateClient?: ITemplateClient;
  templateDir?: string;
  
  // Reporter configuration
  generateIssues?: boolean;
  trackIssues?: boolean;
  closeIssues?: boolean;
  reopenIssues?: boolean;
  
  // Plugin configuration
  plugins?: IssueTrackerPlugin[];
}

export const defaultConfig: IssueTrackerConfig = {
  defaultLabels: ['bug'],
  databasePath: 'test-issue-mapping.json',
  templateDir: path.join(__dirname, '../../templates'),
  generateIssues: false,
  trackIssues: false,
  closeIssues: true,
  reopenIssues: true,
  plugins: []
};
```

### GitHub Client Interface

```typescript
// src/github/github-client.interface.ts
export interface IGitHubClient {
  isGitHubCliAvailable(): Promise<boolean>;
  createIssue(title: string, body: string, labels?: string[]): Promise<IssueResult>;
  reopenIssue(issueNumber: number, comment: string): Promise<IssueResult>;
  closeIssue(issueNumber: number, comment: string): Promise<IssueResult>;
}

export interface IssueResult {
  success: boolean;
  issueNumber?: number;
  error?: string;
}
```

### Issue Client Interface

```typescript
// src/issues/issue-client.interface.ts
export interface IIssueClient {
  isAvailable(): Promise<boolean>;
  createIssue(title: string, body: string, labels?: string[]): Promise<IssueResult>;
  reopenIssue(issueNumber: number, comment: string): Promise<IssueResult>;
  closeIssue(issueNumber: number, comment: string): Promise<IssueResult>;
}
```

### Issue Manager Interface

```typescript
// src/issues/issue-manager.interface.ts
export interface IIssueManager {
  handleFailedTest(test: TestResult, testFilePath: string): Promise<void>;
  handlePassedTest(test: TestResult, testFilePath: string): Promise<void>;
}
```

### Storage Client Interface

```typescript
// src/storage/storage-client.interface.ts
export interface IStorageClient {
  getMapping(testIdentifier: string): IssueMapping | undefined;
  setMapping(testIdentifier: string, issueNumber: number, status: string, gitInfo: GitInfo, testFilePath: string, testName: string): void;
  updateMapping(testIdentifier: string, updates: Partial<IssueMapping>, gitInfo: GitInfo, testFilePath: string, testName: string): void;
  getAllMappings(): Record<string, IssueMapping>;
}
```

### Mapping Store Interface

```typescript
// src/storage/mapping-store.interface.ts
export interface IMappingStore {
  getMapping(testIdentifier: string): IssueMapping | undefined;
  setMapping(testIdentifier: string, issueNumber: number, status: string, gitInfo: GitInfo, testFilePath: string, testName: string): void;
  updateMapping(testIdentifier: string, updates: Partial<IssueMapping>, gitInfo: GitInfo, testFilePath: string, testName: string): void;
  getAllMappings(): Record<string, IssueMapping>;
}
```

### Template Manager Interface

```typescript
// src/templates/template-manager.interface.ts
export interface ITemplateManager {
  generateIssueBody(test: TestResult, testFilePath: string): string;
  generateCommentBody(test: TestResult, testFilePath: string): string;
  generateReopenBody(test: TestResult, testFilePath: string): string;
  extractErrorInfo(failureMessages: string[]): ErrorInfo;
  getGitInfo(): GitInfo;
}
```

### Plugin Interface

```typescript
// src/plugins/plugin.interface.ts
export interface IssueTrackerPlugin {
  name: string;
  init?: (config: IssueTrackerConfig) => void;
  beforeCreateIssue?: (test: TestResult, filePath: string) => Promise<void>;
  afterCreateIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  beforeCloseIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  afterCloseIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  beforeReopenIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
  afterReopenIssue?: (test: TestResult, filePath: string, issueNumber: number) => Promise<void>;
}
```

## Factory Functions

```typescript
// src/factory.ts
export function createGitHubClient(config?: Partial<IssueTrackerConfig>): IGitHubClient {
  if (config?.githubClient) {
    return config.githubClient;
  }
  return new GitHubClient(config?.defaultLabels);
}

export function createStorageClient(config?: Partial<IssueTrackerConfig>): IStorageClient {
  if (config?.storageClient) {
    return config.storageClient;
  }
  return new JsonStorage(config?.databasePath);
}

export function createTemplateManager(config?: Partial<IssueTrackerConfig>): ITemplateManager {
  if (config?.templateClient) {
    return config.templateClient;
  }
  return new TemplateManager(config?.templateDir);
}

export function createIssueManager(config?: Partial<IssueTrackerConfig>): IIssueManager {
  const storageClient = createStorageClient(config);
  const githubClient = createGitHubClient(config);
  return new IssueManager(storageClient, githubClient);
}

export function createIssueTrackerReporter(globalConfig: any, options: any): Reporter {
  const config: IssueTrackerConfig = {
    ...defaultConfig,
    ...options,
    generateIssues: options.generateIssues || process.env.GENERATE_ISSUES === 'true',
    trackIssues: options.trackIssues || process.env.TRACK_ISSUES === 'true'
  };
  
  const issueManager = createIssueManager(config);
  const pluginManager = new PluginManager();
  
  if (config.plugins) {
    for (const plugin of config.plugins) {
      pluginManager.registerPlugin(plugin);
      if (plugin.init) {
        plugin.init(config);
      }
    }
  }
  
  return new IssueTrackerReporter(globalConfig, options, issueManager, pluginManager);
}
```

## Package Configuration

```json
{
  "name": "jest-issue-tracker",
  "version": "1.0.0",
  "description": "A Jest reporter that tracks test failures as GitHub issues",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "jest",
    "reporter",
    "github",
    "issues",
    "testing"
  ],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "handlebars": "^4.7.7"
  },
  "peerDependencies": {
    "jest": ">=26.0.0"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.11",
    "eslint": "^8.38.0",
    "jest": "^29.5.0",
    "typescript": "^5.0.4"
  },
  "files": [
    "dist",
    "templates"
  ]
}
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "es2018",
    "module": "commonjs",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "**/__tests__/*"
  ]
}
```

## Jest Configuration

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Implementation Plan

### Phase 1: Project Setup (1-2 days)

1. Create a new repository for the package
2. Set up the basic project structure
3. Configure TypeScript, ESLint, and Jest
4. Create initial package.json

### Phase 2: Core Interfaces (2-3 days)

1. Define all interfaces for the components
2. Create type definitions
3. Implement factory functions

### Phase 3: Component Migration (3-5 days)

1. Migrate and refactor the GitHub client
2. Migrate and refactor the issue manager
3. Migrate and refactor the template manager
4. Migrate and refactor the mapping store
5. Migrate and refactor the Jest reporter

### Phase 4: Storage Backends (2-3 days)

1. Implement JSON storage backend
2. Implement SQLite storage backend
3. Implement MongoDB storage backend

### Phase 5: Issue Trackers (2-3 days)

1. Implement GitHub issue tracker
2. Implement GitLab issue tracker
3. Implement Jira issue tracker

### Phase 6: Plugin System (2-3 days)

1. Implement plugin interface
2. Implement plugin manager
3. Create example plugins

### Phase 7: Documentation (2-3 days)

1. Create README.md
2. Create API documentation
3. Create configuration guide
4. Create plugin development guide
5. Create examples

### Phase 8: Testing (2-3 days)

1. Write unit tests for all components
2. Write integration tests
3. Write end-to-end tests
4. Ensure high test coverage

### Phase 9: CI/CD (1-2 days)

1. Set up GitHub Actions for testing
2. Set up GitHub Actions for publishing
3. Configure semantic release

### Phase 10: Publishing (1 day)

1. Finalize package.json
2. Publish to NPM

## Usage Examples

### Basic Usage

```javascript
// jest.config.js
module.exports = {
  // ... other Jest configuration
  reporters: [
    'default',
    ['jest-issue-tracker', {
      generateIssues: true,
      trackIssues: true,
      defaultLabels: ['bug', 'test-failure']
    }]
  ]
};
```

### Custom Storage

```javascript
// jest.config.js
const { SqliteStorage } = require('jest-issue-tracker/dist/storage');

module.exports = {
  // ... other Jest configuration
  reporters: [
    'default',
    ['jest-issue-tracker', {
      generateIssues: true,
      trackIssues: true,
      storageClient: new SqliteStorage('test-failures.db')
    }]
  ]
};
```

### Custom Templates

```javascript
// jest.config.js
module.exports = {
  // ... other Jest configuration
  reporters: [
    'default',
    ['jest-issue-tracker', {
      generateIssues: true,
      trackIssues: true,
      templateDir: './my-templates'
    }]
  ]
};
```

### Custom Plugin

```javascript
// jest.config.js
const { SlackNotificationPlugin } = require('./plugins/slack-notification');

module.exports = {
  // ... other Jest configuration
  reporters: [
    'default',
    ['jest-issue-tracker', {
      generateIssues: true,
      trackIssues: true,
      plugins: [
        new SlackNotificationPlugin({
          webhookUrl: 'https://hooks.slack.com/services/...',
          channel: '#test-failures'
        })
      ]
    }]
  ]
};
```

## Conclusion

This specification outlines the plan to convert the Test Issue Tracker into a pluggable NPM package. The package will provide a robust framework for tracking test failures as issues in various issue tracking systems, with support for multiple storage backends and a plugin system for extending functionality.

The implementation will follow a phased approach, starting with the core interfaces and components, then adding support for multiple storage backends and issue trackers, and finally implementing the plugin system and documentation.

The estimated timeline for the implementation is 2-3 weeks for the core functionality, plus additional time for enhancements and refinements.
