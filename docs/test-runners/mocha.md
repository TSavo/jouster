# Mocha Test Runner

[Mocha](https://mochajs.org/) is a feature-rich JavaScript test framework running on Node.js and in the browser. Jouster provides seamless integration with Mocha, allowing you to track test failures and manage issues automatically.

## Installation

To use Mocha with Jouster, you need to install Mocha:

```bash
npm install --save-dev mocha
```

For TypeScript support, you may also want to install ts-node:

```bash
npm install --save-dev ts-node
```

## Configuration

You can configure the Mocha test runner in your Jouster configuration:

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

## Command Line Options

When using the `jouster run-tests` command, you can specify Mocha-specific options:

```bash
npx jouster run-tests --test-runner mocha [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--mocha-ui <ui>` | Test interface (bdd, tdd, qunit, exports) |
| `--mocha-timeout <timeout>` | Test timeout in milliseconds |
| `--mocha-reporters <reporters>` | Comma-separated list of reporters to use |
| `--mocha-require <modules>` | Comma-separated list of modules to require |
| `--mocha-bail` | Bail after the first test failure |
| `--mocha-colors` | Use colors in output |
| `--mocha-recursive` | Look for tests in subdirectories |
| `--mocha-grep <pattern>` | Pattern to match test descriptions |
| `--mocha-fgrep <string>` | String to match test descriptions |
| `--mocha-invert` | Invert grep/fgrep matches |
| `--mocha-slow <ms>` | Threshold for slow tests in milliseconds |
| `--mocha-retries <n>` | Number of times to retry failed tests |
| `--mocha-forbid-only` | Fail if tests are marked as only |
| `--mocha-forbid-pending` | Fail if tests are pending |
| `--mocha-full-trace` | Show full stack traces |
| `--mocha-exit` | Force Mocha to quit after tests complete |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner mocha test/**/*.js
```

### With TDD Interface

```bash
npx jouster run-tests --test-runner mocha --mocha-ui tdd test/**/*.js
```

### With TypeScript Support

```bash
npx jouster run-tests --test-runner mocha --mocha-require ts-node/register test/**/*.ts
```

### With Specific Reporter

```bash
npx jouster run-tests --test-runner mocha --mocha-reporters dot test/**/*.js
```

### With Grep

```bash
npx jouster run-tests --test-runner mocha --mocha-grep "should handle errors" test/**/*.js
```

### With Bail

```bash
npx jouster run-tests --test-runner mocha --mocha-bail test/**/*.js
```

### With Recursive

```bash
npx jouster run-tests --test-runner mocha --mocha-recursive test
```

## Integration with Jouster

Jouster integrates with Mocha by:

1. Running Mocha tests with the specified configuration
2. Parsing Mocha test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Mocha Configuration File

Instead of specifying all options on the command line, use a Mocha configuration file:

```javascript
// .mocharc.js
module.exports = {
  ui: 'bdd',
  timeout: 5000,
  require: ['ts-node/register'],
  recursive: true,
  reporter: 'spec',
  colors: true,
  exit: true
};
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'mocha',
  testRunnerOptions: {
    mocha: {
      // Mocha will automatically use .mocharc.js
    }
  }
};
```

### 2. Use Assertion Libraries

Mocha doesn't come with an assertion library, so you'll need to use one. Popular choices include:

- [Chai](https://www.chaijs.com/): `npm install --save-dev chai`
- [Assert](https://nodejs.org/api/assert.html): Built into Node.js
- [Expect.js](https://github.com/Automattic/expect.js): `npm install --save-dev expect.js`

Example with Chai:

```javascript
const { expect } = require('chai');

describe('Calculator', () => {
  it('should add two numbers', () => {
    expect(1 + 2).to.equal(3);
  });
});
```

### 3. Use Mocha Hooks

Mocha provides hooks for setup and teardown:

```javascript
describe('Database', () => {
  before(() => {
    // Run once before all tests
    db.connect();
  });
  
  after(() => {
    // Run once after all tests
    db.disconnect();
  });
  
  beforeEach(() => {
    // Run before each test
    db.reset();
  });
  
  afterEach(() => {
    // Run after each test
    db.clear();
  });
  
  it('should save data', () => {
    // Test code
  });
});
```

### 4. Use Mocha Reporters

Mocha supports various reporters for different output formats:

```bash
npx jouster run-tests --test-runner mocha --mocha-reporters spec,json test/**/*.js
```

Popular reporters include:

- `spec`: Hierarchical view of test cases
- `dot`: Minimal output with dots
- `nyan`: Nyan cat!
- `json`: JSON output
- `markdown`: Markdown output
- `html`: HTML output

## Troubleshooting

### Tests Not Running

- Check that Mocha is installed: `npm list mocha`
- Check that the test files exist: `ls test`
- Check that the test files match the pattern: `mocha --list-files`
- Check that the Mocha configuration is correct: `mocha --config`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list mocha-junit-reporter`
- Check that the reporter is configured correctly: `mocha --config`
- Check that the output is being captured: `mocha --reporter json > results.json`

### Tests Running but Not Failing

- Check that assertions are being made: `mocha --verbose`
- Check that the test runner is configured to fail on assertion failures: `mocha --bail`
- Check that the test runner is configured to exit with a non-zero code on failure: `mocha --exit`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Mocha Documentation](https://mochajs.org/#getting-started)
- [Mocha API Reference](https://mochajs.org/api/)
- [Mocha CLI Options](https://mochajs.org/#command-line-usage)
- [Mocha Configuration](https://mochajs.org/#configuring-mocha-nodejs)
- [Chai Documentation](https://www.chaijs.com/guide/)
- [Chai API Reference](https://www.chaijs.com/api/)
