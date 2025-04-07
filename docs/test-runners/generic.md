# Generic Test Runner

The Generic test runner in Jouster allows you to run any command-line test tool that isn't directly supported. This provides flexibility to use your preferred testing framework while still benefiting from Jouster's issue tracking capabilities.

## Configuration

You can configure the Generic test runner in your Jouster configuration:

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

## Command Line Options

When using the `jouster run-tests` command, you can specify Generic test runner options:

```bash
npx jouster run-tests --test-runner generic [options] [files]
```

Available options:

| Option | Description |
| ------ | ----------- |
| `--generic-command <command>` | Command to run |
| `--generic-args <args>` | Comma-separated list of arguments to pass to the command |
| `--generic-cwd <cwd>` | Working directory |
| `--generic-env <env>` | Comma-separated list of environment variables |
| `--generic-shell` | Run in a shell |
| `--generic-timeout <timeout>` | Timeout in milliseconds |
| `--generic-output-parser <parser>` | Parser for the output (tap, json) |
| `--generic-success-exit-codes <codes>` | Comma-separated list of exit codes that indicate success |

## Usage Examples

### Basic Usage

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" test/*.js
```

### With Custom Arguments

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-args "--reporter=spec,--bail" test/*.js
```

### With Custom Environment Variables

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-env "NODE_ENV=test,DEBUG=true" test/*.js
```

### With Custom Output Parser

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-output-parser "json" test/*.js
```

### With Custom Working Directory

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-cwd "./test" test/*.js
```

### With Custom Timeout

```bash
npx jouster run-tests --test-runner generic --generic-command "tap" --generic-timeout 60000 test/*.js
```

## Integration with Jouster

Jouster integrates with the Generic test runner by:

1. Running the specified command with the provided arguments
2. Parsing the command output using the specified parser
3. Creating GitHub issues for failing tests
4. Closing GitHub issues when tests pass
5. Reopening GitHub issues when tests fail again

## Supported Output Parsers

### TAP Parser

The TAP (Test Anything Protocol) parser understands output in the TAP format:

```
TAP version 13
1..3
ok 1 - should pass
not ok 2 - should fail
  ---
  operator: equal
  expected: true
  actual:   false
  ...
ok 3 - should also pass
```

### JSON Parser

The JSON parser understands output in a JSON format:

```json
{
  "tests": [
    {
      "name": "should pass",
      "status": "passed",
      "duration": 10
    },
    {
      "name": "should fail",
      "status": "failed",
      "error": {
        "message": "Expected true to be false",
        "stack": "Error: Expected true to be false\n    at Object.<anonymous> (test.js:10:10)"
      },
      "duration": 20
    },
    {
      "name": "should also pass",
      "status": "passed",
      "duration": 15
    }
  ],
  "summary": {
    "total": 3,
    "passed": 2,
    "failed": 1,
    "duration": 45
  }
}
```

### Custom Parser

You can provide a custom parser function in your Jouster configuration:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'custom-test-runner',
      parseTestResults: (output) => {
        // Parse the output and return an array of test results
        const results = [];
        
        // Example: Parse a custom format
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.includes('PASS:')) {
            const name = line.replace('PASS:', '').trim();
            results.push({
              testName: name,
              status: 'passed'
            });
          } else if (line.includes('FAIL:')) {
            const name = line.replace('FAIL:', '').trim();
            results.push({
              testName: name,
              status: 'failed',
              errorMessage: 'Test failed'
            });
          }
        }
        
        return results;
      }
    }
  }
};
```

## Examples for Popular Test Frameworks

### AVA

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'ava',
      args: ['--verbose'],
      outputParser: 'tap'
    }
  }
};
```

### Tape

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'tape',
      args: ['test/*.js'],
      outputParser: 'tap'
    }
  }
};
```

### Mocha

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'mocha',
      args: ['--reporter=json'],
      outputParser: 'json'
    }
  }
};
```

### Jest

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'jest',
      args: ['--json'],
      outputParser: 'json'
    }
  }
};
```

### Jasmine

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'jasmine',
      args: ['--reporter=json'],
      outputParser: 'json'
    }
  }
};
```

## Best Practices

### 1. Use JSON Output When Possible

JSON output is easier to parse and provides more structured information:

```bash
npx jouster run-tests --test-runner generic --generic-command "mocha" --generic-args "--reporter=json" test/*.js
```

### 2. Set Appropriate Timeouts

Set appropriate timeouts for your tests, especially for long-running tests:

```bash
npx jouster run-tests --test-runner generic --generic-command "mocha" --generic-timeout 60000 test/*.js
```

### 3. Use Environment Variables for Configuration

Use environment variables to configure your test runner:

```bash
npx jouster run-tests --test-runner generic --generic-command "mocha" --generic-env "NODE_ENV=test,DEBUG=true" test/*.js
```

### 4. Use a Custom Parser for Complex Output

If your test runner produces complex output, use a custom parser:

```javascript
module.exports = {
  // ... other configuration
  testRunnerType: 'generic',
  testRunnerOptions: {
    generic: {
      command: 'custom-test-runner',
      parseTestResults: (output) => {
        // Custom parsing logic
        return parsedResults;
      }
    }
  }
};
```

### 5. Use Shell for Complex Commands

If your command requires shell features like pipes or redirects, use the shell option:

```bash
npx jouster run-tests --test-runner generic --generic-command "mocha test/*.js | tee output.log" --generic-shell
```

## Troubleshooting

### Command Not Found

- Check that the command is installed: `which <command>`
- Check that the command is in your PATH: `echo $PATH`
- Try using the full path to the command: `--generic-command "/path/to/command"`

### Parser Not Working

- Check that the output format matches the expected format for the parser
- Try using a different parser: `--generic-output-parser json`
- Try using a custom parser in your Jouster configuration

### Tests Not Failing

- Check that the command is returning a non-zero exit code for failures
- Check that the parser is correctly identifying failing tests
- Try setting custom success exit codes: `--generic-success-exit-codes 0,1`

### Tests Not Creating Issues

- Check that issue tracking is enabled: `jouster --config`
- Check that the GitHub client is configured correctly: `jouster --check-github`
- Check that the test runner is parsing test results correctly: `jouster --debug`

## Further Reading

- [Test Anything Protocol (TAP)](https://testanything.org/)
- [JSON Test Reporter Format](https://github.com/substack/tape#reporters)
- [Mocha Reporters](https://mochajs.org/#reporters)
- [Jest CLI Options](https://jestjs.io/docs/cli)
- [AVA CLI Options](https://github.com/avajs/ava/blob/main/docs/05-command-line.md)
- [Tape CLI Options](https://github.com/substack/tape#command-line)
