# Vitest Test Runner

[Vitest](https://vitest.dev/) is a Vite-native testing framework with a focus on speed and simplicity. Jouster provides seamless integration with Vitest, allowing you to track test failures and manage issues automatically.

## Installation

To use Vitest with Jouster, you need to install Vitest:

```bash
npm install --save-dev vitest
```

## Configuration

You can configure the Vitest test runner in your Jouster configuration:

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

## Command Line Options

When using the `jouster run-tests` command, you can specify Vitest-specific options:

```bash
npx jouster run-tests --test-runner vitest [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--vitest-mode <mode>` | Mode to run tests in (run, watch) |
| `--vitest-reporters <reporters>` | Comma-separated list of reporters to use |
| `--vitest-coverage` | Collect coverage information |
| `--vitest-threads <boolean>` | Whether to use worker threads |
| `--vitest-silent` | Suppress console output |
| `--vitest-update` | Update snapshots |
| `--vitest-ui` | Use the UI |
| `--vitest-api` | Start the API server |
| `--vitest-isolate <boolean>` | Whether to isolate tests |
| `--vitest-globals` | Use globals |
| `--vitest-environment <env>` | Environment to run tests in |
| `--vitest-pass-with-no-tests` | Pass when no tests are found |
| `--vitest-bail` | Bail after the first test failure |
| `--vitest-allow-only <boolean>` | Whether to allow tests marked as only |
| `--vitest-watch` | Watch files for changes |
| `--vitest-test-name-pattern <pattern>` | Pattern to match test names |
| `--vitest-single-thread` | Use a single thread |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner vitest
```

### With Coverage

```bash
npx jouster run-tests --test-runner vitest --vitest-coverage
```

### With UI

```bash
npx jouster run-tests --test-runner vitest --vitest-ui
```

### With Specific Environment

```bash
npx jouster run-tests --test-runner vitest --vitest-environment jsdom
```

### With Watch Mode

```bash
npx jouster run-tests --test-runner vitest --vitest-mode watch
```

### With Test Name Pattern

```bash
npx jouster run-tests --test-runner vitest --vitest-test-name-pattern "should handle errors"
```

## Integration with Jouster

Jouster integrates with Vitest by:

1. Running Vitest tests with the specified configuration
2. Parsing Vitest test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Vitest Configuration File

Instead of specifying all options on the command line, use a Vitest configuration file:

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    globals: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/test/**']
    },
    reporters: ['default', 'json'],
    watch: false,
    testTimeout: 5000,
    hookTimeout: 10000,
    maxThreads: 4,
    minThreads: 1
  }
});
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'vitest',
  testRunnerOptions: {
    vitest: {
      // Vitest will automatically use vitest.config.js
    }
  }
};
```

### 2. Use Test and Describe

Vitest uses `test` and `describe` for organizing tests:

```javascript
import { test, describe, expect } from 'vitest';

describe('Calculator', () => {
  test('should add two numbers', () => {
    expect(1 + 1).toBe(2);
  });

  test('should subtract two numbers', () => {
    expect(2 - 1).toBe(1);
  });
});
```

### 3. Use Matchers

Vitest provides a rich set of matchers for making assertions:

```javascript
import { test, expect } from 'vitest';

test('matchers', () => {
  expect(true).toBe(true);
  expect(false).not.toBe(true);
  expect(1).toEqual(1);
  expect([1, 2, 3]).toContain(2);
  expect('hello world').toMatch(/hello/);
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
  expect(1).toBeDefined();
  expect(1).toBeTruthy();
  expect(0).toBeFalsy();
  expect(1).toBeGreaterThan(0);
  expect(1).toBeLessThan(2);
  expect(() => { throw new Error('foo'); }).toThrow();
  expect(() => { throw new Error('foo'); }).toThrowError('foo');
  expect(1).toBeTypeOf('number');
  expect({ a: 1 }).toMatchObject({ a: 1 });
  expect([1, 2, 3]).toHaveLength(3);
});
```

### 4. Use Mocks

Vitest provides mocking capabilities:

```javascript
import { test, expect, vi } from 'vitest';

test('mocks', () => {
  const fn = vi.fn();
  fn(1, 2, 3);

  expect(fn).toHaveBeenCalled();
  expect(fn).toHaveBeenCalledWith(1, 2, 3);
  expect(fn).toHaveBeenCalledTimes(1);

  const spy = vi.spyOn(console, 'log');
  console.log('hello');

  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith('hello');

  vi.mock('./calculator', () => {
    return {
      add: vi.fn().mockReturnValue(42)
    };
  });

  const { add } = require('./calculator');
  expect(add(1, 2)).toBe(42);
});
```

### 5. Use Hooks

Vitest provides hooks for setup and teardown:

```javascript
import { test, describe, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

describe('Hooks', () => {
  let value;

  beforeAll(() => {
    // This runs once before all tests
    console.log('beforeAll');
  });

  afterAll(() => {
    // This runs once after all tests
    console.log('afterAll');
  });

  beforeEach(() => {
    // This runs before each test
    value = 1;
    console.log('beforeEach');
  });

  afterEach(() => {
    // This runs after each test
    value = 0;
    console.log('afterEach');
  });

  test('should have value 1', () => {
    expect(value).toBe(1);
  });

  test('should still have value 1', () => {
    expect(value).toBe(1);
  });
});
```

### 6. Use Async/Await

Vitest supports async/await for asynchronous tests:

```javascript
import { test, expect } from 'vitest';

test('async/await', async () => {
  const value = await Promise.resolve(1);
  expect(value).toBe(1);
});
```

### 7. Use Snapshots

Vitest supports snapshot testing:

```javascript
import { test, expect } from 'vitest';

test('snapshots', () => {
  const user = {
    name: 'John',
    age: 30,
    email: 'john@example.com'
  };

  expect(user).toMatchSnapshot();
});
```

### 8. Use Test Utilities

Vitest provides test utilities:

```javascript
import { test, expect, vi } from 'vitest';

test('timers', async () => {
  vi.useFakeTimers();

  const fn = vi.fn();
  setTimeout(fn, 1000);

  vi.advanceTimersByTime(500);
  expect(fn).not.toHaveBeenCalled();

  vi.advanceTimersByTime(500);
  expect(fn).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Troubleshooting

### Tests Not Running

- Check that Vitest is installed: `npm list vitest`
- Check that the test files exist: `ls test`
- Check that the test files match the pattern: `vitest --testNamePattern="should handle errors"`
- Check that the Vitest configuration is correct: `vitest --config=vitest.config.js`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list @vitest/reporter-json`
- Check that the reporter is configured correctly: `vitest --reporters=json`
- Check that the output is being captured: `vitest --reporters=json > results.json`

### Tests Running but Not Failing

- Check that assertions are being made: `vitest --silent=false`
- Check that the test runner is configured to fail on assertion failures: `vitest --bail`
- Check that the test runner is configured to exit with a non-zero code on failure: `vitest run`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Vitest Documentation](https://vitest.dev/guide/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Vitest CLI Options](https://vitest.dev/guide/cli.html)
- [Vitest Configuration](https://vitest.dev/config/)
- [Vitest Matchers](https://vitest.dev/api/expect.html)
- [Vitest Mocking](https://vitest.dev/api/vi.html)
