# Tape Test Runner

[Tape](https://github.com/substack/tape) is a TAP-producing test harness for Node.js and browsers. Jouster provides seamless integration with Tape, allowing you to track test failures and manage issues automatically.

## Installation

To use Tape with Jouster, you need to install Tape:

```bash
npm install --save-dev tape
```

## Configuration

You can configure the Tape test runner in your Jouster configuration:

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

## Command Line Options

When using the `jouster run-tests` command, you can specify Tape-specific options:

```bash
npx jouster run-tests --test-runner tape [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--tape-timeout <ms>` | Test timeout in milliseconds |
| `--tape-bail` | Bail after the first test failure |
| `--tape-reporter <reporter>` | Reporter to use |
| `--tape-colors` | Use colors in output |
| `--tape-grep <pattern>` | Pattern to match test names |
| `--tape-ignore <patterns>` | Comma-separated list of patterns to ignore |
| `--tape-require <modules>` | Comma-separated list of modules to require |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner tape test/*.js
```

### With Bail

```bash
npx jouster run-tests --test-runner tape --tape-bail test/*.js
```

### With Specific Reporter

```bash
npx jouster run-tests --test-runner tape --tape-reporter spec test/*.js
```

### With Required Module

```bash
npx jouster run-tests --test-runner tape --tape-require ts-node/register test/*.ts
```

### With Grep

```bash
npx jouster run-tests --test-runner tape --tape-grep "should handle errors" test/*.js
```

### With Ignore

```bash
npx jouster run-tests --test-runner tape --tape-ignore "fixtures/*,helpers/*" test/*.js
```

## Integration with Jouster

Jouster integrates with Tape by:

1. Running Tape tests with the specified configuration
2. Parsing Tape test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use TAP Reporters

Tape produces TAP output by default, but you can use different reporters for more readable output:

```bash
npm install --save-dev tap-spec tap-dot tap-json
```

```bash
npx jouster run-tests --test-runner tape --tape-reporter spec test/*.js
```

Available reporters include:

- `tap`: Default TAP output
- `spec`: Hierarchical spec reporter
- `dot`: Minimal dot reporter
- `json`: JSON output
- `nyan`: Nyan cat reporter
- `tap-min`: Minimal TAP output
- `tap-summary`: Summary TAP output

### 2. Use Test Harness

Tape provides a test harness for organizing tests:

```javascript
const test = require('tape');

test('addition', t => {
  t.equal(1 + 1, 2, '1 + 1 = 2');
  t.end();
});

test('subtraction', t => {
  t.equal(2 - 1, 1, '2 - 1 = 1');
  t.end();
});
```

### 3. Use Assertions

Tape provides a rich set of assertions:

```javascript
const test = require('tape');

test('assertions', t => {
  t.ok(true, 'this assertion passes');
  t.notOk(false, 'this assertion passes');
  t.equal(1, 1, '1 equals 1');
  t.notEqual(1, 2, '1 does not equal 2');
  t.deepEqual({ a: 1 }, { a: 1 }, 'objects are deeply equal');
  t.notDeepEqual({ a: 1 }, { a: 2 }, 'objects are not deeply equal');
  t.throws(() => { throw new Error('foo'); }, 'throws an error');
  t.doesNotThrow(() => {}, 'does not throw an error');
  t.match('hello world', /hello/, 'string matches regex');
  t.doesNotMatch('hello world', /goodbye/, 'string does not match regex');
  t.end();
});
```

### 4. Use Test Groups

Tape allows you to group tests:

```javascript
const test = require('tape');

test('group 1', t => {
  t.test('subtest 1', st => {
    st.equal(1, 1, '1 equals 1');
    st.end();
  });

  t.test('subtest 2', st => {
    st.equal(2, 2, '2 equals 2');
    st.end();
  });

  t.end();
});
```

### 5. Use Async/Await

Tape supports async/await for asynchronous tests:

```javascript
const test = require('tape');

test('async/await', async t => {
  const value = await Promise.resolve(1);
  t.equal(value, 1, 'value equals 1');
  t.end();
});
```

### 6. Use Before and After Hooks

Tape doesn't have built-in hooks, but you can create your own:

```javascript
const test = require('tape');

// Setup
let state = {};

test('setup', t => {
  state.value = 1;
  t.end();
});

test('test 1', t => {
  t.equal(state.value, 1, 'value equals 1');
  t.end();
});

test('test 2', t => {
  t.equal(state.value, 1, 'value equals 1');
  t.end();
});

test('teardown', t => {
  state = {};
  t.end();
});
```

## Troubleshooting

### Tests Not Running

- Check that Tape is installed: `npm list tape`
- Check that the test files exist: `ls test`
- Check that the test files match the pattern: `tape test/*.js`
- Check that the Tape configuration is correct: `tape --help`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list tap-spec`
- Check that the reporter is configured correctly: `tape test/*.js | tap-spec`
- Check that the output is being captured: `tape test/*.js > results.tap`

### Tests Running but Not Failing

- Check that assertions are being made: `tape test/*.js | tap-spec`
- Check that the test runner is configured to fail on assertion failures: `tape --bail test/*.js`
- Check that the test runner is configured to exit with a non-zero code on failure: `tape test/*.js`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Tape Documentation](https://github.com/substack/tape)
- [Tape API Reference](https://github.com/substack/tape#methods)
- [Tape CLI Options](https://github.com/substack/tape#command-line)
- [TAP Specification](https://testanything.org/)
- [TAP Reporters](https://github.com/substack/tape#pretty-reporters)
- [Tape Examples](https://github.com/substack/tape/tree/master/example)
