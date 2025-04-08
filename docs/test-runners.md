---
layout: default
title: Test Runners
---

# Test Runners

Jouster supports multiple test runners, allowing you to use your preferred testing framework while still benefiting from Jouster's issue tracking capabilities. This document provides an overview of the supported test runners and common configuration options.

## Supported Test Runners

Jouster supports the following test runners:

- [Jest](./test-runners/jest.html) - A delightful JavaScript Testing Framework with a focus on simplicity
- [Mocha](./test-runners/mocha.html) - A feature-rich JavaScript test framework running on Node.js and in the browser
- [AVA](./test-runners/ava.html) - A test runner for Node.js with a concise API, detailed error output, and process isolation
- [Tape](./test-runners/tape.html) - A TAP-producing test harness for Node.js and browsers
- [Jasmine](./test-runners/jasmine.html) - A behavior-driven development framework for testing JavaScript code
- [Vitest](./test-runners/vitest.html) - A Vite-native testing framework with a focus on speed and simplicity
- [Cypress](./test-runners/cypress.html) - A next-generation front-end testing tool built for the modern web
- [Playwright](./test-runners/playwright.html) - A framework for Web Testing and Automation
- [TestCafe](./test-runners/testcafe.html) - A Node.js tool to automate end-to-end web testing
- [Karma](./test-runners/karma.html) - A test runner that runs tests in real browsers
- [Generic](./test-runners/generic.html) - A generic test runner for any command-line test tool

## Common Configuration

All test runners share some common configuration options:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'auto', // 'jest', 'mocha', 'ava', 'tape', 'jasmine', 'vitest', 'cypress', 'playwright', 'testcafe', 'karma', 'generic', or 'auto'
  testRunnerOptions: {
    // Test runner-specific options
  }
};
```

The `testRunnerType` option specifies which test runner to use. If set to `'auto'`, Jouster will attempt to detect the test runner based on your project's dependencies.

## Running Tests with Different Test Runners

Jouster provides a CLI command for running tests with different test runners:

```bash
npx jouster run-tests --test-runner <runner-name> [options] [files]
```

For example:

```bash
# Run tests with Jest
npx jouster run-tests --test-runner jest src/__tests__

# Run tests with Mocha
npx jouster run-tests --test-runner mocha --mocha-ui tdd test/**/*.js
```

## Auto-Detection

Jouster can automatically detect the test runner based on your project's dependencies. To use auto-detection, set `testRunnerType` to `'auto'`:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'auto'
};
```

Jouster will check for the following dependencies in order:

1. Jest
2. Mocha
3. AVA
4. Tape
5. Jasmine
6. Vitest
7. Cypress
8. Playwright
9. TestCafe
10. Karma

If none of these dependencies are found, Jouster will fall back to the Jest test runner.

## Best Practices

### 1. Use the Right Test Runner for the Job

- Use **Jest** for unit and integration tests in JavaScript/TypeScript projects
- Use **Mocha** for flexible, customizable testing
- Use **AVA** for concurrent test execution
- Use **Tape** for simple, TAP-producing tests
- Use **Jasmine** for behavior-driven development
- Use **Vitest** for Vite-based projects
- Use **Cypress** for end-to-end testing of web applications
- Use **Playwright** for cross-browser end-to-end testing
- Use **TestCafe** for end-to-end testing without browser plugins
- Use **Karma** for testing in real browsers

### 2. Configure for Your Environment

- Use headless browsers in CI environments
- Use headed browsers for local development
- Adjust concurrency based on available resources
- Use appropriate timeouts for your tests

### 3. Use Consistent Reporting

- Use the same reporter across all test runners
- Configure reporters to provide the information you need
- Use JSON reporters for machine-readable output

### 4. Optimize for Performance

- Run tests in parallel when possible
- Use appropriate concurrency settings
- Skip unnecessary setup and teardown
- Use fast browsers for end-to-end tests

## Troubleshooting

For troubleshooting specific to each test runner, see the individual test runner documentation. For general troubleshooting, see the [Troubleshooting Guide](./troubleshooting.md).

## Jest

[Jest](https://jestjs.io/) is a delightful JavaScript Testing Framework with a focus on simplicity.

### Installation

```bash
npm install --save-dev jest
```

### Configuration

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

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner jest src/__tests__
```

#### With Coverage

```bash
npx jouster run-tests --test-runner jest --jest-coverage src/__tests__
```

#### With Specific Configuration

```bash
npx jouster run-tests --test-runner jest --jest-config-path ./custom-jest.config.js src/__tests__
```

#### With Test Name Pattern

```bash
npx jouster run-tests --test-runner jest --jest-test-name-pattern "should handle errors" src/__tests__
```

## Mocha

[Mocha](https://mochajs.org/) is a feature-rich JavaScript test framework running on Node.js and in the browser.

### Installation

```bash
npm install --save-dev mocha
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'mocha',
  testRunnerOptions: {
    mocha: {
      ui: 'bdd', // Test interface (bdd, tdd, qunit, exports)
      timeout: 2000, // Test timeout in milliseconds
      reporters: ['spec'], // Mocha reporters to use
      require: ['ts-node/register'], // Modules to require before running tests
      bail: false, // Whether to bail after the first test failure
      colors: true, // Whether to use colors in output
      recursive: true, // Whether to look for tests in subdirectories
      grep: '', // Pattern to match test descriptions
      fgrep: '', // String to match test descriptions
      invert: false, // Whether to invert grep/fgrep matches
      slow: 75, // Threshold for slow tests in milliseconds
      retries: 0, // Number of times to retry failed tests
      forbidOnly: false, // Whether to fail if tests are marked as only
      forbidPending: false, // Whether to fail if tests are pending
      fullTrace: false, // Whether to show full stack traces
      exit: true // Whether to force Mocha to quit after tests complete
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner mocha test/**/*.js
```

#### With TDD Interface

```bash
npx jouster run-tests --test-runner mocha --mocha-ui tdd test/**/*.js
```

#### With TypeScript Support

```bash
npx jouster run-tests --test-runner mocha --mocha-require ts-node/register test/**/*.ts
```

#### With Specific Reporter

```bash
npx jouster run-tests --test-runner mocha --mocha-reporters dot test/**/*.js
```

## AVA

[AVA](https://github.com/avajs/ava) is a test runner for Node.js with a concise API, detailed error output, and process isolation.

### Installation

```bash
npm install --save-dev ava
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'ava',
  testRunnerOptions: {
    ava: {
      timeout: 10000, // Test timeout in milliseconds
      verbose: false, // Whether to use verbose output
      failFast: false, // Whether to stop after the first test failure
      concurrency: 5, // Number of test files to run at the same time
      serial: false, // Whether to run tests serially
      tap: false, // Whether to use TAP reporter
      match: [], // Patterns to match test titles
      updateSnapshots: false, // Whether to update snapshots
      color: true, // Whether to use colors in output
      cache: true, // Whether to cache compiled files
      require: [], // Modules to require before running tests
      environmentVariables: {} // Environment variables to set
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner ava test.js
```

#### With Fail Fast

```bash
npx jouster run-tests --test-runner ava --ava-fail-fast test.js
```

#### With Specific Concurrency

```bash
npx jouster run-tests --test-runner ava --ava-concurrency 10 test.js
```

#### With Match Pattern

```bash
npx jouster run-tests --test-runner ava --ava-match "*should*" test.js
```

## Tape

[Tape](https://github.com/substack/tape) is a TAP-producing test harness for Node.js and browsers.

### Installation

```bash
npm install --save-dev tape
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'tape',
  testRunnerOptions: {
    tape: {
      timeout: 5000, // Test timeout in milliseconds
      bail: false, // Whether to bail after the first test failure
      reporter: 'tap', // Reporter to use
      colors: true, // Whether to use colors in output
      grep: '', // Pattern to match test names
      ignore: [], // Patterns to ignore
      require: [], // Modules to require before running tests
      harness: {} // Options for the test harness
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner tape test/*.js
```

#### With Bail

```bash
npx jouster run-tests --test-runner tape --tape-bail test/*.js
```

#### With Specific Reporter

```bash
npx jouster run-tests --test-runner tape --tape-reporter spec test/*.js
```

#### With Required Module

```bash
npx jouster run-tests --test-runner tape --tape-require ts-node/register test/*.ts
```

## Jasmine

[Jasmine](https://jasmine.github.io/) is a behavior-driven development framework for testing JavaScript code.

### Installation

```bash
npm install --save-dev jasmine
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'jasmine',
  testRunnerOptions: {
    jasmine: {
      random: true, // Whether to randomize test order
      failFast: false, // Whether to stop after the first test failure
      timeout: 5000, // Default timeout for tests in milliseconds
      configPath: './spec/support/jasmine.json', // Path to Jasmine configuration file
      seed: null, // Seed for random test order
      color: true, // Whether to use colors in output
      reporter: null, // Reporter to use
      filter: null, // Pattern to filter specs
      stopSpecOnExpectationFailure: false, // Whether to stop a spec on the first expectation failure
      hideDisabled: false // Whether to hide disabled specs
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner jasmine
```

#### With Random Disabled

```bash
npx jouster run-tests --test-runner jasmine --jasmine-random false
```

#### With Specific Configuration

```bash
npx jouster run-tests --test-runner jasmine --jasmine-config-path ./custom-jasmine.json
```

#### With Specific Seed

```bash
npx jouster run-tests --test-runner jasmine --jasmine-seed 12345
```

## Vitest

[Vitest](https://vitest.dev/) is a Vite-native testing framework with a focus on speed and simplicity.

### Installation

```bash
npm install --save-dev vitest
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'vitest',
  testRunnerOptions: {
    vitest: {
      mode: 'run', // Mode to run tests in (run, watch)
      reporters: ['default'], // Reporters to use
      coverage: false, // Whether to collect coverage information
      threads: true, // Whether to use worker threads
      silent: false, // Whether to suppress console output
      update: false, // Whether to update snapshots
      ui: false, // Whether to use the UI
      api: false, // Whether to start the API server
      isolate: true, // Whether to isolate tests
      globals: false, // Whether to use globals
      environment: 'node', // Environment to run tests in
      passWithNoTests: false, // Whether to pass when no tests are found
      bail: false, // Whether to bail after the first test failure
      allowOnly: true, // Whether to allow tests marked as only
      watch: false, // Whether to watch files for changes
      testNamePattern: '', // Pattern to match test names
      singleThread: false // Whether to use a single thread
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner vitest
```

#### With Coverage

```bash
npx jouster run-tests --test-runner vitest --vitest-coverage
```

#### With UI

```bash
npx jouster run-tests --test-runner vitest --vitest-ui
```

#### With Specific Environment

```bash
npx jouster run-tests --test-runner vitest --vitest-environment jsdom
```

## Cypress

[Cypress](https://www.cypress.io/) is a next-generation front-end testing tool built for the modern web.

### Installation

```bash
npm install --save-dev cypress
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'cypress',
  testRunnerOptions: {
    cypress: {
      browser: 'chrome', // Browser to use
      headless: true, // Whether to run in headless mode
      reporter: 'json', // Reporter to use
      component: false, // Whether to run component tests
      configPath: null, // Path to Cypress configuration file
      env: {}, // Environment variables
      quiet: false, // Whether to suppress output
      record: false, // Whether to record results to Cypress Dashboard
      key: null, // Cypress Dashboard key
      parallel: false, // Whether to run tests in parallel
      group: null, // Group name for parallel runs
      tag: null, // Tags for recorded runs
      spec: null, // Spec pattern to run
      project: null, // Project path
      port: null, // Port to use for Cypress server
      baseUrl: null, // Base URL for Cypress
      config: {} // Additional Cypress configuration
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner cypress
```

#### With Specific Browser

```bash
npx jouster run-tests --test-runner cypress --cypress-browser firefox
```

#### With Headed Mode

```bash
npx jouster run-tests --test-runner cypress --cypress-headless false
```

#### With Component Tests

```bash
npx jouster run-tests --test-runner cypress --cypress-component
```

## Playwright

[Playwright](https://playwright.dev/) is a framework for Web Testing and Automation.

### Installation

```bash
npm install --save-dev @playwright/test
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'playwright',
  testRunnerOptions: {
    playwright: {
      browser: 'chromium', // Browser to use (chromium, firefox, webkit)
      headed: false, // Whether to run in headed mode
      workers: 1, // Number of workers
      reporters: ['json'], // Reporters to use
      timeout: 30000, // Timeout for tests in milliseconds
      testDir: './tests', // Directory containing tests
      project: null, // Project to run
      grep: null, // Pattern to match test titles
      grepInvert: null, // Pattern to exclude test titles
      updateSnapshots: false, // Whether to update snapshots
      debug: false, // Whether to run in debug mode
      quiet: false, // Whether to suppress output
      shard: null, // Shard to run in format "current/total"
      configPath: null, // Path to Playwright configuration file
      retries: 0, // Number of retries for failed tests
      reporter: null, // Reporter to use
      reporterOptions: {} // Options for the reporter
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner playwright
```

#### With Specific Browser

```bash
npx jouster run-tests --test-runner playwright --playwright-browser firefox
```

#### With Headed Mode

```bash
npx jouster run-tests --test-runner playwright --playwright-headed
```

#### With Multiple Workers

```bash
npx jouster run-tests --test-runner playwright --playwright-workers 4
```

## TestCafe

[TestCafe](https://testcafe.io/) is a Node.js tool to automate end-to-end web testing.

### Installation

```bash
npm install --save-dev testcafe
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'testcafe',
  testRunnerOptions: {
    testcafe: {
      browser: ['chrome:headless'], // Browsers to use
      reporter: ['json'], // Reporters to use
      concurrency: 1, // Number of concurrent browser instances
      screenshots: { // Screenshot options
        path: './screenshots',
        takeOnFails: true,
        fullPage: true
      },
      skipJsErrors: false, // Whether to skip JavaScript errors
      quarantineMode: false, // Whether to use quarantine mode
      selectorTimeout: 10000, // Timeout for selectors in milliseconds
      assertionTimeout: 5000, // Timeout for assertions in milliseconds
      pageLoadTimeout: 30000, // Timeout for page loading in milliseconds
      speed: 1, // Test execution speed (0.01-1)
      stopOnFirstFail: false, // Whether to stop on the first test failure
      disablePageCaching: false, // Whether to disable page caching
      disableScreenshots: false, // Whether to disable screenshots
      color: true, // Whether to use colors in output
      debug: false // Whether to run in debug mode
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner testcafe
```

#### With Specific Browsers

```bash
npx jouster run-tests --test-runner testcafe --testcafe-browser "chrome:headless,firefox:headless"
```

#### With Concurrency

```bash
npx jouster run-tests --test-runner testcafe --testcafe-concurrency 4
```

#### With Quarantine Mode

```bash
npx jouster run-tests --test-runner testcafe --testcafe-quarantine-mode
```

## Karma

[Karma](https://karma-runner.github.io/) is a test runner that runs tests in real browsers.

### Installation

```bash
npm install --save-dev karma
```

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'karma',
  testRunnerOptions: {
    karma: {
      browsers: ['ChromeHeadless'], // Browsers to use
      singleRun: true, // Whether to run once and exit
      reporters: ['json'], // Reporters to use
      frameworks: ['jasmine'], // Test frameworks to use
      port: 9876, // Port to use
      autoWatch: false, // Whether to watch files for changes
      colors: true, // Whether to use colors in output
      logLevel: 'INFO', // Log level
      client: { // Client options
        clearContext: true,
        captureConsole: true,
        jasmine: {
          random: true,
          seed: null,
          timeoutInterval: 5000
        }
      },
      configPath: null, // Path to Karma configuration file
      files: [], // Files to include
      exclude: [], // Files to exclude
      preprocessors: {}, // Preprocessors to use
      plugins: [] // Plugins to use
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner karma
```

#### With Specific Browsers

```bash
npx jouster run-tests --test-runner karma --karma-browsers "Chrome,Firefox"
```

#### With Watch Mode

```bash
npx jouster run-tests --test-runner karma --karma-single-run false --karma-auto-watch
```

#### With Specific Frameworks

```bash
npx jouster run-tests --test-runner karma --karma-frameworks "mocha,chai"
```

## Generic

The Generic test runner allows you to run any command-line test tool that isn't directly supported.

### Configuration

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'tap', // Command to run
      args: ['--reporter=spec'], // Arguments to pass to the command
      cwd: null, // Working directory
      env: {}, // Environment variables
      shell: true, // Whether to run in a shell
      timeout: 30000, // Timeout in milliseconds
      outputParser: 'tap', // Parser for the output (tap, json, or custom function)
      successExitCodes: [0], // Exit codes that indicate success
      parseTestResults: null // Custom function to parse test results
    }
  }
};
```

### Usage Examples

#### Basic Usage

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" test/*.js
```

#### With Custom Arguments

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-args "--reporter=spec,--bail" test/*.js
```

#### With Custom Environment Variables

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-env "NODE_ENV=test,DEBUG=true" test/*.js
```

#### With Custom Output Parser

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-output-parser "json" test/*.js
```

## Auto-Detection

Jouster can automatically detect the test runner based on your project's dependencies. To use auto-detection, set `testRunnerType` to `'auto'`:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'auto'
};
```

Jouster will check for the following dependencies in order:

1. Jest
2. Mocha
3. AVA
4. Tape
5. Jasmine
6. Vitest
7. Cypress
8. Playwright
9. TestCafe
10. Karma

If none of these dependencies are found, Jouster will fall back to the Jest test runner.

## Best Practices

### 1. Use the Right Test Runner for the Job

- Use **Jest** for unit and integration tests in JavaScript/TypeScript projects
- Use **Mocha** for flexible, customizable testing
- Use **AVA** for concurrent test execution
- Use **Tape** for simple, TAP-producing tests
- Use **Jasmine** for behavior-driven development
- Use **Vitest** for Vite-based projects
- Use **Cypress** for end-to-end testing of web applications
- Use **Playwright** for cross-browser end-to-end testing
- Use **TestCafe** for end-to-end testing without browser plugins
- Use **Karma** for testing in real browsers

### 2. Configure for Your Environment

- Use headless browsers in CI environments
- Use headed browsers for local development
- Adjust concurrency based on available resources
- Use appropriate timeouts for your tests

### 3. Use Consistent Reporting

- Use the same reporter across all test runners
- Configure reporters to provide the information you need
- Use JSON reporters for machine-readable output

### 4. Optimize for Performance

- Run tests in parallel when possible
- Use appropriate concurrency settings
- Skip unnecessary setup and teardown
- Use fast browsers for end-to-end tests

## Troubleshooting

### Common Issues

#### Tests Not Running

- Check that the test runner is installed
- Check that the test files exist
- Check that the test files match the pattern
- Check that the test runner is configured correctly

#### Tests Running but Not Reporting

- Check that the reporter is installed
- Check that the reporter is configured correctly
- Check that the output is being captured

#### Tests Running but Not Failing

- Check that assertions are being made
- Check that the test runner is configured to fail on assertion failures
- Check that the test runner is configured to exit with a non-zero code on failure

#### Tests Running but Not Creating Issues

- Check that issue tracking is enabled
- Check that the GitHub client is configured correctly
- Check that the test runner is parsing test results correctly

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Mocha Documentation](https://mochajs.org/#getting-started)
- [AVA Documentation](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md)
- [Tape Documentation](https://github.com/substack/tape)
- [Jasmine Documentation](https://jasmine.github.io/pages/docs_home.html)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Cypress Documentation](https://docs.cypress.io/guides/overview/why-cypress)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [TestCafe Documentation](https://testcafe.io/documentation/402635/getting-started)
- [Karma Documentation](https://karma-runner.github.io/latest/index.html)
