# Jest Test Runner

[Jest](https://jestjs.io/) is a delightful JavaScript Testing Framework with a focus on simplicity. Jouster provides seamless integration with Jest, allowing you to track test failures and manage issues automatically.

## Installation

To use Jest with Jouster, you need to install Jest:

```bash
npm install --save-dev jest
```

## Configuration

You can configure the Jest test runner in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'jest',
  testRunnerOptions: {
    jest: {
      configPath: './jest.config.js', // Path to Jest configuration file
      reporters: ['default'], // Jest reporters to use
      coverage: false, // Whether to collect coverage information
      verbose: false, // Whether to use verbose output
      bail: false, // Whether to bail after the first test failure
      runInBand: false, // Whether to run tests in a single process
      updateSnapshot: false, // Whether to update snapshots
      testNamePattern: '', // Pattern to match test names
      testPathPattern: '', // Pattern to match test paths
      testTimeout: 5000, // Timeout for tests in milliseconds
      maxWorkers: '50%', // Maximum number of workers
      watchAll: false, // Whether to watch all files
      watch: false, // Whether to watch files for changes
      silent: false, // Whether to suppress console output
      noStackTrace: false, // Whether to hide stack traces
      ci: false // Whether running in CI environment
    }
  }
};
```

## Command Line Options

When using the `jouster run-tests` command, you can specify Jest-specific options:

```bash
npx jouster run-tests --test-runner jest [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--jest-config-path <path>` | Path to Jest configuration file |
| `--jest-reporters <reporters>` | Comma-separated list of reporters to use |
| `--jest-coverage` | Collect coverage information |
| `--jest-verbose` | Use verbose output |
| `--jest-bail` | Bail after the first test failure |
| `--jest-run-in-band` | Run tests in a single process |
| `--jest-update-snapshot` | Update snapshots |
| `--jest-test-name-pattern <pattern>` | Pattern to match test names |
| `--jest-test-path-pattern <pattern>` | Pattern to match test paths |
| `--jest-test-timeout <timeout>` | Timeout for tests in milliseconds |
| `--jest-max-workers <workers>` | Maximum number of workers |
| `--jest-watch-all` | Watch all files |
| `--jest-watch` | Watch files for changes |
| `--jest-silent` | Suppress console output |
| `--jest-no-stack-trace` | Hide stack traces |
| `--jest-ci` | Run in CI environment |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner jest src/__tests__
```

### With Coverage

```bash
npx jouster run-tests --test-runner jest --jest-coverage src/__tests__
```

### With Specific Configuration

```bash
npx jouster run-tests --test-runner jest --jest-config-path ./custom-jest.config.js src/__tests__
```

### With Test Name Pattern

```bash
npx jouster run-tests --test-runner jest --jest-test-name-pattern "should handle errors" src/__tests__
```

### With Test Path Pattern

```bash
npx jouster run-tests --test-runner jest --jest-test-path-pattern "api" src/__tests__
```

### With Bail

```bash
npx jouster run-tests --test-runner jest --jest-bail src/__tests__
```

### With Run In Band

```bash
npx jouster run-tests --test-runner jest --jest-run-in-band src/__tests__
```

## Integration with Jouster

Jouster integrates with Jest by:

1. Running Jest tests with the specified configuration
2. Parsing Jest test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Jest Configuration File

Instead of specifying all options on the command line, use a Jest configuration file:

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
  collectCoverageFrom: ['src/**/*.{js,jsx}', '!**/node_modules/**'],
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

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'jest',
  testRunnerOptions: {
    jest: {
      configPath: './jest.config.js'
    }
  }
};
```

### 2. Use Jest Reporters

Jest reporters can provide additional information about test results. For example, you can use the `jest-junit` reporter to generate JUnit XML reports:

```bash
npm install --save-dev jest-junit
```

```javascript
// jest.config.js
module.exports = {
  // ... other configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './reports',
      outputName: 'jest-junit.xml'
    }]
  ]
};
```

### 3. Use Jest Matchers

Jest provides a rich set of matchers for making assertions. Use them to make your tests more expressive:

```javascript
test('should add two numbers', () => {
  expect(1 + 2).toBe(3);
  expect(1 + 2).toBeGreaterThan(2);
  expect(1 + 2).toBeLessThan(4);
});
```

### 4. Use Jest Mocks

Jest provides powerful mocking capabilities. Use them to isolate the code you're testing:

```javascript
jest.mock('./database');

test('should fetch user', async () => {
  const user = { id: 1, name: 'John' };
  require('./database').getUser.mockResolvedValue(user);
  
  const result = await getUser(1);
  
  expect(result).toEqual(user);
});
```

## Troubleshooting

### Tests Not Running

- Check that Jest is installed: `npm list jest`
- Check that the test files exist: `ls src/__tests__`
- Check that the test files match the pattern: `jest --listTests`
- Check that the Jest configuration is correct: `jest --showConfig`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list jest-junit`
- Check that the reporter is configured correctly: `jest --showConfig`
- Check that the output is being captured: `jest --json > results.json`

### Tests Running but Not Failing

- Check that assertions are being made: `jest --verbose`
- Check that the test runner is configured to fail on assertion failures: `jest --bail`
- Check that the test runner is configured to exit with a non-zero code on failure: `jest --forceExit`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest API Reference](https://jestjs.io/docs/api)
- [Jest CLI Options](https://jestjs.io/docs/cli)
- [Jest Configuration](https://jestjs.io/docs/configuration)
- [Jest Matchers](https://jestjs.io/docs/expect)
- [Jest Mocks](https://jestjs.io/docs/mock-functions)
