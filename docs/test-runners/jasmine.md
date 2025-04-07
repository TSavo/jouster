# Jasmine Test Runner

[Jasmine](https://jasmine.github.io/) is a behavior-driven development framework for testing JavaScript code. Jouster provides seamless integration with Jasmine, allowing you to track test failures and manage issues automatically.

## Installation

To use Jasmine with Jouster, you need to install Jasmine:

```bash
npm install --save-dev jasmine
```

You may also want to initialize Jasmine:

```bash
npx jasmine init
```

## Configuration

You can configure the Jasmine test runner in your Jouster configuration:

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

## Command Line Options

When using the `jouster run-tests` command, you can specify Jasmine-specific options:

```bash
npx jouster run-tests --test-runner jasmine [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--jasmine-random <boolean>` | Whether to randomize test order |
| `--jasmine-fail-fast` | Stop after the first test failure |
| `--jasmine-timeout <ms>` | Default timeout for tests in milliseconds |
| `--jasmine-config-path <path>` | Path to Jasmine configuration file |
| `--jasmine-seed <seed>` | Seed for random test order |
| `--jasmine-color <boolean>` | Whether to use colors in output |
| `--jasmine-reporter <reporter>` | Reporter to use |
| `--jasmine-filter <pattern>` | Pattern to filter specs |
| `--jasmine-stop-spec-on-expectation-failure` | Stop a spec on the first expectation failure |
| `--jasmine-hide-disabled` | Hide disabled specs |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner jasmine
```

### With Random Disabled

```bash
npx jouster run-tests --test-runner jasmine --jasmine-random false
```

### With Specific Configuration

```bash
npx jouster run-tests --test-runner jasmine --jasmine-config-path ./custom-jasmine.json
```

### With Specific Seed

```bash
npx jouster run-tests --test-runner jasmine --jasmine-seed 12345
```

### With Fail Fast

```bash
npx jouster run-tests --test-runner jasmine --jasmine-fail-fast
```

### With Filter

```bash
npx jouster run-tests --test-runner jasmine --jasmine-filter "should handle errors"
```

## Integration with Jouster

Jouster integrates with Jasmine by:

1. Running Jasmine tests with the specified configuration
2. Parsing Jasmine test results to identify failing tests
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Best Practices

### 1. Use Jasmine Configuration File

Instead of specifying all options on the command line, use a Jasmine configuration file:

```json
// spec/support/jasmine.json
{
  "spec_dir": "spec",
  "spec_files": [
    "**/*[sS]pec.js"
  ],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
}
```

Then reference it in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'jasmine',
  testRunnerOptions: {
    jasmine: {
      configPath: './spec/support/jasmine.json'
    }
  }
};
```

### 2. Use Describe and It

Jasmine uses `describe` and `it` for organizing tests:

```javascript
describe('Calculator', () => {
  it('should add two numbers', () => {
    expect(1 + 1).toBe(2);
  });

  it('should subtract two numbers', () => {
    expect(2 - 1).toBe(1);
  });
});
```

### 3. Use Matchers

Jasmine provides a rich set of matchers for making assertions:

```javascript
describe('Matchers', () => {
  it('should demonstrate matchers', () => {
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
    expect(jasmine.any(Number)).toEqual(1);
    expect(jasmine.objectContaining({ a: 1 })).toEqual({ a: 1, b: 2 });
  });
});
```

### 4. Use Spies

Jasmine provides spies for mocking functions:

```javascript
describe('Spies', () => {
  it('should demonstrate spies', () => {
    const calculator = {
      add: (a, b) => a + b
    };

    spyOn(calculator, 'add').and.returnValue(42);

    expect(calculator.add(1, 2)).toBe(42);
    expect(calculator.add).toHaveBeenCalled();
    expect(calculator.add).toHaveBeenCalledWith(1, 2);
    expect(calculator.add).toHaveBeenCalledTimes(1);
  });
});
```

### 5. Use Hooks

Jasmine provides hooks for setup and teardown:

```javascript
describe('Hooks', () => {
  let value;

  beforeAll(() => {
    // This runs once before all specs
    console.log('beforeAll');
  });

  afterAll(() => {
    // This runs once after all specs
    console.log('afterAll');
  });

  beforeEach(() => {
    // This runs before each spec
    value = 1;
    console.log('beforeEach');
  });

  afterEach(() => {
    // This runs after each spec
    value = 0;
    console.log('afterEach');
  });

  it('should have value 1', () => {
    expect(value).toBe(1);
  });

  it('should still have value 1', () => {
    expect(value).toBe(1);
  });
});
```

### 6. Use Async/Await

Jasmine supports async/await for asynchronous tests:

```javascript
describe('Async', () => {
  it('should support async/await', async () => {
    const value = await Promise.resolve(1);
    expect(value).toBe(1);
  });
});
```

### 7. Use Custom Matchers

Jasmine allows you to create custom matchers:

```javascript
// spec/helpers/custom-matchers.js
beforeEach(() => {
  jasmine.addMatchers({
    toBeEven: () => {
      return {
        compare: (actual) => {
          const result = {
            pass: actual % 2 === 0
          };
          if (result.pass) {
            result.message = `Expected ${actual} not to be even`;
          } else {
            result.message = `Expected ${actual} to be even`;
          }
          return result;
        }
      };
    }
  });
});

// spec/even-spec.js
describe('Custom Matchers', () => {
  it('should check if a number is even', () => {
    expect(2).toBeEven();
    expect(3).not.toBeEven();
  });
});
```

## Troubleshooting

### Tests Not Running

- Check that Jasmine is installed: `npm list jasmine`
- Check that the test files exist: `ls spec`
- Check that the test files match the pattern: `jasmine --filter="should handle errors"`
- Check that the Jasmine configuration is correct: `jasmine --config=./spec/support/jasmine.json`

### Tests Running but Not Reporting

- Check that the reporter is installed: `npm list jasmine-spec-reporter`
- Check that the reporter is configured correctly: `jasmine --reporter=jasmine-spec-reporter`
- Check that the output is being captured: `jasmine > results.txt`

### Tests Running but Not Failing

- Check that assertions are being made: `jasmine --verbose`
- Check that the test runner is configured to fail on assertion failures: `jasmine --fail-fast`
- Check that the test runner is configured to exit with a non-zero code on failure: `jasmine`

### Tests Running but Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Jasmine Documentation](https://jasmine.github.io/pages/docs_home.html)
- [Jasmine API Reference](https://jasmine.github.io/api/edge/global)
- [Jasmine CLI Options](https://jasmine.github.io/setup/nodejs.html)
- [Jasmine Configuration](https://jasmine.github.io/setup/nodejs.html#configuration)
- [Jasmine Matchers](https://jasmine.github.io/api/edge/matchers.html)
- [Jasmine Spies](https://jasmine.github.io/api/edge/Spy.html)
