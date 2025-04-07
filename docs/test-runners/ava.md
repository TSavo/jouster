# AVA Test Runner

[AVA](https://github.com/avajs/ava) is a test runner for Node.js with a concise API, detailed error output, and process isolation. Jouster provides seamless integration with AVA, allowing you to track test failures and manage issues automatically.

## Installation

To use AVA with Jouster, you need to install AVA:

```bash
npm install --save-dev ava
```

## Configuration

You can configure the AVA test runner in your Jouster configuration:

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

## Command Line Options

When using the `jouster run-tests` command, you can specify AVA-specific options:

```bash
npx jouster run-tests --test-runner ava [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--ava-timeout <ms>` | Test timeout in milliseconds |
| `--ava-verbose` | Use verbose output |
| `--ava-fail-fast` | Stop after the first test failure |
| `--ava-concurrency <n>` | Number of test files to run at the same time |
| `--ava-serial` | Run tests serially |
| `--ava-tap` | Use TAP reporter |
| `--ava-match <patterns>` | Comma-separated list of patterns to match test titles |
| `--ava-update-snapshots` | Update snapshots |
| `--ava-color` | Use colors in output |
| `--ava-cache` | Cache compiled files |
| `--ava-require <modules>` | Comma-separated list of modules to require |
| `--ava-env <vars>` | Comma-separated list of environment variables |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner ava test.js
```

### With Fail Fast

```bash
npx jouster run-tests --test-runner ava --ava-fail-fast test.js
```

### With Specific Concurrency

```bash
npx jouster run-tests --test-runner ava --ava-concurrency 10 test.js
```

### With Match Pattern

```bash
npx jouster run-tests --test-runner ava --ava-match "*should*" test.js
```

### With Required Modules

```bash
npx jouster run-tests --test-runner ava --ava-require "ts-node/register,esm" test.js
```

### With Environment Variables

```bash
npx jouster run-tests --test-runner ava --ava-env "NODE_ENV=test,DEBUG=true" test.js
```

## Integration with Jouster

Jouster integrates with AVA by:

1. Running AVA tests with the specified configuration
2. Parsing AVA test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use AVA Configuration File

Instead of specifying all options on the command line, use an AVA configuration file:

```javascript
// ava.config.js
export default {
  files: [
    'test/**/*.js',
    '!test/fixtures/**/*.js'
  ],
  timeout: '10s',
  concurrency: 5,
  failFast: true,
  verbose: true,
  require: [
    'ts-node/register'
  ],
  environmentVariables: {
    NODE_ENV: 'test'
  }
};
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'ava',
  testRunnerOptions: {
    ava: {
      // AVA will automatically use ava.config.js
    }
  }
};
```

### 2. Use Test Macros

AVA supports test macros for reusing test logic:

```javascript
import test from 'ava';

function macro(t, input, expected) {
  t.is(input.trim(), expected);
}

test('trims whitespace', macro, '  hello  ', 'hello');
test('trims whitespace from the beginning', macro, '  hello', 'hello');
test('trims whitespace from the end', macro, 'hello  ', 'hello');
```

### 3. Use Test Context

AVA provides a test context for sharing state between tests:

```javascript
import test from 'ava';

test.beforeEach(t => {
  t.context.data = { foo: 'bar' };
});

test('context is available', t => {
  t.is(t.context.data.foo, 'bar');
});
```

### 4. Use Assertions

AVA provides a rich set of assertions:

```javascript
import test from 'ava';

test('assertions', t => {
  t.pass('this assertion passes');
  t.fail('this assertion fails');
  t.truthy('this value is truthy');
  t.falsy(false);
  t.true(true);
  t.false(false);
  t.is(1, 1);
  t.not(1, 2);
  t.deepEqual({ a: 1 }, { a: 1 });
  t.notDeepEqual({ a: 1 }, { a: 2 });
  t.throws(() => { throw new Error('foo'); });
  t.notThrows(() => {});
  t.regex('abc', /^a/);
  t.notRegex('abc', /^b/);
  t.snapshot({ a: 1 });
  t.like({ a: 1, b: 2 }, { a: 1 });
});
```

### 5. Use Hooks

AVA provides hooks for setup and teardown:

```javascript
import test from 'ava';

test.before(t => {
  // This runs before all tests
  console.log('before');
});

test.after(t => {
  // This runs after all tests
  console.log('after');
});

test.beforeEach(t => {
  // This runs before each test
  console.log('beforeEach');
});

test.afterEach(t => {
  // This runs after each test
  console.log('afterEach');
});

test('test', t => {
  t.pass();
});
```

### 6. Use Async/Await

AVA supports async/await for asynchronous tests:

```javascript
import test from 'ava';

test('async/await', async t => {
  const value = await Promise.resolve(1);
  t.is(value, 1);
});
```

## Troubleshooting

### Tests Not Running

- Check that AVA is installed: `npm list ava`
- Check that the test files exist: `ls test`
- Check that the test files match the pattern: `ava --match "*should*" test.js`
- Check that the AVA configuration is correct: `ava --config`

### Tests Running but Not Reporting

- Check that the reporter is configured correctly: `ava --tap`
- Check that the output is being captured: `ava --tap > results.tap`

### Tests Running but Not Failing

- Check that assertions are being made: `ava --verbose`
- Check that the test runner is configured to fail on assertion failures: `ava --fail-fast`
- Check that the test runner is configured to exit with a non-zero code on failure: `ava`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [AVA Documentation](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md)
- [AVA API Reference](https://github.com/avajs/ava/blob/main/docs/03-assertions.md)
- [AVA CLI Options](https://github.com/avajs/ava/blob/main/docs/05-command-line.md)
- [AVA Configuration](https://github.com/avajs/ava/blob/main/docs/06-configuration.md)
- [AVA Recipes](https://github.com/avajs/ava/blob/main/docs/recipes/browser-testing.md)
- [AVA TypeScript](https://github.com/avajs/ava/blob/main/docs/recipes/typescript.md)
